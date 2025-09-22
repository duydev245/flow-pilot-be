import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ZodSerializerDto } from 'nestjs-zod'
import { PackageBodyDto, PackageUpdateDto } from 'src/routes/package/package.dto'
import { RoleName } from 'src/shared/constants/role.constant'
import { Roles } from 'src/shared/decorators/roles.decorator'
import { MessageResDTO } from 'src/shared/dtos/response.dto'
import { AuthRoleGuard } from 'src/shared/guards/auth-role.guard'
import { PackageService } from './package.service'

@Controller('package')
@ApiTags('Package Module')
export class PackageController {
  constructor(private readonly packageService: PackageService) {}

  @Get()
  @ZodSerializerDto(MessageResDTO)
  getAllPackages(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.packageService.getAllPackages({ page: Number(page), limit: Number(limit) })
  }
  @Get('/superadmin')
  @ZodSerializerDto(MessageResDTO)
  getAllPackagesBySuperAdmin(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.packageService.getAllPackagesBySuperAdmin({ page: Number(page), limit: Number(limit) })
  }

  @Get(':id')
  @Roles([RoleName.SuperAdmin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  getPackageById(@Param('id') id: string) {
    return this.packageService.getPackageById(id)
  }

  @Post('create')
  @UseGuards(AuthRoleGuard)
  @Roles([RoleName.SuperAdmin])
  @ZodSerializerDto(MessageResDTO)
  createPackage(@Body() body: PackageBodyDto) {
    return this.packageService.createPackage(body)
  }

  @Put(':id')
  @UseGuards(AuthRoleGuard)
  @Roles([RoleName.SuperAdmin])
  @ZodSerializerDto(MessageResDTO)
  updatePackage(@Body() body: PackageUpdateDto, @Param('id') id: string) {
    return this.packageService.updatePackage(id, body)
  }

  @Delete('/delete/:id')
  @UseGuards(AuthRoleGuard)
  @Roles([RoleName.SuperAdmin])
  @ZodSerializerDto(MessageResDTO)
  deletePackage(@Param('id') id: string) {
    return this.packageService.deletePackage(id)
  }
}
