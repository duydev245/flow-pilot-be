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

// Schema for performance metrics query parameters
export const PerformanceMetricsQuerySchema = z.object({
  period: z.enum(['weekly', 'monthly', 'quarterly']).optional().default('monthly'),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
})

// Schema for task completion rate response
export const TaskCompletionRateResponseSchema = z.object({
  userId: z.string(),
  period: z.string(),
  totalTasks: z.number(),
  completedTasks: z.number(),
  completionRate: z.number(), // percentage
  previousPeriodRate: z.number().optional(),
  changePercentage: z.number().optional(),
})

// Schema for deadline adherence response
export const DeadlineAdherenceResponseSchema = z.object({
  userId: z.string(),
  period: z.string(),
  totalTasks: z.number(),
  onTimeTasks: z.number(),
  adherenceRate: z.number(), // percentage
  averageDelayDays: z.number().optional(),
  previousPeriodRate: z.number().optional(),
})

// Schema for work hours compliance response
export const WorkHoursComplianceResponseSchema = z.object({
  userId: z.string(),
  period: z.string(),
  totalWorkingHours: z.number(),
  standardHours: z.number(),
  complianceRate: z.number(), // percentage
  overtimeHours: z.number(),
  previousPeriodRate: z.number().optional(),
})

// Schema for time-to-completion response
export const TimeToCompletionResponseSchema = z.object({
  userId: z.string(),
  period: z.string(),
  completedTasks: z.number(),
  averageCompletionTimeHours: z.number(),
  medianCompletionTimeHours: z.number().optional(),
  fastestTaskHours: z.number().optional(),
  slowestTaskHours: z.number().optional(),
  previousPeriodAverage: z.number().optional(),
})

// Schema for throughput response
export const ThroughputResponseSchema = z.object({
  userId: z.string(),
  period: z.string(),
  completedTasks: z.number(),
  deliverables: z.number(), // same as completed tasks for now
  tasksPerDay: z.number(),
  tasksPerWeek: z.number(),
  previousPeriodThroughput: z.number().optional(),
  changePercentage: z.number().optional(),
})

// Schema for error reduction response
export const ErrorReductionResponseSchema = z.object({
  userId: z.string(),
  currentPeriod: z.string(),
  previousPeriod: z.string(),
  currentPeriodErrors: z.number(),
  previousPeriodErrors: z.number(),
  errorRate: z.number(), // current period error rate
  previousErrorRate: z.number(),
  reductionRate: z.number(), // negative means increase in errors
  totalTasksCurrentPeriod: z.number(),
  totalTasksPreviousPeriod: z.number(),
})
