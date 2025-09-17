import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common'
import { PackageService } from './package.service'
import { ZodSerializerDto } from 'nestjs-zod'
import { MessageResDTO } from 'src/shared/dtos/response.dto'
import { RoleName } from 'src/shared/constants/role.constant'
import { AuthRoleGuard } from 'src/shared/guards/auth-role.guard'
import { Roles } from 'src/shared/decorators/roles.decorator'
import { PackageBodyDto, PackageDeleteDto, PackageUpdateDto } from 'src/routes/package/package.dto'
import { ApiTags } from '@nestjs/swagger'

@Controller('package')
@ApiTags(' Module')
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

  @Put('/delete/:id')
  @UseGuards(AuthRoleGuard)
  @Roles([RoleName.SuperAdmin])
  @ZodSerializerDto(MessageResDTO)
  deletePackage(@Body() body: PackageDeleteDto, @Param('id') id: string) {
    console.log('body: ', body)
    console.log('id: ', id)
    return this.packageService.deletePackage(id, body)
  }
}
