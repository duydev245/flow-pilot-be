import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  Delete,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { ZodSerializerDto } from 'nestjs-zod'
import { RoleName } from 'src/shared/constants/role.constant'
import { Roles } from 'src/shared/decorators/roles.decorator'
import { MessageResDTO } from 'src/shared/dtos/response.dto'
import { AuthRoleGuard } from 'src/shared/guards/auth-role.guard'
import {
  AssingUserToTaskDto,
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
import { FileInterceptor } from '@nestjs/platform-express'
import { GetUserId } from 'src/shared/decorators/active-user.decorator'

@Controller('task')
@ApiTags('Task Module')
@ApiBearerAuth('access-token')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  @Roles([RoleName.ProjectManager, RoleName.Admin, RoleName.SuperAdmin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  getTasks() {
    return this.taskService.getAllTasks()
  }
  @Get('my-tasks')
  @Roles([RoleName.ProjectManager, RoleName.Employee, RoleName.Admin, RoleName.SuperAdmin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  getMyTasks(@GetUserId() userId: string) {
    return this.taskService.getMyTasks(userId)
  }

  @Get('get-all-task-reviews')
  @Roles([RoleName.ProjectManager, RoleName.Admin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  getAllTaskReviews() {
    return this.taskService.getAllTaskReviews()
  }

  @Get('get-all-task-rejects')
  @Roles([RoleName.ProjectManager, RoleName.Admin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  getAllTaskRejects() {
    return this.taskService.getAllTaskRejects()
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
  @UseInterceptors(FileInterceptor('taskImage'))
  @ZodSerializerDto(MessageResDTO)
  createTask(@Body() body: TaskBodyDto, @UploadedFile() taskImage: Express.Multer.File) {
    return this.taskService.createTask(body, taskImage)
  }

  @Post('content/create')
  @Roles([RoleName.ProjectManager, RoleName.Employee, RoleName.Admin, RoleName.SuperAdmin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  createTaskContent(@Body() body: TaskContentBodyDto, @GetUserId() userId: string) {
    return this.taskService.createTaskContent(body, userId)
  }

  @Post('checklist/create')
  @Roles([RoleName.ProjectManager, RoleName.Employee, RoleName.Admin, RoleName.SuperAdmin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  createTaskChecklist(@Body() body: TaskChecklistBodyDto, @GetUserId() userId: string) {
    return this.taskService.createTaskChecklist(body, userId)
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
  @UseInterceptors(FileInterceptor('taskImage'))
  @ZodSerializerDto(MessageResDTO)
  updateTask(@Param('id') id: string, @Body() body: TaskUpdateDto, @UploadedFile() taskImage: Express.Multer.File) {
    return this.taskService.updateTask(id, body, taskImage)
  }

  @Put('content/update/:id')
  @Roles([RoleName.ProjectManager, RoleName.Employee, RoleName.Admin, RoleName.SuperAdmin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  updateTaskContent(@Param('id') id: string, @Body() body: TaskContentUpdateDto, @GetUserId() userId: string) {
    return this.taskService.updateTaskContent(id, body, userId)
  }

  @Put('checklist/update/:id')
  @Roles([RoleName.ProjectManager, RoleName.Employee, RoleName.Admin, RoleName.SuperAdmin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  updateTaskChecklist(@Param('id') id: string, @Body() body: TaskChecklistUpdateDto, @GetUserId() userId: string) {
    return this.taskService.updateTaskChecklist(id, body, userId)
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

  @Post('assign-task')
  @Roles([RoleName.ProjectManager, RoleName.Admin, RoleName.SuperAdmin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  assignTaskToUser(@Body() body: AssingUserToTaskDto) {
    return this.taskService.assignTaskToUser(body)
  }
}
