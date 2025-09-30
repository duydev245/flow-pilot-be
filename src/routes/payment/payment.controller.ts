import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common'
import { PaymentService } from './payment.service'
import { ZodSerializerDto } from 'nestjs-zod'
import { CreatePaymentRequestDto, UpdatePaymentRequestDto, WebhookPaymentBodyDTO } from './payment.dto'
import { MessageResDTO } from 'src/shared/dtos/response.dto'
import { Roles } from 'src/shared/decorators/roles.decorator'
import { RoleName } from 'src/shared/constants/role.constant'
import { AuthRoleGuard } from 'src/shared/guards/auth-role.guard'
import { ApiBearerAuth, ApiSecurity } from '@nestjs/swagger'

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) { }

  @Get()
  @ApiSecurity('apiKey')
  @ApiBearerAuth('access-token')
  @Roles([RoleName.SuperAdmin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  getAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.paymentService.getAll({ page: Number(page), limit: Number(limit) })
  }

  @Get(':id')
  @ApiSecurity('apiKey')
  @ApiBearerAuth('access-token')
  @Roles([RoleName.SuperAdmin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  getById(@Param('id') id: string) {
    return this.paymentService.getById(Number(id))
  }

  @Post('create')
  @ApiSecurity('apiKey')
  @ApiBearerAuth('access-token')
  @Roles([RoleName.SuperAdmin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  create(@Body() body: CreatePaymentRequestDto) {
    return this.paymentService.create(body)
  }

  @Put(':id')
  @ApiSecurity('apiKey')
  @ApiBearerAuth('access-token')
  @Roles([RoleName.SuperAdmin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  update(@Param('id') id: string, @Body() body: UpdatePaymentRequestDto) {
    return this.paymentService.update(Number(id), body)
  }

  @Post('receive')
  @ZodSerializerDto(MessageResDTO)
  receive(@Body() body: WebhookPaymentBodyDTO) {
    return this.paymentService.receive(body)
  }

  @Delete('delete/:id')
  @ApiSecurity('apiKey')
  @ApiBearerAuth('access-token')
  @Roles([RoleName.SuperAdmin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  delete(@Param('id') id: string) {
    return this.paymentService.delete(Number(id))
  }
}
