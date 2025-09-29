import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common'
import { OrderService } from './order.service'
import { ZodSerializerDto } from 'nestjs-zod'
import { CreateOrderDto, UpdateOrderDto } from './order.dto'
import { MessageResDTO } from 'src/shared/dtos/response.dto'
import { Roles } from 'src/shared/decorators/roles.decorator'
import { RoleName } from 'src/shared/constants/role.constant'
import { AuthRoleGuard } from 'src/shared/guards/auth-role.guard'

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Get()
  @Roles([RoleName.SuperAdmin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  getAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.orderService.getAll({ page: Number(page), limit: Number(limit) })
  }

  @Get(':id')
  @Roles([RoleName.SuperAdmin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  getById(@Param('id') id: string) {
    return this.orderService.getById(id)
  }

  @Post('create')
  @Roles([RoleName.SuperAdmin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  create(@Body() body: CreateOrderDto) {
    return this.orderService.create(body)
  }

  @Put(':id')
  @Roles([RoleName.SuperAdmin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  update(@Param('id') id: string, @Body() body: UpdateOrderDto) {
    return this.orderService.update(id, body)
  }

  @Delete('delete/:id')
  @Roles([RoleName.SuperAdmin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  delete(@Param('id') id: string) {
    return this.orderService.delete(id)
  }
}
