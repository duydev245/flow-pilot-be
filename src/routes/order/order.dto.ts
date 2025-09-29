import { createZodDto } from 'nestjs-zod'
import { CreateOrderSchema, UpdateOrderSchema, OrderSchema } from './order.model'

export class CreateOrderDto extends createZodDto(CreateOrderSchema) {}
export class UpdateOrderDto extends createZodDto(UpdateOrderSchema) {}
