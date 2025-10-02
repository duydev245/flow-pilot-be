import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { ZodSerializerDto } from 'nestjs-zod'
import { DepartmentService } from './department.service'
import { CreateDepartmentBodyDto, UpdateDepartmentBodyDto } from './department.dto'
import { RoleName } from 'src/shared/constants/role.constant'
import { Roles } from 'src/shared/decorators/roles.decorator'
import { AuthRoleGuard } from 'src/shared/guards/auth-role.guard'
import { MessageResDTO } from 'src/shared/dtos/response.dto'
import { GetWorkSpaceId } from 'src/shared/decorators/active-user.decorator'

@Controller('department')
@ApiTags('Department Module')
@ApiBearerAuth('access-token')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) { }

  // Get all departments by super admin
  @Get('/super-admin')
  @Roles([RoleName.SuperAdmin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  getAll(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
  ) {
    return this.departmentService.getAll(Number(page), Number(pageSize))
  }

  // Get all departments by workspace
  @Get()
  @Roles([RoleName.Admin, RoleName.ProjectManager, RoleName.Employee])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  getAllByWorkspace(
    @GetWorkSpaceId() workspaceId: string,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
  ) {
    return this.departmentService.getAllByWorkspace(workspaceId, Number(page), Number(pageSize))
  }

  // Get department by ID
  @Get('/:id')
  @Roles([RoleName.SuperAdmin, RoleName.Admin, RoleName.ProjectManager, RoleName.Employee])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.departmentService.getById(id)
  }

  // Create department
  @Post()
  @Roles([RoleName.Admin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  create(
    @GetWorkSpaceId() workspaceId: string,
    @Body() body: CreateDepartmentBodyDto
  ) {
    return this.departmentService.create(workspaceId, body)
  }

  // Update department
  @Put('/:id')
  @Roles([RoleName.SuperAdmin, RoleName.Admin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateDepartmentBodyDto) {
    return this.departmentService.update(id, body)
  }

  // Delete department
  @Delete('/:id')
  @Roles([RoleName.SuperAdmin, RoleName.Admin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.departmentService.delete(id)
  }
}
