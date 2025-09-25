import { Body, Controller, Post, UseGuards, Get, Query } from '@nestjs/common'
import { PerformanceService } from './performance.service'

import { PerformanceEvaluationRequestDto } from './performance.dto'
import { GetUserId } from 'src/shared/decorators/active-user.decorator'
import { Roles } from 'src/shared/decorators/roles.decorator'
import { RoleName } from 'src/shared/constants/role.constant'
import { AuthRoleGuard } from 'src/shared/guards/auth-role.guard'
import { ZodSerializerDto } from 'nestjs-zod'
import { MessageResDTO } from 'src/shared/dtos/response.dto'

@Controller('performance')
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}


  /**
   * Lấy thống kê chi tiết các loại task: số lượng theo từng trạng thái (completed, in progress, overdue, v.v.), tỉ lệ thay đổi so với tuần trước
   * GET /performance/project-tasks-stats?projectId=xxx
   */
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
  /**
   * Lấy tóm tắt AI về hiệu suất dự án trong 7 ngày gần nhất (hoặc theo khoảng thời gian)
   * GET /performance/project-ai-analysis?projectId=xxx&fromDate=yyyy-mm-dd&toDate=yyyy-mm-dd
   */
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

  /**
   * Lấy danh sách thành viên dự án kèm hiệu suất từng người
   * GET /performance/project-members?projectId=xxx
   */
  @Get('project-members')
  @Roles([RoleName.ProjectManager, RoleName.Admin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  async getProjectMembers(@Query('projectId') projectId: string) {
    return await this.performanceService.getProjectMembers(projectId)
  }
}
