import { createZodDto } from 'nestjs-zod'
import { UploadFileSchema, UploadForTaskBodySchema, UploadForUserBodySchema } from './file.model';

export class UploadForTaskBodyDto extends createZodDto(UploadForTaskBodySchema) {}
export class UploadForUserBodyDto extends createZodDto(UploadForUserBodySchema) {}
export class UploadFileDto extends createZodDto(UploadFileSchema) {}
