import { Body, Controller, Get, Post, Query, UseGuards, Param } from '@nestjs/common'
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

  /**
   * Lấy thống kê các nhiệm vụ của dự án
   * Quyền: Quản lý dự án hoặc Admin
   * Trả về: Thống kê tổng quan về nhiệm vụ trong dự án (số lượng, trạng thái)
   */
  @Get('project-tasks-stats')
  @Roles([RoleName.ProjectManager, RoleName.Admin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  async getProjectTasksStats(@Query('projectId') projectId: string) {
    return await this.performanceService.getProjectTasksStats(projectId)
  }

  /**
   * Lấy tổng quan hiệu suất của dự án
   * Quyền: Quản lý dự án hoặc Admin
   * Trả về: Báo cáo tổng quan về tiến độ, hiệu suất dự án
   */
  @Get('project-overview')
  @Roles([RoleName.ProjectManager, RoleName.Admin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  async getProjectOverview(@Query('projectId') projectId: string) {
    return await this.performanceService.getProjectOverview(projectId)
  }

  /**
   * Lấy các chỉ số KPI (Key Performance Indicators) của dự án
   * Quyền: Tất cả người dùng
   * Trả về: Các chỉ số đo lường hiệu suất chính của dự án
   */
  @Get('project-kpi')
  async getProjectKpi(@Query('projectId') projectId: string) {
    return await this.performanceService.getProjectKpi(projectId)
  }

  /**
   * Lấy phân tích hiệu suất dự án bằng AI
   * Quyền: Quản lý dự án hoặc Admin
   * Trả về: Báo cáo phân tích hiệu suất được tạo bởi AI
   */
  @Get('project-ai-analysis')
  @Roles([RoleName.ProjectManager, RoleName.Admin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  async getProjectAIAnalysis(@Query('projectId') projectId: string) {
    return await this.performanceService.getProjectAIAnalysis({ projectId })
  }

  /**
   * Đánh giá hiệu suất cá nhân bằng AI
   * Quyền: Nhân viên, Quản lý dự án hoặc Admin
   * Trả về: Đánh giá hiệu suất cá nhân được tạo bởi AI
   */
  @Get('evaluate')
  @Roles([RoleName.Employee, RoleName.ProjectManager, RoleName.Admin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  async evaluatePerformance(@GetUserId() userId: string) {
    return await this.performanceService.evaluatePerformanceByAI(userId, {})
  }

  /**
   * Lấy danh sách thành viên trong dự án
   * Quyền: Quản lý dự án hoặc Admin
   * Trả về: Danh sách các thành viên tham gia dự án
   */
  @Get('project-members')
  @Roles([RoleName.ProjectManager, RoleName.Admin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  async getProjectMembers(@Query('projectId') projectId: string) {
    return await this.performanceService.getProjectMembers(projectId)
  }

  // Các API đo lường hiệu suất chi tiết

  /**
   * Lấy tỷ lệ hoàn thành nhiệm vụ của người dùng
   * Quyền: Quản lý dự án, Admin hoặc Nhân viên
   * Trả về: Tỷ lệ phần trăm nhiệm vụ đã hoàn thành trong khoảng thời gian
   */
  @Get('task-completion-rate/:userId')
  @Roles([RoleName.ProjectManager, RoleName.Admin, RoleName.Employee])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  async getTaskCompletionRate(
    @Param('userId') userId: string,
    @Query('period') period: string = 'monthly',
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return await this.performanceService.getTaskCompletionRate(userId, { period, fromDate, toDate })
  }

  /**
   * Đo lường khả năng tuân thủ deadline của người dùng
   * Quyền: Quản lý dự án, Admin hoặc Nhân viên
   * Trả về: Tỷ lệ hoàn thành công việc đúng hạn
   */
  @Get('deadline-adherence/:userId')
  @Roles([RoleName.ProjectManager, RoleName.Admin, RoleName.Employee])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  async getDeadlineAdherence(
    @Param('userId') userId: string,
    @Query('period') period: string = 'monthly',
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return await this.performanceService.getDeadlineAdherence(userId, { period, fromDate, toDate })
  }

  /**
   * Kiểm tra tuân thủ giờ làm việc quy định
   * Quyền: Quản lý dự án, Admin hoặc Nhân viên
   * Trả về: Mức độ tuân thủ giờ làm việc (có đủ giờ theo quy định không)
   */
  @Get('work-hours-compliance/:userId')
  @Roles([RoleName.ProjectManager, RoleName.Admin, RoleName.Employee])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  async getWorkHoursCompliance(
    @Param('userId') userId: string,
    @Query('period') period: string = 'monthly',
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return await this.performanceService.getWorkHoursCompliance(userId, { period, fromDate, toDate })
  }

  /**
   * Đo thời gian trung bình để hoàn thành nhiệm vụ
   * Quyền: Quản lý dự án, Admin hoặc Nhân viên
   * Trả về: Thời gian trung bình để hoàn thành một nhiệm vụ
   */
  @Get('time-to-completion/:userId')
  @Roles([RoleName.ProjectManager, RoleName.Admin, RoleName.Employee])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  async getTimeToCompletion(
    @Param('userId') userId: string,
    @Query('period') period: string = 'monthly',
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return await this.performanceService.getTimeToCompletion(userId, { period, fromDate, toDate })
  }

  /**
   * Đo năng suất làm việc (số lượng task hoàn thành trong khoảng thời gian)
   * Quyền: Quản lý dự án, Admin hoặc Nhân viên
   * Trả về: Số lượng nhiệm vụ hoàn thành theo thời gian
   */
  @Get('throughput/:userId')
  @Roles([RoleName.ProjectManager, RoleName.Admin, RoleName.Employee])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  async getThroughput(
    @Param('userId') userId: string,
    @Query('period') period: string = 'monthly',
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return await this.performanceService.getThroughput(userId, { period, fromDate, toDate })
  }

  /**
   * Đo lường khả năng giảm thiểu lỗi trong công việc
   * Quyền: Quản lý dự án, Admin hoặc Nhân viên
   * Trả về: Tỷ lệ giảm lỗi hoặc chất lượng công việc cải thiện
   */
  @Get('error-reduction/:userId')
  @Roles([RoleName.ProjectManager, RoleName.Admin, RoleName.Employee])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  async getErrorReduction(
    @Param('userId') userId: string,
    @Query('period') period: string = 'monthly',
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return await this.performanceService.getErrorReduction(userId, { period, fromDate, toDate })
  }
}
