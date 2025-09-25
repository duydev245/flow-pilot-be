import z from 'zod'

export const PerformanceEvaluationRequestSchema = z.object({
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
})

export const PerformanceEvaluationResponseSchema = z.object({
  summary: z.string(),
  stressRate: z.array(z.object({ label: z.string(), value: z.number() })),
  workPerformance: z.array(z.object({ label: z.string(), value: z.number() })),
  stressAnalyzing: z.array(z.object({ label: z.string(), data: z.array(z.number()) })),
  status: z.string(),
  joined: z.string(),
  name: z.string(),
  position: z.string(),
  department: z.string(),
})
