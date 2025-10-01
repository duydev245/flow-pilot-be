import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common'
import { ConsultationRequestService } from './consultation-request.service'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CreateConsultationRequestDto,
  UpdateConsultationRequestDto,
} from './consultation-request.dto'
import { MessageResDTO } from 'src/shared/dtos/response.dto'
import { Roles } from 'src/shared/decorators/roles.decorator'
import { RoleName } from 'src/shared/constants/role.constant'
import { AuthRoleGuard } from 'src/shared/guards/auth-role.guard'

@Controller('consultation-request')
@ApiTags('Consultation Request')
export class ConsultationRequestController {
  constructor(private readonly consultationRequestService: ConsultationRequestService) { }

  @Get()
  @ApiBearerAuth('access-token')
  @Roles([RoleName.SuperAdmin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  getAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    return this.consultationRequestService.getAll({ page: Number(page), limit: Number(limit) })
  }

  @Get(':id')
  @ApiBearerAuth('access-token')
  @Roles([RoleName.SuperAdmin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  getById(@Param('id') id: string) {
    return this.consultationRequestService.getById(Number(id))
  }

  // Public route to create a consultation request
  @Post('create')
  @ZodSerializerDto(MessageResDTO)
  create(@Body() body: CreateConsultationRequestDto) {
    return this.consultationRequestService.create(body)
  }

  @Put(':id')
  @ApiBearerAuth('access-token')
  @Roles([RoleName.SuperAdmin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  update(@Param('id') id: string, @Body() body: UpdateConsultationRequestDto) {
    return this.consultationRequestService.update(Number(id), body)
  }

  @Delete('delete/:id')
  @ApiBearerAuth('access-token')
  @Roles([RoleName.SuperAdmin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  delete(@Param('id') id: string) {
    return this.consultationRequestService.delete(Number(id))
  }
}
