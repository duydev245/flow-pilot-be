import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common'
import { WorkspaceService } from './workspace.service'
import { ZodSerializerDto } from 'nestjs-zod'
import { MessageResDTO } from 'src/shared/dtos/response.dto'
import { RoleName } from 'src/shared/constants/role.constant'
import { AuthRoleGuard } from 'src/shared/guards/auth-role.guard'
import { Roles } from 'src/shared/decorators/roles.decorator'
import { WorkspaceBodyDto, WorkspaceDeleteDto, WorkspaceUpdateDto, ExtendWorkspaceDto } from './workspace.dto'
import { ApiTags } from '@nestjs/swagger'

@Controller('workspace')
@ApiTags('Workspace Module')
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Get()
  @Roles([RoleName.SuperAdmin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  getAllWorkspaces(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.workspaceService.getAllWorkspaces({ page: Number(page), limit: Number(limit) })
  }

  @Get(':id')
  @Roles([RoleName.SuperAdmin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  getWorkspaceById(@Param('id') id: string) {
    return this.workspaceService.getWorkspaceById(id)
  }

  @Post('create')
  @UseGuards(AuthRoleGuard)
  @Roles([RoleName.SuperAdmin])
  @ZodSerializerDto(MessageResDTO)
  createWorkspace(@Body() body: WorkspaceBodyDto) {
    return this.workspaceService.createWorkspace(body)
  }

  @Put(':id')
  @UseGuards(AuthRoleGuard)
  @Roles([RoleName.SuperAdmin])
  @ZodSerializerDto(MessageResDTO)
  updateWorkspace(@Body() body: WorkspaceUpdateDto, @Param('id') id: string) {
    return this.workspaceService.updateWorkspace(id, body)
  }
  @Put('/extend/:id')
  @UseGuards(AuthRoleGuard)
  @Roles([RoleName.SuperAdmin])
  @ZodSerializerDto(MessageResDTO)
  ExtendWorkspace(@Body() body: ExtendWorkspaceDto, @Param('id') id: string) {
    return this.workspaceService.extendWorkspace(id, body)
  }

  @Put('/delete/:id')
  @UseGuards(AuthRoleGuard)
  @Roles([RoleName.SuperAdmin])
  @ZodSerializerDto(MessageResDTO)
  deleteWorkspace(@Body() body: WorkspaceDeleteDto, @Param('id') id: string) {
    return this.workspaceService.deleteWorkspace(id, body)
  }
}
