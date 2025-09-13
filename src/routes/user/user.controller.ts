import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ZodSerializerDto } from 'nestjs-zod'
import { UserBodyDto, UserDeleteDto, UserUpdateDto } from 'src/routes/user/user.dto'
import { RoleName } from 'src/shared/constants/role.constant'
import { AccessUser, GetRoleUser, GetWorkSpaceId } from 'src/shared/decorators/active-user.decorator'
import { Roles } from 'src/shared/decorators/roles.decorator'
import { MessageResDTO } from 'src/shared/dtos/response.dto'
import { AuthRoleGuard } from 'src/shared/guards/auth-role.guard'
import type { UserWithRoleType } from 'src/shared/models/shared-user.model'
import { UserService } from './user.service'

@Controller('user')
@ApiTags('User Module')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Admin và super admin sẽ đc xem hết
  @Get()
  @Roles([RoleName.SuperAdmin, RoleName.Admin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  getAllUsers(@GetRoleUser() role: string, @GetWorkSpaceId() workspaceId: string) {
    return this.userService.getAllUsers(role, workspaceId)
  }
  // hết 4 role
  @Get('/me')
  @Roles([RoleName.SuperAdmin, RoleName.Admin, RoleName.ProjectManager, RoleName.Employee])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  getMe(@AccessUser() userInfo: UserWithRoleType) {
    return this.userService.getMe(userInfo)
  }

  // Admin và super admin và manager sẽ đc xem hết
  @Get(':id')
  @Roles([RoleName.SuperAdmin, RoleName.Admin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  getUserById(@Param('id') userId: string) {
    return this.userService.getUserById(userId)
  }

  // Admin và super admin (admin chỉ đc tạo và manager và employee)
  @Post('create')
  @Roles([RoleName.SuperAdmin, RoleName.Admin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  createUser(@Body() body: UserBodyDto, @GetRoleUser() role: string, @GetWorkSpaceId() workspaceId: string) {
    return this.userService.createUser(body, role, workspaceId)
  }

  // Admin và super admin

  @Put(':id')
  @Roles([RoleName.SuperAdmin, RoleName.Admin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  updateUser(
    @Body() body: UserUpdateDto,
    @Param('id') userId: string,
    @GetRoleUser() role: string,
    @GetWorkSpaceId() workspaceId: string,
  ) {
    return this.userService.updateUser(userId, body, role, workspaceId)
  }

  // Admin và super admin
  @Put('/delete/:id')
  @Roles([RoleName.SuperAdmin, RoleName.Admin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  deleteUser(
    @Body() body: UserDeleteDto,
    @Param('id') userId: string,
    @GetRoleUser() role: string,
    @GetWorkSpaceId() workspaceId: string,
  ) {
    return this.userService.deleteUser(userId, body, role, workspaceId)
  }
}
