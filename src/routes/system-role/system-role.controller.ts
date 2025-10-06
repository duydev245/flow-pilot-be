import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { ZodSerializerDto } from 'nestjs-zod'
import { SystemRoleService } from './system-role.service'
import { CreateSystemRoleBodyDto, UpdateSystemRoleBodyDto } from './system-role.dto'
import { RoleName } from 'src/shared/constants/role.constant'
import { Roles } from 'src/shared/decorators/roles.decorator'
import { AuthRoleGuard } from 'src/shared/guards/auth-role.guard'
import { MessageResDTO } from 'src/shared/dtos/response.dto'

@Controller('system-role')
@ApiTags('System Role Module')
@ApiBearerAuth('access-token')
export class SystemRoleController {
  constructor(private readonly systemRoleService: SystemRoleService) { }

  // Get all system roles
  @Get()
  @Roles([RoleName.SuperAdmin, RoleName.Admin, RoleName.ProjectManager, RoleName.Employee])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  getAll(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
  ) {
    return this.systemRoleService.getAll(Number(page), Number(pageSize))
  }

  // Get system role by ID
  @Get('/:id')
  @Roles([RoleName.SuperAdmin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.systemRoleService.getById(id)
  }

  // Create system role
  @Post()
  @Roles([RoleName.SuperAdmin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  create(@Body() body: CreateSystemRoleBodyDto) {
    return this.systemRoleService.create(body)
  }

  // Update system role
  @Put('/:id')
  @Roles([RoleName.SuperAdmin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateSystemRoleBodyDto) {
    return this.systemRoleService.update(id, body)
  }

  // Delete system role
  @Delete('/:id')
  @Roles([RoleName.SuperAdmin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.systemRoleService.delete(id)
  }
}
