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

// Aggregate schemas for all employees and projects

// Schema for average employee metrics
export const AverageEmployeeMetricsSchema = z.object({
  period: z.string(),
  projectId: z.string().optional(),
  totalEmployees: z.number(),
  averageCompletionRate: z.number().optional(),
  averageAdherenceRate: z.number().optional(),
  averageComplianceRate: z.number().optional(),
  averageCompletionTimeHours: z.number().optional(),
  averageThroughput: z.number().optional(),
  totalThroughput: z.number().optional(),
  averageReductionRate: z.number().optional(),
  individualRates: z.array(z.object({
    employeeId: z.string(),
    employeeName: z.string(),
    completionRate: z.number().optional(),
    adherenceRate: z.number().optional(),
    complianceRate: z.number().optional(),
    averageCompletionTimeHours: z.number().optional(),
    throughput: z.number().optional(),
    reductionRate: z.number().optional(),
  })).optional(),
})

// Schema for project statistics
export const ProjectStatsSchema = z.object({
  period: z.string(),
  totalProjects: z.number(),
  totalProjectTasks: z.number(),
  totalCompletedTasks: z.number(),
  overallCompletionRate: z.number(),
  projectStats: z.array(z.object({
    projectId: z.string(),
    projectName: z.string(),
    totalTasks: z.number(),
    completedTasks: z.number(),
    completionRate: z.number(),
    status: z.string(),
    process: z.number(),
  })),
})

// Schema for project overview aggregate
export const ProjectOverviewAggregateSchema = z.object({
  period: z.string(),
  totalProjects: z.number(),
  aggregateMetrics: z.object({
    totalTasks: z.number(),
    totalCompleted: z.number(),
    totalOverdue: z.number(),
    totalInProgress: z.number(),
    averageCompletionRate: z.number(),
  }),
  projectOverviews: z.array(z.object({
    projectId: z.string(),
    projectName: z.string(),
    overview: z.any(),
  })),
})

// Schema for project KPI aggregate
export const ProjectKpiAggregateSchema = z.object({
  period: z.string(),
  totalProjects: z.number(),
  aggregateKpi: z.object({
    totalKpiValue: z.number(),
    averageProcess: z.number(),
    averageCompletionRate: z.number(),
  }),
  projectKpis: z.array(z.object({
    projectId: z.string(),
    projectName: z.string(),
    kpi: z.any(),
  })),
})

// Schema for organization AI analysis
export const OrganizationAiAnalysisSchema = z.object({
  period: z.string(),
  totalProjects: z.number(),
  totalEmployees: z.number(),
  organizationSummary: z.string(),
  aggregateMetrics: z.object({
    totalCompleted: z.number(),
    totalDelay: z.number(),
    avgBurnout: z.number(),
    avgQuality: z.number(),
  }),
})

// Schema for organization performance summary
export const OrganizationPerformanceSummarySchema = z.object({
  period: z.string(),
  summary: z.object({
    projects: z.object({
      total: z.number(),
      overallCompletionRate: z.number(),
      totalTasks: z.number(),
      completedTasks: z.number(),
    }),
    employees: z.object({
      total: z.number(),
      averageCompletionRate: z.number(),
      averageDeadlineAdherence: z.number(),
      totalThroughput: z.number(),
    }),
    kpi: z.object({
      totalKpiValue: z.number(),
      averageProcess: z.number(),
    }),
  }),
  detailedData: z.object({
    projectsStats: z.any(),
    projectsOverview: z.any(),
    employeeMetrics: z.object({
      taskCompletion: z.any(),
      deadlineAdherence: z.any(),
      throughput: z.any(),
    }),
  }),
})
