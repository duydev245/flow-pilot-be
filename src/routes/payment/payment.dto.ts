import { createZodDto } from "nestjs-zod";
import { CreatePaymentRequestSchema, CreatePaymentSchema, UpdatePaymentSchema, WebhookPaymentBodySchema } from "./payment.model";

export class CreatePaymentRequestDto extends createZodDto(CreatePaymentRequestSchema) {}
export class CreatePaymentDto extends createZodDto(CreatePaymentSchema) {}
export class UpdatePaymentRequestDto extends createZodDto(UpdatePaymentSchema) {}
export class WebhookPaymentBodyDTO extends createZodDto(WebhookPaymentBodySchema) {}
