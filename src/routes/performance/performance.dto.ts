

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
  ErrorReductionResponseSchema
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
