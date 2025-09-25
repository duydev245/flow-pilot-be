import { Injectable } from '@nestjs/common'
import { PerformanceRepository } from 'src/routes/performance/performance.repo'
import envConfig from 'src/shared/config'
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
}
