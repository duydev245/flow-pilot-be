

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
