import { Injectable } from '@nestjs/common'
import { PerformanceRepository } from 'src/routes/performance/performance.repo'
import envConfig from 'src/shared/config'
import { TaskStatus } from 'src/shared/constants/task.constant'
import { SuccessResponse } from 'src/shared/sucess'

@Injectable()
export class PerformanceService {
  constructor(private readonly performanceRepository: PerformanceRepository) {}

  async evaluatePerformanceByAI(userId: string, dto: any) {
    // 1) Lấy dữ liệu thô từ DB
    const [user, overall, perfData] = await Promise.all([
      this.performanceRepository.getUserInfo(userId),
      this.performanceRepository.getOverallPerformance(userId),
      this.performanceRepository.getPerformanceData(userId, dto),
    ])

    // 1.1) Lấy tài liệu liên quan (notes, comment, review)
    const relatedDocs = await this.performanceRepository.getRelatedDocuments({ userId, ...dto })

    // 2) Tổng hợp số liệu cơ bản
    const totalCompleted = perfData.reduce((s, d) => s + (d.task_completed ?? 0), 0)
    const totalDelay = perfData.reduce((s, d) => s + (d.task_delay_count ?? 0), 0)
    const avgBurnout =
      perfData.length > 0 ? perfData.reduce((s, d) => s + (d.burnout_index ?? 0), 0) / perfData.length : 0
    const avgQuality =
      perfData.length > 0 ? perfData.reduce((s, d) => s + (d.quality_score ?? 0), 0) / perfData.length : 0

    // 3) Tính toán các chỉ số hiển thị
    const workPerformance = [
      { label: 'Completed', value: totalCompleted },
      { label: 'Delay', value: totalDelay },
      { label: 'Quality', value: Math.round(avgQuality * 100) / 100 },
    ]

    // Stress rate demo: dựa trên burnout trung bình + tỉ lệ delay
    const delayRatio = totalCompleted + totalDelay > 0 ? totalDelay / (totalCompleted + totalDelay) : 0
    const stressScore = 0.6 * (avgBurnout / 10) + 0.4 * delayRatio // chuẩn hóa 0..1 (giả định burnout 0..10)
    let stressRateLabel = 'Low'
    if (stressScore >= 0.66) stressRateLabel = 'High'
    else if (stressScore >= 0.33) stressRateLabel = 'Medium'
    const stressRate = [{ label: stressRateLabel, value: Math.round(stressScore * 100) / 100 }]

    // Chuyển stressAnalyzing thành mảng object cho đúng schema
    let analyzingText = ''
    if (stressRateLabel === 'High') {
      analyzingText = 'Chỉ số burnout và tỉ lệ trễ cao → ưu tiên cân bằng workload, rà soát phụ thuộc và hỗ trợ.'
    } else if (stressRateLabel === 'Medium') {
      analyzingText = 'Có tín hiệu căng thẳng trung bình → theo dõi xu hướng, tối ưu phân bổ task.'
    } else {
      analyzingText = 'Ổn định → duy trì nhịp làm việc hiện tại.'
    }
    // Để data là mảng rỗng vì không có số liệu chi tiết
    const stressAnalyzing = [{ label: analyzingText, data: [] }]

    // 4) Gọi AI để tạo summary (không suy đoán ngoài dữ liệu, có tài liệu liên quan)
    const aiSummary = await this.callAIApiForSummary(
      {
        id: user?.id,
        name: user?.name ?? '',
        department: user?.department?.name ?? '',
        status: user?.status ?? 'Inactive',
        created_at: user?.created_at,
      },
      overall,
      perfData,
      envConfig.GPT_API_KEY,
      {
        totals: { totalCompleted, totalDelay, avgBurnout, avgQuality, delayRatio },
      },
      relatedDocs,
    )

    // 5) Trả về DTO cho dashboard
    const joinedISO = user?.created_at ? new Date(user.created_at).toISOString() : ''

    const position = 'Software Engineer'

    return SuccessResponse('Evaluate performance successfully', {
      summary: aiSummary,
      stressRate,
      workPerformance,
      stressAnalyzing,
      status: user?.status ?? 'Inactive',
      joined: joinedISO,
      name: user?.name ?? '',
      position,
      department: user?.department?.name ?? '',
    })
  }

  async getProjectOverview(projectId: string) {
    // Lấy thông tin dự án
    const project = await this.performanceRepository.getProjectById(projectId)
    if (!project) return { message: 'Project not found', data: null }

    // Lấy danh sách task của dự án
    const tasks = await this.performanceRepository.getTasksByProjectId(projectId)

    // Thống kê số lượng task theo trạng thái
    const totalTasks = tasks.length
    const completedTasks = tasks.filter((t) => t.status === TaskStatus.completed).length
    const overdueTasks = tasks.filter((t) => t.status === TaskStatus.overdued).length
    const inProgressTasks = tasks.filter(
      (t) => t.status === TaskStatus.doing || t.status === TaskStatus.reviewing || t.status === TaskStatus.feedbacked,
    ).length
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    // Tính process dựa vào completionRate (giả sử process là completionRate)
    const process = completionRate

    // Lưu process vào project
    await this.performanceRepository.updateProjectProcess(projectId, process)

    return {
      message: 'Project overview fetched successfully',
      data: {
        project: {
          id: project.id,
          name: project.name,
          description: project.description,
          start_date: project.start_date,
          end_date: project.end_date,
          process,
          team_size: project.team_size,
          status: project.status,
        },
        totalTasks,
        completedTasks,
        overdueTasks,
        inProgressTasks,
        completionRate,
      },
    }
  }

  async getProjectMembers(projectId: string) {
    const members = await this.performanceRepository.getProjectMembers(projectId)
    const tasks = await this.performanceRepository.getTasksByProjectId(projectId)

    const memberStats = await Promise.all(
      members.map(async (member) => {
        const assignedTasks = tasks.filter((t) => t.assignees.some((a) => a.user_id === member.user.id))
        const completedTasks = assignedTasks.filter((t) => t.status === 'completed').length
        const overdueTasks = assignedTasks.filter((t) => t.status === 'overdued').length
        // Lấy điểm đánh giá trung bình từ PerformanceData
        const perfData = await this.performanceRepository.getUserProjectPerformanceData(member.user.id, projectId)
        const avgQuality =
          perfData.length > 0 ? perfData.reduce((s, d) => s + (d.quality_score ?? 0), 0) / perfData.length : null
        return {
          id: member.user.id,
          name: member.user.name,
          avatar_url: member.user.avatar_url,
          job_title: member.role,
          status: member.user.status,
          assignedTasks: assignedTasks.length,
          completedTasks,
          overdueTasks,
          avgQuality,
        }
      }),
    )
    return { message: 'Project members fetched successfully', data: memberStats }
  }

  /**
   * Lấy KPI team dự án: tỉ lệ hoàn thành, tiến độ, số task hoàn thành/in progress
   */
  async getProjectKpi(projectId: string) {
    // Lấy thông tin dự án
    const project = await this.performanceRepository.getProjectById(projectId)
    if (!project) return { message: 'Project not found', data: null }

    // Lấy danh sách task của dự án
    const tasks = await this.performanceRepository.getTasksByProjectId(projectId)
    const totalTasks = tasks.length
    const completedTasks = tasks.filter((t) => t.status === 'completed').length
    const inProgressTasks = tasks.filter(
      (t) => t.status === 'doing' || t.status === 'reviewing' || t.status === 'feedbacked',
    ).length
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    // Tổng giá trị KPI: demo lấy process * số task hoàn thành (có thể thay đổi theo business)
    const kpiValue = (project.process ?? 0) * completedTasks

    return {
      message: 'Project KPI fetched successfully',
      data: {
        projectId,
        process: project.process,
        completionRate,
        completedTasks,
        inProgressTasks,
        kpiValue,
      },
    }
  }

  /**
   * Lấy tóm tắt AI về hiệu suất dự án trong 7 ngày gần nhất (hoặc theo khoảng thời gian)
   */
  async getProjectAIAnalysis({
    projectId,
    fromDate,
    toDate,
  }: {
    projectId: string
    fromDate?: string
    toDate?: string
  }) {
    // Lấy danh sách thành viên dự án
    const members = await this.performanceRepository.getProjectMembers(projectId)
    // Lấy performance data của tất cả thành viên trong dự án
    const perfDataList = await Promise.all(
      members.map((member) => this.performanceRepository.getPerformanceData(member.user.id, { fromDate, toDate })),
    )
    // Gộp dữ liệu lại
    const allPerfData = perfDataList.flat()
    // Lấy tổng hợp các chỉ số
    const totalCompleted = allPerfData.reduce((s, d) => s + (d.task_completed ?? 0), 0)
    const totalDelay = allPerfData.reduce((s, d) => s + (d.task_delay_count ?? 0), 0)
    const avgBurnout =
      allPerfData.length > 0 ? allPerfData.reduce((s, d) => s + (d.burnout_index ?? 0), 0) / allPerfData.length : 0
    const avgQuality =
      allPerfData.length > 0 ? allPerfData.reduce((s, d) => s + (d.quality_score ?? 0), 0) / allPerfData.length : 0

    // Gọi AI để tạo summary (có thể dùng lại callAIApiForSummary hoặc tuỳ chỉnh prompt)
    const aiSummary = await this.callAIApiForSummary(
      { name: 'Project', department: '', status: '', created_at: '' },
      null,
      allPerfData,
      envConfig.GPT_API_KEY,
      {
        totals: { totalCompleted, totalDelay, avgBurnout, avgQuality, delayRatio: 0 },
      },
      [],
    )
    return {
      message: 'Project AI analysis fetched successfully',
      data: {
        summary: aiSummary,
        totalCompleted,
        totalDelay,
        avgBurnout,
        avgQuality,
      },
    }
  }

  private async callAIApiForSummary(
    user: any,
    overall: any,
    perfData: any[],
    apiKey: string,
    computed?: {
      totals: {
        totalCompleted: number
        totalDelay: number
        avgBurnout: number
        avgQuality: number
        delayRatio: number
      }
    },
    relatedDocs?: string[],
  ): Promise<string> {
    if (!apiKey) {
      return 'Thiếu API key cho GPT. Vui lòng cấu hình GPT_API_KEY.'
    }

    const recentPerf = perfData.slice(-12).map((d) => ({
      period: d.period ?? d.month ?? d.week ?? '',
      completed: d.task_completed ?? 0,
      delay: d.task_delay_count ?? 0,
      quality: d.quality_score ?? null,
      burnout: d.burnout_index ?? null,
    }))

    const prompt = [
      'Bạn là chuyên gia HR/People Analytics.',
      'Dựa DUY NHẤT trên dữ liệu dưới đây, hãy viết một đoạn đánh giá ngắn gọn (3–6 câu), súc tích, không suy đoán ngoài dữ liệu.',
      '',
      '[THÔNG TIN NHÂN SỰ]',
      `- Tên: ${user?.name ?? ''}`,
      `- Phòng ban: ${user?.department ?? ''}`,
      `- Trạng thái: ${user?.status ?? 'Inactive'}`,
      `- Ngày vào: ${user?.created_at ? new Date(user.created_at).toISOString() : 'N/A'}`,
      '',
      '[TỔNG HỢP]',
      `- Tổng task hoàn thành: ${computed?.totals.totalCompleted ?? 0}`,
      `- Tổng task trễ: ${computed?.totals.totalDelay ?? 0}`,
      `- Burnout TB: ${Math.round((computed?.totals.avgBurnout ?? 0) * 100) / 100}`,
      `- Quality TB: ${Math.round((computed?.totals.avgQuality ?? 0) * 100) / 100}`,
      `- Tỉ lệ trễ: ${Math.round((computed?.totals.delayRatio ?? 0) * 100)}%`,
      '',
      '[THEO THỜI GIAN - GẦN NHẤT]',
      JSON.stringify(recentPerf, null, 2),
      '',
      '[TÀI LIỆU LIÊN QUAN]',
      ...(relatedDocs && relatedDocs.length > 0
        ? relatedDocs.map((d, i) => `- ${d}`)
        : ['(Không có tài liệu liên quan)']),
      '',
      'Yêu cầu:',
      '- Chỉ sử dụng thông tin đã cho.',
      '- Nếu dữ liệu thiếu, hãy nói rõ là thiếu.',
      '- Nếu toàn bộ chỉ số = 0 (Completed, Delay, Burnout, Quality) thì hãy kết luận đây là nhân viên mới (new joiner) và nêu rõ dữ liệu chưa đủ để đánh giá xu hướng.',
      '- Không nêu tên cá nhân khác hoặc suy đoán nguyên nhân ngoài dữ liệu.',
    ].join('\n')

    const url = 'https://api.openai.com/v1/chat/completions'
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000) // 15s

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: envConfig.OPENAI_MODEL || 'gpt-4',
          temperature: 0.2,
          messages: [
            { role: 'system', content: 'You are a helpful HR/People Analytics assistant.' },
            { role: 'user', content: prompt },
          ],
        }),
        signal: controller.signal,
      })

      clearTimeout(timeout)
      let data: any
      try {
        data = await response.json()
      } catch {
        // Khi backend trả về non-JSON (hiếm)
        return `Không parse được phản hồi AI. Raw: ${await response.text()}`
      }

      if (!response.ok) {
        // Trả về thông báo lỗi cụ thể để dev dễ theo dõi
        const msg = data?.error?.message || `OpenAI API error: status ${response.status}, body: ${JSON.stringify(data)}`
        return msg
      }

      // OpenAI API: data.choices[0].message.content
      const aiText = data?.choices?.[0]?.message?.content || 'Không nhận được phản hồi tóm tắt từ AI.'
      return aiText.trim()
    } catch (e) {
      const err = e as Error
      if (err.name === 'AbortError') return 'Không thể kết nối AI: yêu cầu bị timeout.'
      return 'Không thể kết nối AI: ' + err.message
    } finally {
      clearTimeout(timeout)
    }
  }

  /**
   * Lấy thống kê chi tiết các loại task: số lượng theo từng trạng thái (completed, in progress, overdue, v.v.), tỉ lệ thay đổi so với tuần trước
   */
  async getProjectTasksStats(projectId: string) {
    // Lấy danh sách task của dự án
    const tasks = await this.performanceRepository.getTasksByProjectId(projectId)

    // Đếm số lượng theo từng trạng thái
    const statusCounts: Record<string, number> = {}
    for (const t of tasks) {
      statusCounts[t.status] = (statusCounts[t.status] || 0) + 1
    }

    // Lấy ngày hiện tại và ngày đầu tuần trước
    const now = new Date()
    const startOfThisWeek = new Date(now)
    startOfThisWeek.setDate(now.getDate() - now.getDay())
    const startOfLastWeek = new Date(startOfThisWeek)
    startOfLastWeek.setDate(startOfThisWeek.getDate() - 7)
    const endOfLastWeek = new Date(startOfThisWeek)

    // Lấy task tuần trước
    const tasksLastWeek = tasks.filter((t) => {
      if (!t.updated_at) return false
      const updated = new Date(t.updated_at)
      return updated >= startOfLastWeek && updated < endOfLastWeek
    })
    const statusCountsLastWeek: Record<string, number> = {}
    for (const t of tasksLastWeek) {
      statusCountsLastWeek[t.status] = (statusCountsLastWeek[t.status] || 0) + 1
    }

    // Tính tỉ lệ thay đổi so với tuần trước
    const statusChangeRatio: Record<string, number> = {}
    for (const status in statusCounts) {
      const prev = statusCountsLastWeek[status] || 0
      const curr = statusCounts[status] || 0
      statusChangeRatio[status] = prev === 0 ? (curr > 0 ? 1 : 0) : (curr - prev) / prev
    }

    return {
      message: 'Project tasks stats fetched successfully',
      data: {
        statusCounts,
        statusChangeRatio,
      },
    }
  }

  // New performance metrics methods

  /**
   * Calculate task completion rate for a user
   * Formula: completed tasks / total tasks assigned to user
   */
  async getTaskCompletionRate(userId: string, params: { period?: string; fromDate?: string; toDate?: string }) {
    const { period = 'monthly', fromDate, toDate } = params
    
    // Calculate date range for current period
    const { start: currentStart, end: currentEnd } = this.calculatePeriodDates(period, fromDate, toDate)
    
    // Get tasks for current period
    const tasks = await this.performanceRepository.getUserTasks(userId, currentStart, currentEnd)
    const completedTasks = tasks.filter(t => t.status === 'completed').length
    const totalTasks = tasks.length
    
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
    
    // Get previous period for comparison
    const { start: prevStart, end: prevEnd } = this.calculatePreviousPeriodDates(period, currentStart)
    const prevTasks = await this.performanceRepository.getUserTasks(userId, prevStart, prevEnd)
    const prevCompletedTasks = prevTasks.filter(t => t.status === 'completed').length
    const prevTotalTasks = prevTasks.length
    const previousPeriodRate = prevTotalTasks > 0 ? (prevCompletedTasks / prevTotalTasks) * 100 : 0
    
    const changePercentage = previousPeriodRate > 0 ? 
      ((completionRate - previousPeriodRate) / previousPeriodRate) * 100 : 0

    return SuccessResponse('Task completion rate fetched successfully', {
      userId,
      period: `${currentStart.toISOString().split('T')[0]} to ${currentEnd.toISOString().split('T')[0]}`,
      totalTasks,
      completedTasks,
      completionRate: Math.round(completionRate * 100) / 100,
      previousPeriodRate: Math.round(previousPeriodRate * 100) / 100,
      changePercentage: Math.round(changePercentage * 100) / 100,
    })
  }

  /**
   * Calculate deadline adherence rate 
   * Formula: tasks completed on time / total completed tasks
   */
  async getDeadlineAdherence(userId: string, params: { period?: string; fromDate?: string; toDate?: string }) {
    const { period = 'monthly', fromDate, toDate } = params
    
    const { start: currentStart, end: currentEnd } = this.calculatePeriodDates(period, fromDate, toDate)
    
    // Get completed tasks for the period
    const completedTasks = await this.performanceRepository.getUserCompletedTasks(userId, currentStart, currentEnd)
    
    const totalTasks = completedTasks.length
    const onTimeTasks = completedTasks.filter(task => {
      if (!task.completed_at || !task.due_at) return false
      return new Date(task.completed_at) <= new Date(task.due_at)
    }).length
    
    const adherenceRate = totalTasks > 0 ? (onTimeTasks / totalTasks) * 100 : 0
    
    // Calculate average delay days for overdue tasks
    const overdueTasks = completedTasks.filter(task => {
      if (!task.completed_at || !task.due_at) return false
      return new Date(task.completed_at) > new Date(task.due_at)
    })
    
    const totalDelayDays = overdueTasks.reduce((sum, task) => {
      if (!task.completed_at || !task.due_at) return sum
      const delayMs = new Date(task.completed_at).getTime() - new Date(task.due_at).getTime()
      return sum + (delayMs / (1000 * 60 * 60 * 24)) // Convert to days
    }, 0)
    
    const averageDelayDays = overdueTasks.length > 0 ? totalDelayDays / overdueTasks.length : 0
    
    // Get previous period for comparison
    const { start: prevStart, end: prevEnd } = this.calculatePreviousPeriodDates(period, currentStart)
    const prevCompletedTasks = await this.performanceRepository.getUserCompletedTasks(userId, prevStart, prevEnd)
    const prevTotalTasks = prevCompletedTasks.length
    const prevOnTimeTasks = prevCompletedTasks.filter(task => {
      if (!task.completed_at || !task.due_at) return false
      return new Date(task.completed_at) <= new Date(task.due_at)
    }).length
    const previousPeriodRate = prevTotalTasks > 0 ? (prevOnTimeTasks / prevTotalTasks) * 100 : 0

    return SuccessResponse('Deadline adherence fetched successfully', {
      userId,
      period: `${currentStart.toISOString().split('T')[0]} to ${currentEnd.toISOString().split('T')[0]}`,
      totalTasks,
      onTimeTasks,
      adherenceRate: Math.round(adherenceRate * 100) / 100,
      averageDelayDays: Math.round(averageDelayDays * 100) / 100,
      previousPeriodRate: Math.round(previousPeriodRate * 100) / 100,
    })
  }

  /**
   * Calculate work hours compliance using focus logs as proxy
   * Formula: hours worked in standard schedule / total hours worked
   */
  async getWorkHoursCompliance(userId: string, params: { period?: string; fromDate?: string; toDate?: string }) {
    const { period = 'monthly', fromDate, toDate } = params
    
    const { start: currentStart, end: currentEnd } = this.calculatePeriodDates(period, fromDate, toDate)
    
    // Get focus logs for the period (using as proxy for working hours)
    const focusLogs = await this.performanceRepository.getUserWorkingHours(userId, currentStart, currentEnd)
    
    const totalWorkingHours = focusLogs.reduce((sum, log) => sum + (log.focused_minutes / 60), 0)
    
    // Assume standard working hours: 8 hours/day, 5 days/week
    const workingDays = this.calculateWorkingDays(currentStart, currentEnd)
    const standardHours = workingDays * 8
    
    const complianceRate = standardHours > 0 ? Math.min((totalWorkingHours / standardHours) * 100, 100) : 0
    const overtimeHours = Math.max(totalWorkingHours - standardHours, 0)
    
    // Get previous period for comparison
    const { start: prevStart, end: prevEnd } = this.calculatePreviousPeriodDates(period, currentStart)
    const prevFocusLogs = await this.performanceRepository.getUserWorkingHours(userId, prevStart, prevEnd)
    const prevTotalWorkingHours = prevFocusLogs.reduce((sum, log) => sum + (log.focused_minutes / 60), 0)
    const prevWorkingDays = this.calculateWorkingDays(prevStart, prevEnd)
    const prevStandardHours = prevWorkingDays * 8
    const previousPeriodRate = prevStandardHours > 0 ? Math.min((prevTotalWorkingHours / prevStandardHours) * 100, 100) : 0

    return SuccessResponse('Work hours compliance fetched successfully', {
      userId,
      period: `${currentStart.toISOString().split('T')[0]} to ${currentEnd.toISOString().split('T')[0]}`,
      totalWorkingHours: Math.round(totalWorkingHours * 100) / 100,
      standardHours: Math.round(standardHours * 100) / 100,
      complianceRate: Math.round(complianceRate * 100) / 100,
      overtimeHours: Math.round(overtimeHours * 100) / 100,
      previousPeriodRate: Math.round(previousPeriodRate * 100) / 100,
    })
  }

  /**
   * Calculate average time to completion
   * Formula: average time from task start to completion
   */
  async getTimeToCompletion(userId: string, params: { period?: string; fromDate?: string; toDate?: string }) {
    const { period = 'monthly', fromDate, toDate } = params
    
    const { start: currentStart, end: currentEnd } = this.calculatePeriodDates(period, fromDate, toDate)
    
    // Get completed tasks for the period
    const completedTasks = await this.performanceRepository.getUserCompletedTasks(userId, currentStart, currentEnd)
    
    const validTasks = completedTasks.filter(task => task.start_at && task.completed_at)
    const completionTimes = validTasks.map(task => {
      const startTime = new Date(task.start_at).getTime()
      const completedTime = new Date(task.completed_at!).getTime()
      return (completedTime - startTime) / (1000 * 60 * 60) // Convert to hours
    })
    
    const averageCompletionTimeHours = completionTimes.length > 0 ? 
      completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length : 0
    
    // Calculate additional metrics
    const medianCompletionTimeHours = completionTimes.length > 0 ? 
      this.calculateMedian(completionTimes) : 0
    const fastestTaskHours = completionTimes.length > 0 ? Math.min(...completionTimes) : 0
    const slowestTaskHours = completionTimes.length > 0 ? Math.max(...completionTimes) : 0
    
    // Get previous period for comparison
    const { start: prevStart, end: prevEnd } = this.calculatePreviousPeriodDates(period, currentStart)
    const prevCompletedTasks = await this.performanceRepository.getUserCompletedTasks(userId, prevStart, prevEnd)
    const prevValidTasks = prevCompletedTasks.filter(task => task.start_at && task.completed_at)
    const prevCompletionTimes = prevValidTasks.map(task => {
      const startTime = new Date(task.start_at).getTime()
      const completedTime = new Date(task.completed_at!).getTime()
      return (completedTime - startTime) / (1000 * 60 * 60)
    })
    const previousPeriodAverage = prevCompletionTimes.length > 0 ? 
      prevCompletionTimes.reduce((sum, time) => sum + time, 0) / prevCompletionTimes.length : 0

    return SuccessResponse('Time to completion fetched successfully', {
      userId,
      period: `${currentStart.toISOString().split('T')[0]} to ${currentEnd.toISOString().split('T')[0]}`,
      completedTasks: validTasks.length,
      averageCompletionTimeHours: Math.round(averageCompletionTimeHours * 100) / 100,
      medianCompletionTimeHours: Math.round(medianCompletionTimeHours * 100) / 100,
      fastestTaskHours: Math.round(fastestTaskHours * 100) / 100,
      slowestTaskHours: Math.round(slowestTaskHours * 100) / 100,
      previousPeriodAverage: Math.round(previousPeriodAverage * 100) / 100,
    })
  }

  /**
   * Calculate throughput (deliverables count)
   * Formula: total completed tasks in period
   */
  async getThroughput(userId: string, params: { period?: string; fromDate?: string; toDate?: string }) {
    const { period = 'monthly', fromDate, toDate } = params
    
    const { start: currentStart, end: currentEnd } = this.calculatePeriodDates(period, fromDate, toDate)
    
    // Get completed tasks for the period
    const completedTasks = await this.performanceRepository.getUserCompletedTasks(userId, currentStart, currentEnd)
    
    const totalCompletedTasks = completedTasks.length
    const deliverables = totalCompletedTasks // For now, assume each completed task is a deliverable
    
    // Calculate rates
    const periodDays = Math.ceil((currentEnd.getTime() - currentStart.getTime()) / (1000 * 60 * 60 * 24))
    const tasksPerDay = periodDays > 0 ? totalCompletedTasks / periodDays : 0
    const tasksPerWeek = tasksPerDay * 7
    
    // Get previous period for comparison
    const { start: prevStart, end: prevEnd } = this.calculatePreviousPeriodDates(period, currentStart)
    const prevCompletedTasks = await this.performanceRepository.getUserCompletedTasks(userId, prevStart, prevEnd)
    const previousPeriodThroughput = prevCompletedTasks.length
    
    const changePercentage = previousPeriodThroughput > 0 ? 
      ((totalCompletedTasks - previousPeriodThroughput) / previousPeriodThroughput) * 100 : 0

    return SuccessResponse('Throughput fetched successfully', {
      userId,
      period: `${currentStart.toISOString().split('T')[0]} to ${currentEnd.toISOString().split('T')[0]}`,
      completedTasks: totalCompletedTasks,
      deliverables,
      tasksPerDay: Math.round(tasksPerDay * 100) / 100,
      tasksPerWeek: Math.round(tasksPerWeek * 100) / 100,
      previousPeriodThroughput,
      changePercentage: Math.round(changePercentage * 100) / 100,
    })
  }

  /**
   * Calculate error reduction rate
   * Formula: (previous error rate - current error rate) / previous error rate
   */
  async getErrorReduction(userId: string, params: { period?: string; fromDate?: string; toDate?: string }) {
    const { period = 'monthly', fromDate, toDate } = params
    
    const { start: currentStart, end: currentEnd } = this.calculatePeriodDates(period, fromDate, toDate)
    const { start: prevStart, end: prevEnd } = this.calculatePreviousPeriodDates(period, currentStart)
    
    // Get task rejections (proxy for errors) for both periods
    const currentRejections = await this.performanceRepository.getUserTaskRejections(userId, currentStart, currentEnd)
    const prevRejections = await this.performanceRepository.getUserTaskRejections(userId, prevStart, prevEnd)
    
    // Get total tasks for both periods to calculate error rates
    const currentTasks = await this.performanceRepository.getUserTasks(userId, currentStart, currentEnd)
    const prevTasks = await this.performanceRepository.getUserTasks(userId, prevStart, prevEnd)
    
    const currentPeriodErrors = currentRejections.length
    const previousPeriodErrors = prevRejections.length
    const totalTasksCurrentPeriod = currentTasks.length
    const totalTasksPreviousPeriod = prevTasks.length
    
    const errorRate = totalTasksCurrentPeriod > 0 ? (currentPeriodErrors / totalTasksCurrentPeriod) * 100 : 0
    const previousErrorRate = totalTasksPreviousPeriod > 0 ? (previousPeriodErrors / totalTasksPreviousPeriod) * 100 : 0
    
    // Calculate reduction rate (negative means increase in errors)
    const reductionRate = previousErrorRate > 0 ? 
      ((previousErrorRate - errorRate) / previousErrorRate) * 100 : 0

    return SuccessResponse('Error reduction fetched successfully', {
      userId,
      currentPeriod: `${currentStart.toISOString().split('T')[0]} to ${currentEnd.toISOString().split('T')[0]}`,
      previousPeriod: `${prevStart.toISOString().split('T')[0]} to ${prevEnd.toISOString().split('T')[0]}`,
      currentPeriodErrors,
      previousPeriodErrors,
      errorRate: Math.round(errorRate * 100) / 100,
      previousErrorRate: Math.round(previousErrorRate * 100) / 100,
      reductionRate: Math.round(reductionRate * 100) / 100,
      totalTasksCurrentPeriod,
      totalTasksPreviousPeriod,
    })
  }

  // Helper methods

  private calculatePeriodDates(period: string, fromDate?: string, toDate?: string): { start: Date; end: Date } {
    if (fromDate && toDate) {
      return {
        start: new Date(fromDate),
        end: new Date(toDate)
      }
    }

    const now = new Date()
    let start: Date
    const end: Date = new Date(now)

    switch (period) {
      case 'weekly':
        start = new Date(now)
        start.setDate(now.getDate() - 7)
        break
      case 'quarterly':
        start = new Date(now)
        start.setMonth(now.getMonth() - 3)
        break
      case 'monthly':
      default:
        start = new Date(now)
        start.setMonth(now.getMonth() - 1)
        break
    }

    return { start, end }
  }

  private calculatePreviousPeriodDates(period: string, currentStart: Date): { start: Date; end: Date } {
    const end = new Date(currentStart)
    let start: Date

    switch (period) {
      case 'weekly':
        start = new Date(currentStart)
        start.setDate(currentStart.getDate() - 7)
        break
      case 'quarterly':
        start = new Date(currentStart)
        start.setMonth(currentStart.getMonth() - 3)
        break
      case 'monthly':
      default:
        start = new Date(currentStart)
        start.setMonth(currentStart.getMonth() - 1)
        break
    }

    return { start, end }
  }

  private calculateWorkingDays(start: Date, end: Date): number {
    let workingDays = 0
    const current = new Date(start)
    
    while (current <= end) {
      const dayOfWeek = current.getDay()
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Exclude weekends
        workingDays++
      }
      current.setDate(current.getDate() + 1)
    }
    
    return workingDays
  }

  private calculateMedian(numbers: number[]): number {
    const sorted = numbers.slice().sort((a, b) => a - b)
    const middle = Math.floor(sorted.length / 2)
    
    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2
    } else {
      return sorted[middle]
    }
  }
}
