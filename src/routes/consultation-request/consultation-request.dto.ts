import { createZodDto } from 'nestjs-zod';
import { 
  CreateConsultationRequestSchema, 
  UpdateConsultationRequestSchema, 
} from './consultation-request.model';

// Export DTO classes generated from Zod schemas
export class CreateConsultationRequestDto extends createZodDto(CreateConsultationRequestSchema) {}

export class UpdateConsultationRequestDto extends createZodDto(UpdateConsultationRequestSchema) {}

