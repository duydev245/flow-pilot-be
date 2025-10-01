import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  ProjecAdmintUpdateDto,
  ProjectAdminBodyDto,
  ProjectBodyDto,
  ProjectUpdateDto,
} from 'src/routes/project/project.dto'
import type { AssignUsersToProjectDto } from './project.model'
import { RoleName } from 'src/shared/constants/role.constant'
import { GetWorkSpaceId } from 'src/shared/decorators/active-user.decorator'
import { Roles } from 'src/shared/decorators/roles.decorator'
import { MessageResDTO } from 'src/shared/dtos/response.dto'
import { AuthRoleGuard } from 'src/shared/guards/auth-role.guard'
import { ProjectService } from './project.service'

@Controller('project')
@ApiTags('Project Module')
@ApiBearerAuth('access-token')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get('/super-admin')
  @Roles([RoleName.SuperAdmin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  getAllProjectBySuperAdmin(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.projectService.getAllProjectBySuperAdmin({ page: Number(page), limit: Number(limit) })
  }

  @Get('/super-admin/:id')
  @Roles([RoleName.SuperAdmin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  getProjectByIdBySuperAdmin(@Param('id') id: string) {
    return this.projectService.getProjectByIdSuperAdmin(id)
  }

  @Post('/super-admin/create')
  @Roles([RoleName.SuperAdmin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  createProject(@Body() body: ProjectAdminBodyDto) {
    return this.projectService.createProjectBySuperAdmin(body)
  }

  @Put('/super-admin/:id')
  @Roles([RoleName.SuperAdmin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  updateProject(@Param('id') id: string, @Body() body: ProjecAdmintUpdateDto) {
    return this.projectService.updateProjectBySuperAdmin(id, body)
  }

  @Delete('/super-admin/delete/:id')
  @Roles([RoleName.SuperAdmin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  deleteProject(@Param('id') id: string) {
    return this.projectService.deleteProjectBySuperAdmin(id)
  }

  // Get all projects by all users in the workspace
  @Get()
  @UseGuards(AuthRoleGuard)
  @Roles([RoleName.SuperAdmin, RoleName.Admin, RoleName.Employee, RoleName.ProjectManager])
  @ZodSerializerDto(MessageResDTO)
  getAllProject(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @GetWorkSpaceId() workspace_id: string,
  ) {
    return this.projectService.getAllProject(workspace_id, { page: Number(page), limit: Number(limit) })
  }
  @Get('/:id')
  @UseGuards(AuthRoleGuard)
  @Roles([RoleName.SuperAdmin, RoleName.Admin, RoleName.Employee, RoleName.ProjectManager])
  @ZodSerializerDto(MessageResDTO)
  getProjectByIdUser(@Param('id') id: string, @GetWorkSpaceId() workspace_id: string) {
    return this.projectService.getProjectById(id, workspace_id)
  }

  @Post('/create')
  @UseGuards(AuthRoleGuard)
  @Roles([RoleName.Admin, RoleName.ProjectManager])
  @ZodSerializerDto(MessageResDTO)
  createProjectByUser(@Body() body: ProjectBodyDto, @GetWorkSpaceId() workspace_id: string) {
    return this.projectService.createProjectByUser(body, workspace_id)
  }

  @Put('/:id')
  @UseGuards(AuthRoleGuard)
  @Roles([RoleName.Admin, RoleName.ProjectManager])
  @ZodSerializerDto(MessageResDTO)
  updateProjectByUser(@Param('id') id: string, @Body() body: ProjectUpdateDto, @GetWorkSpaceId() workspace_id: string) {
    return this.projectService.updateProjectByUser(id, body, workspace_id)
  }

  @Delete('/:id')
  @UseGuards(AuthRoleGuard)
  @Roles([RoleName.Admin, RoleName.ProjectManager])
  @ZodSerializerDto(MessageResDTO)
  deleteProjectByUser(@Param('id') id: string, @GetWorkSpaceId() workspace_id: string) {
    return this.projectService.deleteProjectByUser(id, workspace_id)
  }

  @Post('/:id/assign-users')
  @UseGuards(AuthRoleGuard)
  @Roles([RoleName.Admin, RoleName.ProjectManager])
  @ZodSerializerDto(MessageResDTO)
  assignUsersToProject(@Param('id') projectId: string, @Body() body: AssignUsersToProjectDto) {
    return this.projectService.assignUsersToProject(projectId, body)
  }
}
