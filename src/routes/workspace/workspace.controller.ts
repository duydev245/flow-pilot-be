import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { ZodSerializerDto } from 'nestjs-zod'
import { RoleName } from 'src/shared/constants/role.constant'
import { Roles } from 'src/shared/decorators/roles.decorator'
import { MessageResDTO } from 'src/shared/dtos/response.dto'
import { AuthRoleGuard } from 'src/shared/guards/auth-role.guard'
import { ExtendWorkspaceDto, WorkspaceBodyDto, WorkspaceUpdateDto } from './workspace.dto'
import { WorkspaceService } from './workspace.service'

@Controller('workspace')
@ApiTags('Workspace Module')
@ApiBearerAuth('access-token')
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

  @Delete('/delete/:id')
  @UseGuards(AuthRoleGuard)
  @Roles([RoleName.SuperAdmin])
  @ZodSerializerDto(MessageResDTO)
  deleteWorkspace(@Param('id') id: string) {
    return this.workspaceService.deleteWorkspace(id)
  }
}
