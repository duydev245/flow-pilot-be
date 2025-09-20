import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ZodSerializerDto } from 'nestjs-zod'
import { FeatureBodyDto, FeatureUpdateBodyDto } from 'src/routes/feature/feature.dto'
import { RoleName } from 'src/shared/constants/role.constant'
import { Roles } from 'src/shared/decorators/roles.decorator'
import { MessageResDTO } from 'src/shared/dtos/response.dto'
import { AuthRoleGuard } from 'src/shared/guards/auth-role.guard'
import { FeatureService } from './feature.service'

@Controller('feature')
@ApiTags('Feature Module')
export class FeatureController {
  constructor(private readonly featureService: FeatureService) {}

  @Get()
  @Roles([RoleName.SuperAdmin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  getAllFeatures(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.featureService.getAllFeatures({ page: Number(page), limit: Number(limit) })
  }

  @Get(':id')
  @Roles([RoleName.SuperAdmin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  getFeatureById(@Param('id') id: string) {
    return this.featureService.getFeatureById(id)
  }

  @Post('create')
  @Roles([RoleName.SuperAdmin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  createFeature(@Body() body: FeatureBodyDto) {
    return this.featureService.createFeature(body)
  }
  @Put(':id')
  @Roles([RoleName.SuperAdmin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  updateFeature(@Body() body: FeatureUpdateBodyDto, @Param('id') id: string) {
    return this.featureService.updateFeature(id, body)
  }

  @Delete('delete/:id')
  @Roles([RoleName.SuperAdmin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  deleteFeature(@Param('id') id: string) {
    return this.featureService.deleteFeature(id)
  }
}
