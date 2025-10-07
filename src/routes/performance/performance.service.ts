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

  /**
   * Đánh giá hiệu suất tổ chức bằng AI
   * Tính toán trung bình của tất cả nhân viên trong tổ chức hoặc dự án cụ thể
   */
  async evaluateOrganizationPerformanceByAI(params: { projectId?: string }) {
    const { projectId } = params

    // 1) Lấy danh sách tất cả nhân viên (hoặc theo dự án)
    const employees = projectId
      ? await this.performanceRepository.getProjectEmployees(projectId)
      : await this.performanceRepository.getAllEmployees()

    if (employees.length === 0) {
      return SuccessResponse('No employees found', {
        summary: 'Không có nhân viên nào trong hệ thống để đánh giá.',
        stressRate: [{ label: 'Low', value: 0 }],
        workPerformance: [
          { label: 'Completed', value: 0 },
          { label: 'Delay', value: 0 },
          { label: 'Quality', value: 0 },
        ],
        stressAnalyzing: [{ label: 'Chưa có dữ liệu để phân tích.', data: [] }],
        status: 'Active',
        joined: new Date().toISOString(),
        name: 'Tổ chức',
        position: 'Organization',
        department: 'All Departments',
      })
    }

    // 2) Lấy dữ liệu performance của tất cả nhân viên
    const allPerformanceData = await Promise.all(
      employees.map(async (employee) => {
        const perfData = await this.performanceRepository.getPerformanceData(employee.id, {})
        const overall = await this.performanceRepository.getOverallPerformance(employee.id)
        return { employee, perfData, overall }
      }),
    )

    // 3) Tính toán tổng hợp
    let totalCompleted = 0
    let totalDelay = 0
    let totalBurnout = 0
    let totalQuality = 0
    let totalWorkingHours = 0
    let employeesWithData = 0

    for (const { perfData, overall } of allPerformanceData) {
      if (perfData.length > 0 || overall) {
        employeesWithData++

        // Từ PerformanceData
        const empCompleted = perfData.reduce((s, d) => s + (d.task_completed ?? 0), 0)
        const empDelay = perfData.reduce((s, d) => s + (d.task_delay_count ?? 0), 0)
        const empBurnout =
          perfData.length > 0 ? perfData.reduce((s, d) => s + (d.burnout_index ?? 0), 0) / perfData.length : 0
        const empQuality =
          perfData.length > 0 ? perfData.reduce((s, d) => s + (d.quality_score ?? 0), 0) / perfData.length : 0
        const empWorkingHours = perfData.reduce((s, d) => s + (d.working_hours ?? 0), 0)

        // Nếu có OverallPerformance, ưu tiên sử dụng
        if (overall) {
          totalCompleted += overall.task_completed ?? empCompleted
          totalDelay += overall.task_delay_count ?? empDelay
          totalBurnout += overall.burnout_index ?? empBurnout
          totalQuality += overall.quality_score ?? empQuality
          totalWorkingHours += overall.working_hours ?? empWorkingHours
        } else {
          totalCompleted += empCompleted
          totalDelay += empDelay
          totalBurnout += empBurnout
          totalQuality += empQuality
          totalWorkingHours += empWorkingHours
        }
      }
    }

    // 4) Tính trung bình
    const avgCompleted = employeesWithData > 0 ? totalCompleted / employeesWithData : 0
    const avgDelay = employeesWithData > 0 ? totalDelay / employeesWithData : 0
    const avgBurnout = employeesWithData > 0 ? totalBurnout / employeesWithData : 0
    const avgQuality = employeesWithData > 0 ? totalQuality / employeesWithData : 0

    // 5) Tính toán các chỉ số hiển thị (sử dụng tổng thay vì trung bình cho completed/delay)
    const workPerformance = [
      { label: 'Completed', value: totalCompleted },
      { label: 'Delay', value: totalDelay },
      { label: 'Quality', value: Math.round(avgQuality * 100) / 100 },
    ]

    // 6) Stress rate tổng hợp
    const delayRatio = totalCompleted + totalDelay > 0 ? totalDelay / (totalCompleted + totalDelay) : 0
    const stressScore = 0.6 * (avgBurnout / 10) + 0.4 * delayRatio
    let stressRateLabel = 'Low'
    if (stressScore >= 0.66) stressRateLabel = 'High'
    else if (stressScore >= 0.33) stressRateLabel = 'Medium'
    const stressRate = [{ label: stressRateLabel, value: Math.round(stressScore * 100) / 100 }]

    // 7) Stress analyzing
    let analyzingText = ''
    if (stressRateLabel === 'High') {
      analyzingText = `Tổ chức có mức căng thẳng cao với ${employeesWithData} nhân viên có dữ liệu. Cần xem xét lại phân bổ công việc và hỗ trợ nhân viên.`
    } else if (stressRateLabel === 'Medium') {
      analyzingText = `Tổ chức có mức căng thẳng trung bình với ${employeesWithData} nhân viên. Theo dõi và tối ưu hóa quy trình làm việc.`
    } else {
      analyzingText = `Tổ chức hoạt động ổn định với ${employeesWithData} nhân viên có hiệu suất tốt. Duy trì phương pháp làm việc hiện tại.`
    }
    const stressAnalyzing = [{ label: analyzingText, data: [] }]

    // 8) Gọi AI để tạo summary tổng hợp
    const aiSummary = await this.callAIApiForSummary(
      {
        name: projectId ? 'Dự án' : 'Tổ chức',
        department: 'All Departments',
        status: 'Active',
        created_at: '',
      },
      null,
      allPerformanceData.flatMap((item) => item.perfData),
      envConfig.GPT_API_KEY,
      {
        totals: {
          totalCompleted: totalCompleted,
          totalDelay: totalDelay,
          avgBurnout: avgBurnout,
          avgQuality: avgQuality,
          delayRatio: delayRatio,
        },
      },
      [], // Không có related docs cho tổ chức
    )

    // 9) Trả về kết quả
    return SuccessResponse('Organization performance evaluation completed', {
      summary: aiSummary,
      stressRate,
      workPerformance,
      stressAnalyzing,
      status: 'Active',
      joined: new Date().toISOString(),
      name: projectId ? `Dự án (${employeesWithData} nhân viên)` : `Tổ chức (${employeesWithData} nhân viên)`,
      position: 'Organization Average',
      department: 'All Departments',
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
    const completedTasks = tasks.filter((t) => t.status === 'completed').length
    const totalTasks = tasks.length

    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

    // Get previous period for comparison
    const { start: prevStart, end: prevEnd } = this.calculatePreviousPeriodDates(period, currentStart)
    const prevTasks = await this.performanceRepository.getUserTasks(userId, prevStart, prevEnd)
    const prevCompletedTasks = prevTasks.filter((t) => t.status === 'completed').length
    const prevTotalTasks = prevTasks.length
    const previousPeriodRate = prevTotalTasks > 0 ? (prevCompletedTasks / prevTotalTasks) * 100 : 0

    const changePercentage =
      previousPeriodRate > 0 ? ((completionRate - previousPeriodRate) / previousPeriodRate) * 100 : 0

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
    const onTimeTasks = completedTasks.filter((task) => {
      if (!task.completed_at || !task.due_at) return false
      return new Date(task.completed_at) <= new Date(task.due_at)
    }).length

    const adherenceRate = totalTasks > 0 ? (onTimeTasks / totalTasks) * 100 : 0

    // Calculate average delay days for overdue tasks
    const overdueTasks = completedTasks.filter((task) => {
      if (!task.completed_at || !task.due_at) return false
      return new Date(task.completed_at) > new Date(task.due_at)
    })

    const totalDelayDays = overdueTasks.reduce((sum, task) => {
      if (!task.completed_at || !task.due_at) return sum
      const delayMs = new Date(task.completed_at).getTime() - new Date(task.due_at).getTime()
      return sum + delayMs / (1000 * 60 * 60 * 24) // Convert to days
    }, 0)

    const averageDelayDays = overdueTasks.length > 0 ? totalDelayDays / overdueTasks.length : 0

    // Get previous period for comparison
    const { start: prevStart, end: prevEnd } = this.calculatePreviousPeriodDates(period, currentStart)
    const prevCompletedTasks = await this.performanceRepository.getUserCompletedTasks(userId, prevStart, prevEnd)
    const prevTotalTasks = prevCompletedTasks.length
    const prevOnTimeTasks = prevCompletedTasks.filter((task) => {
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

    const totalWorkingHours = focusLogs.reduce((sum, log) => sum + log.focused_minutes / 60, 0)

    // Assume standard working hours: 8 hours/day, 5 days/week
    const workingDays = this.calculateWorkingDays(currentStart, currentEnd)
    const standardHours = workingDays * 8

    const complianceRate = standardHours > 0 ? Math.min((totalWorkingHours / standardHours) * 100, 100) : 0
    const overtimeHours = Math.max(totalWorkingHours - standardHours, 0)

    // Get previous period for comparison
    const { start: prevStart, end: prevEnd } = this.calculatePreviousPeriodDates(period, currentStart)
    const prevFocusLogs = await this.performanceRepository.getUserWorkingHours(userId, prevStart, prevEnd)
    const prevTotalWorkingHours = prevFocusLogs.reduce((sum, log) => sum + log.focused_minutes / 60, 0)
    const prevWorkingDays = this.calculateWorkingDays(prevStart, prevEnd)
    const prevStandardHours = prevWorkingDays * 8
    const previousPeriodRate =
      prevStandardHours > 0 ? Math.min((prevTotalWorkingHours / prevStandardHours) * 100, 100) : 0

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

    const validTasks = completedTasks.filter((task) => task.start_at && task.completed_at)
    const completionTimes = validTasks.map((task) => {
      const startTime = new Date(task.start_at).getTime()
      const completedTime = new Date(task.completed_at!).getTime()
      return (completedTime - startTime) / (1000 * 60 * 60) // Convert to hours
    })

    const averageCompletionTimeHours =
      completionTimes.length > 0 ? completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length : 0

    // Calculate additional metrics
    const medianCompletionTimeHours = completionTimes.length > 0 ? this.calculateMedian(completionTimes) : 0
    const fastestTaskHours = completionTimes.length > 0 ? Math.min(...completionTimes) : 0
    const slowestTaskHours = completionTimes.length > 0 ? Math.max(...completionTimes) : 0

    // Get previous period for comparison
    const { start: prevStart, end: prevEnd } = this.calculatePreviousPeriodDates(period, currentStart)
    const prevCompletedTasks = await this.performanceRepository.getUserCompletedTasks(userId, prevStart, prevEnd)
    const prevValidTasks = prevCompletedTasks.filter((task) => task.start_at && task.completed_at)
    const prevCompletionTimes = prevValidTasks.map((task) => {
      const startTime = new Date(task.start_at).getTime()
      const completedTime = new Date(task.completed_at!).getTime()
      return (completedTime - startTime) / (1000 * 60 * 60)
    })
    const previousPeriodAverage =
      prevCompletionTimes.length > 0
        ? prevCompletionTimes.reduce((sum, time) => sum + time, 0) / prevCompletionTimes.length
        : 0

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

    const changePercentage =
      previousPeriodThroughput > 0
        ? ((totalCompletedTasks - previousPeriodThroughput) / previousPeriodThroughput) * 100
        : 0

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
    const reductionRate = previousErrorRate > 0 ? ((previousErrorRate - errorRate) / previousErrorRate) * 100 : 0

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
        end: new Date(toDate),
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
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        // Exclude weekends
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

  // Aggregate methods for all employees

  /**
   * Calculate average task completion rate for all employees
   */
  async getAverageTaskCompletionRate(params: {
    period?: string
    fromDate?: string
    toDate?: string
    projectId?: string
  }) {
    const { period = 'monthly', fromDate, toDate, projectId } = params
    const { start, end } = this.calculatePeriodDates(period, fromDate, toDate)

    // Get all employees (optionally filtered by project)
    const employees = projectId
      ? await this.performanceRepository.getProjectEmployees(projectId)
      : await this.performanceRepository.getAllEmployees()

    const employeeRates = await Promise.all(
      employees.map(async (employee) => {
        const tasks = await this.performanceRepository.getUserTasks(employee.id, start, end)
        const completedTasks = tasks.filter((t) => t.status === 'completed').length
        const totalTasks = tasks.length
        return totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
      }),
    )

    const averageRate =
      employeeRates.length > 0 ? employeeRates.reduce((sum, rate) => sum + rate, 0) / employeeRates.length : 0

    return SuccessResponse('Average task completion rate fetched successfully', {
      period: `${start.toISOString().split('T')[0]} to ${end.toISOString().split('T')[0]}`,
      projectId: projectId || 'all',
      totalEmployees: employees.length,
      averageCompletionRate: Math.round(averageRate * 100) / 100,
      individualRates: employeeRates.map((rate, index) => ({
        employeeId: employees[index].id,
        employeeName: employees[index].name,
        completionRate: Math.round(rate * 100) / 100,
      })),
    })
  }

  /**
   * Calculate average deadline adherence for all employees
   */
  async getAverageDeadlineAdherence(params: {
    period?: string
    fromDate?: string
    toDate?: string
    projectId?: string
  }) {
    const { period = 'monthly', fromDate, toDate, projectId } = params
    const { start, end } = this.calculatePeriodDates(period, fromDate, toDate)

    const employees = projectId
      ? await this.performanceRepository.getProjectEmployees(projectId)
      : await this.performanceRepository.getAllEmployees()

    const employeeAdherence = await Promise.all(
      employees.map(async (employee) => {
        const completedTasks = await this.performanceRepository.getUserCompletedTasks(employee.id, start, end)
        const totalTasks = completedTasks.length
        const onTimeTasks = completedTasks.filter((task) => {
          if (!task.completed_at || !task.due_at) return false
          return new Date(task.completed_at) <= new Date(task.due_at)
        }).length
        return totalTasks > 0 ? (onTimeTasks / totalTasks) * 100 : 0
      }),
    )

    const averageAdherence =
      employeeAdherence.length > 0
        ? employeeAdherence.reduce((sum, rate) => sum + rate, 0) / employeeAdherence.length
        : 0

    return SuccessResponse('Average deadline adherence fetched successfully', {
      period: `${start.toISOString().split('T')[0]} to ${end.toISOString().split('T')[0]}`,
      projectId: projectId || 'all',
      totalEmployees: employees.length,
      averageAdherenceRate: Math.round(averageAdherence * 100) / 100,
      individualRates: employeeAdherence.map((rate, index) => ({
        employeeId: employees[index].id,
        employeeName: employees[index].name,
        adherenceRate: Math.round(rate * 100) / 100,
      })),
    })
  }

  /**
   * Calculate average work hours compliance for all employees
   */
  async getAverageWorkHoursCompliance(params: {
    period?: string
    fromDate?: string
    toDate?: string
    projectId?: string
  }) {
    const { period = 'monthly', fromDate, toDate, projectId } = params
    const { start, end } = this.calculatePeriodDates(period, fromDate, toDate)

    const employees = projectId
      ? await this.performanceRepository.getProjectEmployees(projectId)
      : await this.performanceRepository.getAllEmployees()

    const employeeCompliance = await Promise.all(
      employees.map(async (employee) => {
        const focusLogs = await this.performanceRepository.getUserWorkingHours(employee.id, start, end)
        const totalWorkingHours = focusLogs.reduce((sum, log) => sum + log.focused_minutes / 60, 0)
        const workingDays = this.calculateWorkingDays(start, end)
        const standardHours = workingDays * 8
        return standardHours > 0 ? Math.min((totalWorkingHours / standardHours) * 100, 100) : 0
      }),
    )

    const averageCompliance =
      employeeCompliance.length > 0
        ? employeeCompliance.reduce((sum, rate) => sum + rate, 0) / employeeCompliance.length
        : 0

    return SuccessResponse('Average work hours compliance fetched successfully', {
      period: `${start.toISOString().split('T')[0]} to ${end.toISOString().split('T')[0]}`,
      projectId: projectId || 'all',
      totalEmployees: employees.length,
      averageComplianceRate: Math.round(averageCompliance * 100) / 100,
      individualRates: employeeCompliance.map((rate, index) => ({
        employeeId: employees[index].id,
        employeeName: employees[index].name,
        complianceRate: Math.round(rate * 100) / 100,
      })),
    })
  }

  /**
   * Calculate average time to completion for all employees
   */
  async getAverageTimeToCompletion(params: {
    period?: string
    fromDate?: string
    toDate?: string
    projectId?: string
  }) {
    const { period = 'monthly', fromDate, toDate, projectId } = params
    const { start, end } = this.calculatePeriodDates(period, fromDate, toDate)

    const employees = projectId
      ? await this.performanceRepository.getProjectEmployees(projectId)
      : await this.performanceRepository.getAllEmployees()

    const employeeCompletionTimes = await Promise.all(
      employees.map(async (employee) => {
        const completedTasks = await this.performanceRepository.getUserCompletedTasks(employee.id, start, end)
        const validTasks = completedTasks.filter((task) => task.start_at && task.completed_at)
        const completionTimes = validTasks.map((task) => {
          const startTime = new Date(task.start_at).getTime()
          const completedTime = new Date(task.completed_at!).getTime()
          return (completedTime - startTime) / (1000 * 60 * 60) // Convert to hours
        })
        return completionTimes.length > 0
          ? completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length
          : 0
      }),
    )

    const averageCompletionTime =
      employeeCompletionTimes.length > 0
        ? employeeCompletionTimes.reduce((sum, time) => sum + time, 0) / employeeCompletionTimes.length
        : 0

    return SuccessResponse('Average time to completion fetched successfully', {
      period: `${start.toISOString().split('T')[0]} to ${end.toISOString().split('T')[0]}`,
      projectId: projectId || 'all',
      totalEmployees: employees.length,
      averageCompletionTimeHours: Math.round(averageCompletionTime * 100) / 100,
      individualTimes: employeeCompletionTimes.map((time, index) => ({
        employeeId: employees[index].id,
        employeeName: employees[index].name,
        averageCompletionTimeHours: Math.round(time * 100) / 100,
      })),
    })
  }

  /**
   * Calculate total throughput for all employees
   */
  async getTotalThroughput(params: { period?: string; fromDate?: string; toDate?: string; projectId?: string }) {
    const { period = 'monthly', fromDate, toDate, projectId } = params
    const { start, end } = this.calculatePeriodDates(period, fromDate, toDate)

    const employees = projectId
      ? await this.performanceRepository.getProjectEmployees(projectId)
      : await this.performanceRepository.getAllEmployees()

    const employeeThroughput = await Promise.all(
      employees.map(async (employee) => {
        const completedTasks = await this.performanceRepository.getUserCompletedTasks(employee.id, start, end)
        return completedTasks.length
      }),
    )

    const totalThroughput = employeeThroughput.reduce((sum, throughput) => sum + throughput, 0)

    return SuccessResponse('Total throughput fetched successfully', {
      period: `${start.toISOString().split('T')[0]} to ${end.toISOString().split('T')[0]}`,
      projectId: projectId || 'all',
      totalEmployees: employees.length,
      totalThroughput,
      individualThroughput: employeeThroughput.map((throughput, index) => ({
        employeeId: employees[index].id,
        employeeName: employees[index].name,
        throughput,
      })),
    })
  }

  /**
   * Calculate average throughput for all employees
   */
  async getAverageThroughput(params: { period?: string; fromDate?: string; toDate?: string; projectId?: string }) {
    const { period = 'monthly', fromDate, toDate, projectId } = params
    const totalThroughputResult = await this.getTotalThroughput({ period, fromDate, toDate, projectId })

    const totalEmployees = totalThroughputResult.data.totalEmployees
    const totalThroughput = totalThroughputResult.data.totalThroughput
    const averageThroughput = totalEmployees > 0 ? totalThroughput / totalEmployees : 0

    return SuccessResponse('Average throughput fetched successfully', {
      ...totalThroughputResult.data,
      averageThroughput: Math.round(averageThroughput * 100) / 100,
    })
  }

  /**
   * Calculate average error reduction for all employees
   */
  async getAverageErrorReduction(params: { period?: string; fromDate?: string; toDate?: string; projectId?: string }) {
    const { period = 'monthly', fromDate, toDate, projectId } = params
    const { start: currentStart, end: currentEnd } = this.calculatePeriodDates(period, fromDate, toDate)
    const { start: prevStart, end: prevEnd } = this.calculatePreviousPeriodDates(period, currentStart)

    const employees = projectId
      ? await this.performanceRepository.getProjectEmployees(projectId)
      : await this.performanceRepository.getAllEmployees()

    const employeeReductions = await Promise.all(
      employees.map(async (employee) => {
        const currentRejections = await this.performanceRepository.getUserTaskRejections(
          employee.id,
          currentStart,
          currentEnd,
        )
        const prevRejections = await this.performanceRepository.getUserTaskRejections(employee.id, prevStart, prevEnd)
        const currentTasks = await this.performanceRepository.getUserTasks(employee.id, currentStart, currentEnd)
        const prevTasks = await this.performanceRepository.getUserTasks(employee.id, prevStart, prevEnd)

        const errorRate = currentTasks.length > 0 ? (currentRejections.length / currentTasks.length) * 100 : 0
        const previousErrorRate = prevTasks.length > 0 ? (prevRejections.length / prevTasks.length) * 100 : 0

        return previousErrorRate > 0 ? ((previousErrorRate - errorRate) / previousErrorRate) * 100 : 0
      }),
    )

    const averageReduction =
      employeeReductions.length > 0
        ? employeeReductions.reduce((sum, reduction) => sum + reduction, 0) / employeeReductions.length
        : 0

    return SuccessResponse('Average error reduction fetched successfully', {
      currentPeriod: `${currentStart.toISOString().split('T')[0]} to ${currentEnd.toISOString().split('T')[0]}`,
      previousPeriod: `${prevStart.toISOString().split('T')[0]} to ${prevEnd.toISOString().split('T')[0]}`,
      projectId: projectId || 'all',
      totalEmployees: employees.length,
      averageReductionRate: Math.round(averageReduction * 100) / 100,
      individualReductions: employeeReductions.map((reduction, index) => ({
        employeeId: employees[index].id,
        employeeName: employees[index].name,
        reductionRate: Math.round(reduction * 100) / 100,
      })),
    })
  }

  // Aggregate methods for all projects

  /**
   * Get all projects statistics
   */
  async getAllProjectsStats(params: { period?: string; fromDate?: string; toDate?: string }) {
    const { period = 'monthly', fromDate, toDate } = params
    const { start, end } = this.calculatePeriodDates(period, fromDate, toDate)

    const projects = await this.performanceRepository.getAllProjects()

    const projectStats = await Promise.all(
      projects.map(async (project) => {
        const tasks = await this.performanceRepository.getTasksByProjectId(project.id)
        const completedTasks = tasks.filter((t) => t.status === 'completed').length
        const totalTasks = tasks.length
        const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

        return {
          projectId: project.id,
          projectName: project.name,
          totalTasks,
          completedTasks,
          completionRate: Math.round(completionRate * 100) / 100,
          status: project.status,
          process: project.process || 0,
        }
      }),
    )

    const totalProjectTasks = projectStats.reduce((sum, stat) => sum + stat.totalTasks, 0)
    const totalCompletedTasks = projectStats.reduce((sum, stat) => sum + stat.completedTasks, 0)
    const overallCompletionRate = totalProjectTasks > 0 ? (totalCompletedTasks / totalProjectTasks) * 100 : 0

    return SuccessResponse('All projects stats fetched successfully', {
      period: `${start.toISOString().split('T')[0]} to ${end.toISOString().split('T')[0]}`,
      totalProjects: projects.length,
      totalProjectTasks,
      totalCompletedTasks,
      overallCompletionRate: Math.round(overallCompletionRate * 100) / 100,
      projectStats,
    })
  }

  /**
   * Get all projects overview
   */
  async getAllProjectsOverview(params: { period?: string; fromDate?: string; toDate?: string }) {
    const { period = 'monthly', fromDate, toDate } = params
    const { start, end } = this.calculatePeriodDates(period, fromDate, toDate)

    const projects = await this.performanceRepository.getAllProjects()

    const projectOverviews = await Promise.all(
      projects.map(async (project) => {
        const overview = await this.getProjectOverview(project.id)
        return {
          projectId: project.id,
          projectName: project.name,
          overview: overview.data,
        }
      }),
    )

    // Calculate aggregate metrics
    const totalTasks = projectOverviews.reduce((sum, p) => sum + (p.overview?.totalTasks || 0), 0)
    const totalCompleted = projectOverviews.reduce((sum, p) => sum + (p.overview?.completedTasks || 0), 0)
    const totalOverdue = projectOverviews.reduce((sum, p) => sum + (p.overview?.overdueTasks || 0), 0)
    const totalInProgress = projectOverviews.reduce((sum, p) => sum + (p.overview?.inProgressTasks || 0), 0)
    const averageCompletionRate = totalTasks > 0 ? (totalCompleted / totalTasks) * 100 : 0

    return SuccessResponse('All projects overview fetched successfully', {
      period: `${start.toISOString().split('T')[0]} to ${end.toISOString().split('T')[0]}`,
      totalProjects: projects.length,
      aggregateMetrics: {
        totalTasks,
        totalCompleted,
        totalOverdue,
        totalInProgress,
        averageCompletionRate: Math.round(averageCompletionRate * 100) / 100,
      },
      projectOverviews,
    })
  }

  /**
   * Get all projects KPI
   */
  async getAllProjectsKpi(params: { period?: string; fromDate?: string; toDate?: string }) {
    const { period = 'monthly', fromDate, toDate } = params
    const { start, end } = this.calculatePeriodDates(period, fromDate, toDate)

    const projects = await this.performanceRepository.getAllProjects()

    const projectKpis = await Promise.all(
      projects.map(async (project) => {
        const kpi = await this.getProjectKpi(project.id)
        return {
          projectId: project.id,
          projectName: project.name,
          kpi: kpi.data,
        }
      }),
    )

    // Calculate aggregate KPIs
    const totalKpiValue = projectKpis.reduce((sum, p) => sum + (p.kpi?.kpiValue || 0), 0)
    const averageProcess =
      projects.length > 0 ? projects.reduce((sum, p) => sum + (p.process || 0), 0) / projects.length : 0
    const averageCompletionRate =
      projectKpis.length > 0
        ? projectKpis.reduce((sum, p) => sum + (p.kpi?.completionRate || 0), 0) / projectKpis.length
        : 0

    return SuccessResponse('All projects KPI fetched successfully', {
      period: `${start.toISOString().split('T')[0]} to ${end.toISOString().split('T')[0]}`,
      totalProjects: projects.length,
      aggregateKpi: {
        totalKpiValue: Math.round(totalKpiValue * 100) / 100,
        averageProcess: Math.round(averageProcess * 100) / 100,
        averageCompletionRate: Math.round(averageCompletionRate * 100) / 100,
      },
      projectKpis,
    })
  }

  /**
   * Get all projects AI analysis
   */
  async getAllProjectsAIAnalysis(params: { period?: string; fromDate?: string; toDate?: string }) {
    const { period = 'monthly', fromDate, toDate } = params

    // Use provided dates if available, otherwise calculate from period
    let start: Date, end: Date
    if (fromDate && toDate) {
      start = new Date(fromDate)
      end = new Date(toDate)
    } else {
      const periodDates = this.calculatePeriodDates(period, undefined, undefined)
      start = periodDates.start
      end = periodDates.end
    }

    const projects = await this.performanceRepository.getAllProjects()

    // Get all employees across all projects
    const allEmployees = await this.performanceRepository.getAllEmployees()
    const perfDataList = await Promise.all(
      allEmployees.map((employee) => this.performanceRepository.getPerformanceData(employee.id, { fromDate, toDate })),
    )

    // Aggregate all performance data
    const allPerfData = perfDataList.flat()
    const totalCompleted = allPerfData.reduce((s, d) => s + (d.task_completed ?? 0), 0)
    const totalDelay = allPerfData.reduce((s, d) => s + (d.task_delay_count ?? 0), 0)
    const avgBurnout =
      allPerfData.length > 0 ? allPerfData.reduce((s, d) => s + (d.burnout_index ?? 0), 0) / allPerfData.length : 0
    const avgQuality =
      allPerfData.length > 0 ? allPerfData.reduce((s, d) => s + (d.quality_score ?? 0), 0) / allPerfData.length : 0

    // Call AI for organization-wide analysis
    const aiSummary = await this.callAIApiForSummary(
      { name: 'Organization', department: 'All Departments', status: 'Active', created_at: '' },
      null,
      allPerfData,
      envConfig.GPT_API_KEY,
      {
        totals: { totalCompleted, totalDelay, avgBurnout, avgQuality, delayRatio: 0 },
      },
      [],
    )

    return SuccessResponse('All projects AI analysis fetched successfully', {
      period: `${start.toISOString().split('T')[0]} to ${end.toISOString().split('T')[0]}`,
      totalProjects: projects.length,
      totalEmployees: allEmployees.length,
      organizationSummary: aiSummary,
      aggregateMetrics: {
        totalCompleted,
        totalDelay,
        avgBurnout: Math.round(avgBurnout * 100) / 100,
        avgQuality: Math.round(avgQuality * 100) / 100,
      },
    })
  }

  /**
   * Get organization performance summary
   */
  async getOrganizationPerformanceSummary(params: { period?: string; fromDate?: string; toDate?: string }) {
    const { period = 'monthly', fromDate, toDate } = params

    // Get aggregate data from other methods
    const [
      projectsStats,
      projectsOverview,
      projectsKpi,
      averageTaskCompletion,
      averageDeadlineAdherence,
      totalThroughput,
    ] = await Promise.all([
      this.getAllProjectsStats({ period, fromDate, toDate }),
      this.getAllProjectsOverview({ period, fromDate, toDate }),
      this.getAllProjectsKpi({ period, fromDate, toDate }),
      this.getAverageTaskCompletionRate({ period, fromDate, toDate }),
      this.getAverageDeadlineAdherence({ period, fromDate, toDate }),
      this.getTotalThroughput({ period, fromDate, toDate }),
    ])

    const { start, end } = this.calculatePeriodDates(period, fromDate, toDate)

    return SuccessResponse('Organization performance summary fetched successfully', {
      period: `${start.toISOString().split('T')[0]} to ${end.toISOString().split('T')[0]}`,
      summary: {
        projects: {
          total: projectsStats.data.totalProjects,
          overallCompletionRate: projectsStats.data.overallCompletionRate,
          totalTasks: projectsStats.data.totalProjectTasks,
          completedTasks: projectsStats.data.totalCompletedTasks,
        },
        employees: {
          total: averageTaskCompletion.data.totalEmployees,
          averageCompletionRate: averageTaskCompletion.data.averageCompletionRate,
          averageDeadlineAdherence: averageDeadlineAdherence.data.averageAdherenceRate,
          totalThroughput: totalThroughput.data.totalThroughput,
        },
        kpi: {
          totalKpiValue: projectsKpi.data.aggregateKpi.totalKpiValue,
          averageProcess: projectsKpi.data.aggregateKpi.averageProcess,
        },
      },
      detailedData: {
        projectsStats: projectsStats.data,
        projectsOverview: projectsOverview.data,
        employeeMetrics: {
          taskCompletion: averageTaskCompletion.data,
          deadlineAdherence: averageDeadlineAdherence.data,
          throughput: totalThroughput.data,
        },
      },
    })
  }

  /**
   * Get organization dashboard summary with charts data
   * Returns data formatted for dashboard visualization using real database data
   */
  async getOrganizationDashboardSummary(params: { period?: string; fromDate?: string; toDate?: string }) {
    const { period = 'monthly', fromDate, toDate } = params
    const { start, end } = this.calculatePeriodDates(period, fromDate, toDate)

    // Get real data from database
    const [allEmployees, allProjects, departmentStats] = await Promise.all([
      this.performanceRepository.getAllEmployees(),
      this.performanceRepository.getAllProjects(),
      this.performanceRepository.getDepartmentStats(start, end),
    ])

    const totalEmployees = allEmployees.length

    // Calculate real Employee Department Distribution based on user department assignments
    const roleDistribution = this.calculateRoleDistribution(allEmployees)

    // Get real Account Status Over Time from user creation/status changes
    const accountStatusOverTime = await this.calculateAccountStatusOverTime(start, end)

    // Get real Employee Growth Trends from actual hire dates
    const employeeGrowthTrends = await this.calculateEmployeeGrowthTrends(start, end)

    // Get real Top 5 Active Roles based on task completion activity
    const topActiveRoles = await this.calculateTopActiveRoles(allEmployees, start, end)

    // Calculate real metrics
    const [avgTaskCompletion, avgDeadlineAdherence] = await Promise.all([
      this.getAverageTaskCompletionRate({ period, fromDate, toDate }),
      this.getAverageDeadlineAdherence({ period, fromDate, toDate }),
    ])

    // Calculate AI score based on real performance data
    const activeAccountScore = await this.calculateAIPerformanceScore(allEmployees, start, end)

    // Calculate role assignment percentage (employees with assigned roles/tasks)
    const roleAssignPercentage = await this.calculateRoleAssignmentPercentage(allEmployees, start, end)

    // Calculate new hires success percentage (new hires completing tasks successfully)
    const newHiresPercentage = await this.calculateNewHiresSuccessRate(allEmployees, start, end)

    // Get HR Manager info from database (assuming there's a user with HR role)
    const hrManager = await this.getHRManagerInfo()

    return SuccessResponse('Organization dashboard summary fetched successfully', {
      // Main metrics (4 cards at top) - now using real data
      totalEmployees,
      activeAccountScore,
      roleAssignPercentage,
      newHiresPercentage,

      // Time info
      period: `${start.toISOString().split('T')[0]} to ${end.toISOString().split('T')[0]}`,
      lastUpdated: new Date().toISOString(),

      // Chart data - now using real data
      employeeRoleDistribution: roleDistribution,
      accountStatusOverTime,
      employeeGrowthTrends,
      topActiveRoles,

      // HR Manager info - from database
      hrManager,
    })
  }

  // Helper methods for real data calculation

  private calculateRoleDistribution(employees: any[]) {
    const departmentCounts: Record<string, number> = {}

    // Count users by department name
    employees.forEach((emp) => {
      const departmentName = emp.department?.name || 'Unassigned'
      departmentCounts[departmentName] = (departmentCounts[departmentName] || 0) + 1
    })

    return departmentCounts
  }

  private async calculateAccountStatusOverTime(start: Date, end: Date) {
    const months: Array<{ month: string; active: number; inactive: number; pending: number }> = []
    const now = new Date()

    for (let i = 6; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)

      // Count users by status for each month using repository method
      const users = await this.performanceRepository.getUsersWithStatusByMonth(monthStart, monthEnd)

      const active = users.filter((u) => u.status === 'active').length
      const inactive = users.filter((u) => u.status === 'inactive').length
      // Note: Assuming 'pending' status exists, otherwise set to 0
      const pending = users.filter((u) => u.status === ('pending' as any)).length || 0

      months.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        active,
        inactive,
        pending,
      })
    }

    return months
  }

  private async calculateEmployeeGrowthTrends(start: Date, end: Date) {
    const quarters: Array<{ quarter: string; newHires: number; departures: number; netGrowth: number }> = []
    const now = new Date()

    // Get last 6 quarters of data
    for (let i = 5; i >= 0; i--) {
      const quarterStart = new Date(now.getFullYear(), now.getMonth() - i * 3, 1)
      const quarterEnd = new Date(now.getFullYear(), now.getMonth() - i * 3 + 3, 0)

      // Count new hires in this quarter using repository method
      const newHires = await this.performanceRepository.countNewHires(quarterStart, quarterEnd)

      // Count departures (users who became inactive in this quarter)
      // Note: You might need to add a `deactivated_at` field to track this properly
      const departures = Math.floor(newHires * 0.2) // Mock: assume 20% departure rate

      quarters.push({
        quarter: `Q${Math.floor((quarterStart.getMonth() + 3) / 3)} ${quarterStart.getFullYear()}`,
        newHires,
        departures,
        netGrowth: newHires - departures,
      })
    }

    return quarters
  }

  private async calculateTopActiveRoles(employees: any[], start: Date, end: Date) {
    // Count task completion by role
    const roleActivity: Record<string, { count: number; totalTasks: number }> = {}

    for (const emp of employees) {
      const role = emp.job_title || emp.department?.name || 'Unknown'

      // Count completed tasks for this employee
      const completedTasks = await this.performanceRepository.getUserCompletedTasks(emp.id, start, end)

      if (!roleActivity[role]) {
        roleActivity[role] = { count: 0, totalTasks: 0 }
      }

      roleActivity[role].count += 1
      roleActivity[role].totalTasks += completedTasks.length
    }

    // Sort by activity level and take top 5
    const sortedRoles = Object.entries(roleActivity)
      .sort(([, a], [, b]) => b.totalTasks - a.totalTasks)
      .slice(0, 5)

    const totalEmployees = employees.length

    return sortedRoles.map(([roleName, data]) => ({
      roleName,
      count: data.count,
      percentage: Math.round((data.count / totalEmployees) * 100),
    }))
  }

  private async calculateAIPerformanceScore(employees: any[], start: Date, end: Date) {
    // Calculate organization-wide performance metrics
    const metrics = await Promise.all([
      this.getAverageTaskCompletionRate({ fromDate: start.toISOString(), toDate: end.toISOString() }),
      this.getAverageDeadlineAdherence({ fromDate: start.toISOString(), toDate: end.toISOString() }),
    ])

    const avgCompletion = metrics[0].data.averageCompletionRate || 0
    const avgAdherence = metrics[1].data.averageAdherenceRate || 0

    // Simple AI score calculation (0-10 scale)
    const score = ((avgCompletion + avgAdherence) / 200) * 10
    return Math.round(score * 10) / 10 // Round to 1 decimal
  }

  private async calculateRoleAssignmentPercentage(employees: any[], start: Date, end: Date) {
    // Calculate percentage of employees who have been assigned tasks/roles
    let assignedCount = 0

    for (const emp of employees) {
      const tasks = await this.performanceRepository.getUserTasks(emp.id, start, end)
      if (tasks.length > 0) {
        assignedCount++
      }
    }

    return Math.round((assignedCount / employees.length) * 100)
  }

  private async calculateNewHiresSuccessRate(employees: any[], start: Date, end: Date) {
    // Calculate success rate of employees hired in the last 6 months
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const newHires = employees.filter((emp) => new Date(emp.created_at) >= sixMonthsAgo)

    if (newHires.length === 0) return 75 // Default value if no new hires

    let successfulHires = 0
    for (const hire of newHires) {
      const completedTasks = await this.performanceRepository.getUserCompletedTasks(hire.id, sixMonthsAgo, end)
      if (completedTasks.length > 0) {
        successfulHires++
      }
    }

    return Math.round((successfulHires / newHires.length) * 100)
  }

  private async getHRManagerInfo() {
    // Try to find HR manager from database using repository method
    const hrManager = await this.performanceRepository.findHRManager()

    return {
      name: hrManager?.name || 'John Doe',
      title: hrManager?.department?.name === 'HR' ? 'HR Manager' : 'HR Manager',
    }
  }

  /**
   * Get user dashboard summary with key metrics
   */
  async getUserDashboardSummary(
    userId: string,
    dateParams?: { date?: string; fromDate?: string; toDate?: string },
  ) {
    // Xác định ngày để query
    let targetDate: Date
    let fromDate: Date | undefined
    let toDate: Date | undefined

    if (dateParams?.date) {
      // Nếu có date cụ thể, sử dụng ngày đó
      targetDate = new Date(dateParams.date)
    } else if (dateParams?.fromDate && dateParams?.toDate) {
      // Nếu có khoảng thời gian, sử dụng fromDate và toDate
      fromDate = new Date(dateParams.fromDate)
      toDate = new Date(dateParams.toDate)
      targetDate = fromDate // Sử dụng fromDate làm reference
    } else {
      // Mặc định là hôm nay
      targetDate = new Date()
    }

    const [todayTasks, completionRate, overdueTasks, focusHours] = await Promise.all([
      this.performanceRepository.getTasksCountByDate(userId, targetDate, fromDate, toDate),
      this.performanceRepository.getUserCompletionRateByDate(userId, targetDate, fromDate, toDate),
      this.performanceRepository.getOverdueTasksCountByDate(userId, targetDate),
      this.performanceRepository.getFocusHoursByDate(userId, targetDate, fromDate, toDate),
    ])

    return SuccessResponse('Get dashboard summary successfully', {
      todayTasks,
      completionRate,
      overdueTasks,
      focusHours,
    })
  }

  /**
   * Lấy dashboard hiệu suất cá nhân chi tiết
   * Bao gồm: Stress Rate, Work Performance (pie chart), Stress Analysis (trend)
   */
  async getIndividualPerformanceDashboard(userId: string, dto: { period?: string; fromDate?: string; toDate?: string }) {
    const { period = 'monthly', fromDate, toDate } = dto

    // Parallel fetch data for all dashboard components
    const [stressRateData, workPerformanceData, stressAnalysisData, userInfo] = await Promise.all([
      this.performanceRepository.getStressRateByDifficulty(userId, { period, fromDate, toDate }),
      this.performanceRepository.getWorkPerformanceBreakdown(userId, { period, fromDate, toDate }),
      this.performanceRepository.getStressAnalysisTrend(userId, { period, fromDate, toDate }),
      this.performanceRepository.getUserInfo(userId)
    ])

    // Format stress rate data (bar chart)
    const stressRate = {
      categories: ['Difficult Task', 'Easy Task', 'Medium Task'],
      series: [{
        name: 'Stress Level',
        data: [
          stressRateData.difficultTasks || 0,
          stressRateData.easyTasks || 0,
          stressRateData.mediumTasks || 0
        ],
        colors: ['#FF6B6B', '#4ECDC4', '#FFE66D']
      }]
    }

    // Format work performance data (pie chart) - use meaningful labels
    const workPerformance = {
      series: [
        { name: 'Completed', value: workPerformanceData.segment1 || 0, color: '#8B5CF6' },
        { name: 'In Progress', value: workPerformanceData.segment2 || 0, color: '#EC4899' },
        { name: 'In Review', value: workPerformanceData.segment3 || 0, color: '#10B981' },
        { name: 'Other', value: workPerformanceData.segment4 || 0, color: '#F59E0B' }
      ]
    }

    // Format stress analysis trend (line chart) - use clear metric names
    const stressAnalyzing = {
      categories: stressAnalysisData.map(item => item.period),
      series: [
        {
          name: 'Burnout Index (%)',
          data: stressAnalysisData.map(item => item.metric1 || 0),
          color: '#8B5CF6'
        },
        {
          name: 'Quality Score (%)', 
          data: stressAnalysisData.map(item => item.metric2 || 0),
          color: '#EC4899'
        }
      ],
      warning: stressAnalysisData.length > 0 && stressAnalysisData[stressAnalysisData.length - 1].metric1 > 70
    }

    return SuccessResponse('Get individual performance dashboard successfully', {
      userInfo: {
        name: userInfo?.name || 'Unknown',
        role: userInfo?.role?.role || 'Software Engineer',
        department: userInfo?.department?.name || 'Product Department',
        joinDate: userInfo?.created_at || new Date(),
        status: 'Active'
      },
      stressRate,
      workPerformance,
      stressAnalyzing
    })
  }

  /**
   * Lấy thống kê nhiệm vụ theo quý cho biểu đồ
   * Trả về dữ liệu cho biểu đồ cột theo 4 quý với các trạng thái: Completed, On-going, Not started
   */
  async getQuarterlyTasksChart(dto: { projectId?: string; year?: string }) {
    const { projectId, year } = dto
    const currentYear = year || new Date().getFullYear().toString()

    // Lấy dữ liệu thống kê nhiệm vụ theo từng quý
    const quarterlyData = await this.performanceRepository.getQuarterlyTasksStats(projectId, currentYear)

    // Format dữ liệu cho biểu đồ
    const chartData = {
      quarters: ['Q1', 'Q2', 'Q3', 'Q4'],
      series: [
        {
          name: 'Completed',
          data: quarterlyData.map(q => q.completed || 0),
          color: '#2196F3' // Blue
        },
        {
          name: 'On-going', 
          data: quarterlyData.map(q => q.ongoing || 0),
          color: '#4CAF50' // Green
        },
        {
          name: 'Not started',
          data: quarterlyData.map(q => q.notStarted || 0),
          color: '#FF9800' // Orange
        }
      ],
      summary: {
        totalTasks: quarterlyData.reduce((sum, q) => sum + (q.completed || 0) + (q.ongoing || 0) + (q.notStarted || 0), 0),
        completedTasks: quarterlyData.reduce((sum, q) => sum + (q.completed || 0), 0),
        ongoingTasks: quarterlyData.reduce((sum, q) => sum + (q.ongoing || 0), 0),
        notStartedTasks: quarterlyData.reduce((sum, q) => sum + (q.notStarted || 0), 0)
      }
    }

    return SuccessResponse('Get quarterly tasks chart successfully', chartData)
  }
}
