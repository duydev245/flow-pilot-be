

import { createZodDto } from 'nestjs-zod';
import { PerformanceEvaluationRequestSchema, PerformanceEvaluationResponseSchema } from './performance.model';

export class PerformanceEvaluationRequestDto extends createZodDto(PerformanceEvaluationRequestSchema) {}
export class PerformanceEvaluationResponseDto extends createZodDto(PerformanceEvaluationResponseSchema) {}
