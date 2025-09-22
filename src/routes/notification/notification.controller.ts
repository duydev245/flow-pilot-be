import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { AuthRoleGuard } from 'src/shared/guards/auth-role.guard';
import { GetUserId } from 'src/shared/decorators/active-user.decorator';
import { RoleName } from 'src/shared/constants/role.constant';
import { SharedNotificationService } from 'src/shared/services/shared-notification.service';
import { NotificationCreateDto, NotificationUpdateDto } from './notification.dto';
import { ApiBearerAuth, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ZodSerializerDto } from 'nestjs-zod';
import { MessageResDTO } from 'src/shared/dtos/response.dto';

@Controller('notification')
@ApiTags('Notification')
@ApiSecurity('apiKey')
@ApiBearerAuth('access-token')
@UseGuards(AuthRoleGuard)
@ZodSerializerDto(MessageResDTO)
export class NotificationController {
  constructor(private readonly sharedNotificationService: SharedNotificationService) { }

  // Get all notifications (Super Admin only)
  @Get()
  @Roles([RoleName.SuperAdmin])
  findAll() {
    return this.sharedNotificationService.findAll();
  }

  // Create a new notification (Super Admin only)
  @Post()
  @Roles([RoleName.SuperAdmin])
  create(
    @Body() data: NotificationCreateDto
  ) {
    return this.sharedNotificationService.create(data);
  }

  // Get all notifications for the current user
  @Get('me')
  @Roles([RoleName.Employee, RoleName.Admin, RoleName.ProjectManager, RoleName.SuperAdmin])
  findAllForCurrentUser(@GetUserId() userId: string) {
    return this.sharedNotificationService.findAllByUserId(userId);
  }

  // Get a specific notification by ID (accessible to users with roles)
  @Get('/detail/:id')
  @Roles([RoleName.Employee, RoleName.Admin, RoleName.ProjectManager, RoleName.SuperAdmin])
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.sharedNotificationService.findById(id);
  }

  // Mark all notifications as read for the current user
  @Put('mark-all-as-read')
  @Roles([RoleName.Employee, RoleName.Admin, RoleName.ProjectManager, RoleName.SuperAdmin])
  markAllAsRead(@GetUserId() userId: string) {
    return this.sharedNotificationService.markAllAsReadByUserId(userId);
  }

  // Mark a specific notification as read for the current user
  @Put('mark-as-read/:id')
  @Roles([RoleName.Employee, RoleName.Admin, RoleName.ProjectManager, RoleName.SuperAdmin])
  markAsRead(@GetUserId() userId: string, @Param('id', ParseIntPipe) id: number) {
    return this.sharedNotificationService.markAsReadByUserIdAndId(userId, id);
  }

  // Delete a notification by ID 
  @Delete(':id')
  @Roles([RoleName.Employee, RoleName.Admin, RoleName.ProjectManager, RoleName.SuperAdmin])
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.sharedNotificationService.delete(id);
  }

  // Update a notification (Super Admin only)
  @Put(':id')
  @Roles([RoleName.SuperAdmin])
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: NotificationUpdateDto
  ) {
    return this.sharedNotificationService.update(id, data);
  }
}
