

import { createZodDto } from 'nestjs-zod';
import { 
  PerformanceEvaluationRequestSchema, 
  PerformanceEvaluationResponseSchema,
  PerformanceMetricsQuerySchema,
  TaskCompletionRateResponseSchema,
  DeadlineAdherenceResponseSchema,
  WorkHoursComplianceResponseSchema,
  TimeToCompletionResponseSchema,
  ThroughputResponseSchema,
  ErrorReductionResponseSchema,
  AverageEmployeeMetricsSchema,
  ProjectStatsSchema,
  ProjectOverviewAggregateSchema,
  ProjectKpiAggregateSchema,
  OrganizationAiAnalysisSchema,
  OrganizationPerformanceSummarySchema
} from './performance.model';

export class PerformanceEvaluationRequestDto extends createZodDto(PerformanceEvaluationRequestSchema) {}
export class PerformanceEvaluationResponseDto extends createZodDto(PerformanceEvaluationResponseSchema) {}
export class PerformanceMetricsQueryDto extends createZodDto(PerformanceMetricsQuerySchema) {}
export class TaskCompletionRateResponseDto extends createZodDto(TaskCompletionRateResponseSchema) {}
export class DeadlineAdherenceResponseDto extends createZodDto(DeadlineAdherenceResponseSchema) {}
export class WorkHoursComplianceResponseDto extends createZodDto(WorkHoursComplianceResponseSchema) {}
export class TimeToCompletionResponseDto extends createZodDto(TimeToCompletionResponseSchema) {}
export class ThroughputResponseDto extends createZodDto(ThroughputResponseSchema) {}
export class ErrorReductionResponseDto extends createZodDto(ErrorReductionResponseSchema) {}

// Aggregate DTOs
export class AverageEmployeeMetricsDto extends createZodDto(AverageEmployeeMetricsSchema) {}
export class ProjectStatsDto extends createZodDto(ProjectStatsSchema) {}
export class ProjectOverviewAggregateDto extends createZodDto(ProjectOverviewAggregateSchema) {}
export class ProjectKpiAggregateDto extends createZodDto(ProjectKpiAggregateSchema) {}
export class OrganizationAiAnalysisDto extends createZodDto(OrganizationAiAnalysisSchema) {}
export class OrganizationPerformanceSummaryDto extends createZodDto(OrganizationPerformanceSummarySchema) {}

// Quarterly Tasks Chart DTO
export class QuarterlyTasksChartQueryDto {
  projectId?: string
  year?: string
}

export class QuarterlyTasksChartResponseDto {
  quarters: string[]
  series: {
    name: string
    data: number[]
    color: string
  }[]
  summary: {
    totalTasks: number
    completedTasks: number
    ongoingTasks: number
    notStartedTasks: number
  }
}

// Individual Performance Dashboard DTO
export class IndividualPerformanceDashboardQueryDto {
  period?: string
  fromDate?: string
  toDate?: string
}

export class IndividualPerformanceDashboardResponseDto {
  userInfo: {
    name: string
    role: string
    department: string
    joinDate: Date
    status: string
  }
  stressRate: {
    categories: string[]
    series: {
      name: string
      data: number[]
      colors: string[]
    }[]
  }
  workPerformance: {
    series: {
      name: string
      value: number
      color: string
    }[]
  }
  stressAnalyzing: {
    categories: string[]
    series: {
      name: string
      data: number[]
      color: string
    }[]
    warning: boolean
  }
}
