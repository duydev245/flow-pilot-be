import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common'
import { PerformanceService } from './performance.service'

import { ApiTags } from '@nestjs/swagger'
import { ZodSerializerDto } from 'nestjs-zod'
import { RoleName } from 'src/shared/constants/role.constant'
import { Roles } from 'src/shared/decorators/roles.decorator'
import { MessageResDTO } from 'src/shared/dtos/response.dto'
import { AuthRoleGuard } from 'src/shared/guards/auth-role.guard'
import { GetUserId } from 'src/shared/decorators/active-user.decorator'

@Controller('performance')
@ApiTags('Performance')
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
   * Đánh giá hiệu suất tổ chức bằng AI
   * Quyền: Nhân viên, Quản lý dự án hoặc Admin
   * Trả về: Đánh giá hiệu suất trung bình của tổ chức được tạo bởi AI
   */
  @Get('evaluate')
  @Roles([RoleName.Employee, RoleName.ProjectManager, RoleName.Admin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  async evaluatePerformance(@Query('projectId') projectId?: string) {
    return await this.performanceService.evaluateOrganizationPerformanceByAI({ projectId })
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

  // API tính tổng và trung bình hiệu suất của tất cả employees

  /**
   * Lấy tỷ lệ hoàn thành nhiệm vụ trung bình của tất cả nhân viên
   * Quyền: Quản lý dự án hoặc Admin
   * Trả về: Tỷ lệ phần trăm nhiệm vụ đã hoàn thành trung bình
   */
  @Get('average-task-completion-rate')
  @Roles([RoleName.ProjectManager, RoleName.Admin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  async getAverageTaskCompletionRate(
    @Query('period') period: string = 'monthly',
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('projectId') projectId?: string,
  ) {
    return await this.performanceService.getAverageTaskCompletionRate({ period, fromDate, toDate, projectId })
  }

  /**
   * Đo lường khả năng tuân thủ deadline trung bình của tất cả nhân viên
   * Quyền: Quản lý dự án hoặc Admin
   * Trả về: Tỷ lệ hoàn thành công việc đúng hạn trung bình
   */
  @Get('average-deadline-adherence')
  @Roles([RoleName.ProjectManager, RoleName.Admin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  async getAverageDeadlineAdherence(
    @Query('period') period: string = 'monthly',
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('projectId') projectId?: string,
  ) {
    return await this.performanceService.getAverageDeadlineAdherence({ period, fromDate, toDate, projectId })
  }

  /**
   * Kiểm tra tuân thủ giờ làm việc trung bình của tất cả nhân viên
   * Quyền: Quản lý dự án hoặc Admin
   * Trả về: Mức độ tuân thủ giờ làm việc trung bình
   */
  @Get('average-work-hours-compliance')
  @Roles([RoleName.ProjectManager, RoleName.Admin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  async getAverageWorkHoursCompliance(
    @Query('period') period: string = 'monthly',
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('projectId') projectId?: string,
  ) {
    return await this.performanceService.getAverageWorkHoursCompliance({ period, fromDate, toDate, projectId })
  }

  /**
   * Đo thời gian trung bình để hoàn thành nhiệm vụ của tất cả nhân viên
   * Quyền: Quản lý dự án hoặc Admin
   * Trả về: Thời gian trung bình để hoàn thành một nhiệm vụ
   */
  @Get('average-time-to-completion')
  @Roles([RoleName.ProjectManager, RoleName.Admin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  async getAverageTimeToCompletion(
    @Query('period') period: string = 'monthly',
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('projectId') projectId?: string,
  ) {
    return await this.performanceService.getAverageTimeToCompletion({ period, fromDate, toDate, projectId })
  }

  /**
   * Đo năng suất làm việc tổng của tất cả nhân viên
   * Quyền: Quản lý dự án hoặc Admin
   * Trả về: Tổng số lượng nhiệm vụ hoàn thành của tất cả nhân viên
   */
  @Get('total-throughput')
  @Roles([RoleName.ProjectManager, RoleName.Admin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  async getTotalThroughput(
    @Query('period') period: string = 'monthly',
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('projectId') projectId?: string,
  ) {
    return await this.performanceService.getTotalThroughput({ period, fromDate, toDate, projectId })
  }

  /**
   * Đo năng suất làm việc trung bình của tất cả nhân viên
   * Quyền: Quản lý dự án hoặc Admin
   * Trả về: Số lượng nhiệm vụ hoàn thành trung bình theo nhân viên
   */
  @Get('average-throughput')
  @Roles([RoleName.ProjectManager, RoleName.Admin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  async getAverageThroughput(
    @Query('period') period: string = 'monthly',
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('projectId') projectId?: string,
  ) {
    return await this.performanceService.getAverageThroughput({ period, fromDate, toDate, projectId })
  }

  /**
   * Đo lường khả năng giảm thiểu lỗi trung bình của tất cả nhân viên
   * Quyền: Quản lý dự án hoặc Admin
   * Trả về: Tỷ lệ giảm lỗi trung bình của tất cả nhân viên
   */
  @Get('average-error-reduction')
  @Roles([RoleName.ProjectManager, RoleName.Admin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  async getAverageErrorReduction(
    @Query('period') period: string = 'monthly',
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('projectId') projectId?: string,
  ) {
    return await this.performanceService.getAverageErrorReduction({ period, fromDate, toDate, projectId })
  }

  // API tính tổng và trung bình hiệu suất của tất cả projects

  /**
   * Lấy thống kê tổng hợp của tất cả dự án
   * Quyền: Admin
   * Trả về: Thống kê tổng quan về tất cả dự án
   */
  @Get('all-projects-stats')
  @Roles([RoleName.Admin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  async getAllProjectsStats(
    @Query('period') period: string = 'monthly',
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return await this.performanceService.getAllProjectsStats({ period, fromDate, toDate })
  }

  /**
   * Lấy tổng quan hiệu suất trung bình của tất cả dự án
   * Quyền: Admin
   * Trả về: Báo cáo tổng quan về tiến độ, hiệu suất trung bình của tất cả dự án
   */
  @Get('all-projects-overview')
  @Roles([RoleName.Admin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  async getAllProjectsOverview(
    @Query('period') period: string = 'monthly',
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return await this.performanceService.getAllProjectsOverview({ period, fromDate, toDate })
  }

  /**
   * Lấy KPI trung bình của tất cả dự án
   * Quyền: Admin
   * Trả về: Các chỉ số đo lường hiệu suất trung bình của tất cả dự án
   */
  @Get('all-projects-kpi')
  @Roles([RoleName.Admin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  async getAllProjectsKpi(
    @Query('period') period: string = 'monthly',
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return await this.performanceService.getAllProjectsKpi({ period, fromDate, toDate })
  }

  /**
   * Lấy phân tích hiệu suất tổng hợp tất cả dự án bằng AI
   * Quyền: Admin
   * Trả về: Báo cáo phân tích hiệu suất tổng hợp được tạo bởi AI
   */
  @Get('all-projects-ai-analysis')
  @Roles([RoleName.Admin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  async getAllProjectsAIAnalysis(
    @Query('period') period: string = 'monthly',
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return await this.performanceService.getAllProjectsAIAnalysis({ period, fromDate, toDate })
  }

  /**
   * Lấy báo cáo hiệu suất tổng hợp của toàn tổ chức
   * Quyền: Admin
   * Trả về: Báo cáo tổng hợp hiệu suất của tất cả nhân viên và dự án
   */
  @Get('organization-performance-summary')
  @Roles([RoleName.Admin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  async getOrganizationPerformanceSummary(
    @Query('period') period: string = 'monthly',
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return await this.performanceService.getOrganizationPerformanceSummary({ period, fromDate, toDate })
  }

  /**
   * Đánh giá hiệu suất tổ chức (alias cho evaluate)
   * Quyền: Nhân viên, Quản lý dự án hoặc Admin
   * Trả về: Đánh giá hiệu suất trung bình của tổ chức được tạo bởi AI
   */
  @Get('organization-evaluation')
  @Roles([RoleName.Employee, RoleName.ProjectManager, RoleName.Admin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  async getOrganizationEvaluation(@Query('projectId') projectId?: string) {
    return await this.performanceService.evaluateOrganizationPerformanceByAI({ projectId })
  }

  /**
   * Phân tích AI của các dự án (alias cho all-projects-ai-analysis)
   * Quyền: Admin
   * Trả về: Báo cáo phân tích hiệu suất tổng hợp được tạo bởi AI
   */
  @Get('projects-ai-analysis')
  @Roles([RoleName.Admin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  async getProjectsAIAnalysis(
    @Query('period') period: string = 'monthly',
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return await this.performanceService.getAllProjectsAIAnalysis({ period, fromDate, toDate })
  }

  /**
   * Lấy dữ liệu dashboard tổng hợp của tổ chức
   * Quyền: Admin
   * Trả về: Dữ liệu dashboard với biểu đồ và thống kê cho front-end
   */
  @Get('organization-dashboard-summary')
  @Roles([RoleName.Admin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  async getOrganizationDashboardSummary(
    @Query('period') period: string = 'monthly',
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return await this.performanceService.getOrganizationDashboardSummary({ period, fromDate, toDate })
  }

  /**
   * Lấy phân tích AI chi tiết cho dashboard cá nhân
   * Quyền: Nhân viên, Quản lý dự án hoặc Admin
   * Trả về: Phân tích AI với insights, khuyến nghị và điểm hiệu suất
   */
  @Get('individual-ai-analysis/:userId')
  @Roles([RoleName.Employee, RoleName.ProjectManager, RoleName.Admin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  async getIndividualAIAnalysis(
    @Param('userId') userId: string,
    @Query('period') period: string = 'monthly',
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return await this.performanceService.getIndividualAIAnalysis(userId, { period, fromDate, toDate })
  }

  /**
   * Lấy thống kê nhiệm vụ theo quý cho biểu đồ
   * Quyền: Quản lý dự án hoặc Admin
   * Trả về: Dữ liệu nhiệm vụ theo từng quý với trạng thái Completed, On-going, Not started
   */
  @Get('quarterly-tasks-chart')
  @Roles([RoleName.ProjectManager, RoleName.Admin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  async getQuarterlyTasksChart(@Query('projectId') projectId?: string, @Query('year') year?: string) {
    return await this.performanceService.getQuarterlyTasksChart({ projectId, year })
  }

  /**
   * Lấy tổng quan dashboard của người dùng
   * Quyền: Nhân viên, Quản lý dự án hoặc Admin
   * Trả về: 4 chỉ s ố chính: số task trong ngày, tỷ lệ hoàn thành, task quá hạn, giờ tập trung
   */
  @Get('dashboard-summary/:userId')
  @Roles([RoleName.Employee, RoleName.ProjectManager, RoleName.Admin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  async getUserDashboardSummary(
    @Param('userId') userId: string,
    @Query('date') date?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return await this.performanceService.getUserDashboardSummary(userId, { date, fromDate, toDate })
  }

  /**
   * Lấy dashboard hiệu suất cá nhân chi tiết
   * Quyền: Nhân viên, Quản lý dự án hoặc Admin
   * Trả về: Các biểu đồ hiệu suất cá nhân bao gồm:
   * - Stress Rate: Biểu đồ cột thể hiện mức độ căng thẳng theo loại task (khó, dễ, trung bình)
   * - Work Performance: Biểu đồ tròn phân tích tỷ lệ task theo trạng thái (hoàn thành, đang làm, đang review, khác)
   * - Stress Analysis Trend: Biểu đồ đường xu hướng chỉ số burnout và quality score theo thời gian
   * - AI Summary: Phân tích và tóm tắt hiệu suất bằng AI
   */
  @Get('individual-dashboard/:userId')
  @Roles([RoleName.Employee, RoleName.ProjectManager, RoleName.Admin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  async getIndividualPerformanceDashboard(
    @Param('userId') userId: string,
    @Query('period') period: string = 'monthly',
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return await this.performanceService.getIndividualPerformanceDashboard(userId, { period, fromDate, toDate })
  }
}
