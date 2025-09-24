import { Body, Controller, Get, Param, Post, Put, UseGuards, Delete } from '@nestjs/common'
import { ApiBearerAuth, ApiSecurity, ApiTags } from '@nestjs/swagger'
import { ZodSerializerDto } from 'nestjs-zod'
import { RoleName } from 'src/shared/constants/role.constant'
import { Roles } from 'src/shared/decorators/roles.decorator'
import { MessageResDTO } from 'src/shared/dtos/response.dto'
import { AuthRoleGuard } from 'src/shared/guards/auth-role.guard'
import {
  CreateTaskRejectBodyDto,
  CreateTaskReviewDto,
  TaskBodyDto,
  TaskChecklistBodyDto,
  TaskChecklistUpdateDto,
  TaskContentBodyDto,
  TaskContentUpdateDto,
  TaskUpdateDto,
  UpdateTaskReviewDto,
} from './task.dto'
import { TaskService } from './task.service'

@Controller('task')
@ApiTags('Task Module')
@ApiSecurity('apiKey')
@ApiBearerAuth('access-token  ')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  @Roles([RoleName.ProjectManager, RoleName.Employee, RoleName.Admin, RoleName.SuperAdmin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  getTasks() {
    return this.taskService.getAllTasks()
  }

  @Get('get-all-task-reviews')
  @Roles([RoleName.ProjectManager, RoleName.Admin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  getAllTaskReviews() {
    return this.taskService.getAllTaskReviews()
  }

  @Get(':id')
  @Roles([RoleName.ProjectManager, RoleName.Employee, RoleName.Admin, RoleName.SuperAdmin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  getTaskById(@Param('id') id: string) {
    return this.taskService.getTaskById(id)
  }

  @Post('create')
  @Roles([RoleName.ProjectManager, RoleName.Employee, RoleName.Admin, RoleName.SuperAdmin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  createTask(@Body() body: TaskBodyDto) {
    return this.taskService.createTask(body)
  }

  @Post('content/create')
  @Roles([RoleName.ProjectManager, RoleName.Employee, RoleName.Admin, RoleName.SuperAdmin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  createTaskContent(@Body() body: TaskContentBodyDto) {
    return this.taskService.createTaskContent(body)
  }

  @Post('checklist/create')
  @Roles([RoleName.ProjectManager, RoleName.Employee, RoleName.Admin, RoleName.SuperAdmin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  createTaskChecklist(@Body() body: TaskChecklistBodyDto) {
    return this.taskService.createTaskChecklist(body)
  }

  @Post('create-review')
  @Roles([RoleName.ProjectManager, RoleName.Admin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  createTaskReview(@Body() body: CreateTaskReviewDto) {
    return this.taskService.createTaskReviewAndCaculatePerformance(body)
  }

  @Post('reject-task')
  @Roles([RoleName.ProjectManager, RoleName.Admin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  rejectTask(@Body() body: CreateTaskRejectBodyDto) {
    return this.taskService.rejectTaskAndCaculatePerformance(body)
  }

  @Put('update/:id')
  @Roles([RoleName.ProjectManager, RoleName.Employee, RoleName.Admin, RoleName.SuperAdmin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  updateTask(@Param('id') id: string, @Body() body: TaskUpdateDto) {
    return this.taskService.updateTask(id, body)
  }

  @Put('content/update/:id')
  @Roles([RoleName.ProjectManager, RoleName.Employee, RoleName.Admin, RoleName.SuperAdmin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  updateTaskContent(@Param('id') id: string, @Body() body: TaskContentUpdateDto) {
    return this.taskService.updateTaskContent(id, body)
  }

  @Put('checklist/update/:id')
  @Roles([RoleName.ProjectManager, RoleName.Employee, RoleName.Admin, RoleName.SuperAdmin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  updateTaskChecklist(@Param('id') id: string, @Body() body: TaskChecklistUpdateDto) {
    return this.taskService.updateTaskChecklist(id, body)
  }

  @Delete(':id')
  @Roles([RoleName.ProjectManager, RoleName.Employee, RoleName.Admin, RoleName.SuperAdmin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  deleteTask(@Param('id') id: string) {
    return this.taskService.deleteTask(id)
  }

  @Delete('checklist/:id')
  @Roles([RoleName.ProjectManager, RoleName.Employee, RoleName.Admin, RoleName.SuperAdmin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  deleteTaskChecklist(@Param('id') id: string) {
    return this.taskService.deleteTaskChecklist(id)
  }

  @Delete('content/:id')
  @Roles([RoleName.ProjectManager, RoleName.Employee, RoleName.Admin, RoleName.SuperAdmin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  deleteTaskContent(@Param('id') id: string) {
    return this.taskService.deleteTaskContent(id)
  }

  @Put('update-review/:id')
  @Roles([RoleName.ProjectManager, RoleName.Admin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  updateTaskReview(@Param('id') id: string, @Body() body: UpdateTaskReviewDto) {
    return this.taskService.updateTaskReviewAndCaculatePerformance(id, body)
  }
}
