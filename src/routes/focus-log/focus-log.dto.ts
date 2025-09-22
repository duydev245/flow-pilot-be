import { createZodDto } from 'nestjs-zod';
import { DailyFocusLogCreateSchema, DailyFocusLogUpdateSchema } from './focus-log.model';

export class DailyFocusLogCreateDto extends createZodDto(DailyFocusLogCreateSchema) {}
export class DailyFocusLogUpdateDto extends createZodDto(DailyFocusLogUpdateSchema) {}
