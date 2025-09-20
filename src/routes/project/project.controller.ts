import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ZodSerializerDto } from 'nestjs-zod'
import { RoleName } from 'src/shared/constants/role.constant'
import { GetWorkSpaceId } from 'src/shared/decorators/active-user.decorator'
import { Roles } from 'src/shared/decorators/roles.decorator'
import { MessageResDTO } from 'src/shared/dtos/response.dto'
import { AuthRoleGuard } from 'src/shared/guards/auth-role.guard'
import { ProjectService } from './project.service'
import { ProjectBodyDto } from 'src/routes/project/project.dto'

@Controller('project')
@ApiTags('Project Module')
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
  getProjectById(@Param('id') id: string) {
    return this.projectService.getProjectByIdSuperAdmin(id)
  }

  @Post('/super-admin/create')
  @Roles([RoleName.SuperAdmin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  createProject(@Body() body: ProjectBodyDto) {
    return this.projectService.createProjectBySuperAdmin(body)
  }

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
}
