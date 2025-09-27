import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common'
import { PerformanceService } from './performance.service'

import { ZodSerializerDto } from 'nestjs-zod'
import { RoleName } from 'src/shared/constants/role.constant'
import { GetUserId } from 'src/shared/decorators/active-user.decorator'
import { Roles } from 'src/shared/decorators/roles.decorator'
import { MessageResDTO } from 'src/shared/dtos/response.dto'
import { AuthRoleGuard } from 'src/shared/guards/auth-role.guard'
import { PerformanceEvaluationRequestDto } from './performance.dto'

@Controller('performance')
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  @Get('project-tasks-stats')
  @Roles([RoleName.ProjectManager, RoleName.Admin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  async getProjectTasksStats(@Query('projectId') projectId: string) {
    return await this.performanceService.getProjectTasksStats(projectId)
  }

  @Get('project-overview')
  @Roles([RoleName.ProjectManager, RoleName.Admin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  async getProjectOverview(@Query('projectId') projectId: string) {
    return await this.performanceService.getProjectOverview(projectId)
  }

  @Get('project-kpi')
  async getProjectKpi(@Query('projectId') projectId: string) {
    return await this.performanceService.getProjectKpi(projectId)
  }

  @Get('project-ai-analysis')
  @Roles([RoleName.ProjectManager, RoleName.Admin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  async getProjectAIAnalysis(@Query('projectId') projectId: string) {
    return await this.performanceService.getProjectAIAnalysis({ projectId })
  }
  @Post('evaluate')
  @Roles([RoleName.Employee, RoleName.ProjectManager, RoleName.Admin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  async evaluatePerformance(@GetUserId() userId: string, @Body() dto: PerformanceEvaluationRequestDto) {
    return await this.performanceService.evaluatePerformanceByAI(userId, { ...dto, userId })
  }

  @Get('project-members')
  @Roles([RoleName.ProjectManager, RoleName.Admin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  async getProjectMembers(@Query('projectId') projectId: string) {
    return await this.performanceService.getProjectMembers(projectId)
  }
}
