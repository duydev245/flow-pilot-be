import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ZodSerializerDto } from 'nestjs-zod'
import { UserCreateBodyDto, UserCreateByAdminBodyDto, UserDeleteBodyDto, UserUpdateBodyDto, UserUpdateByAdminBodyDto, UserUpdateProfileBodyDto } from 'src/routes/user/user.dto'
import { RoleName } from 'src/shared/constants/role.constant'
import { GetRoleUser, GetUserId, GetWorkSpaceId } from 'src/shared/decorators/active-user.decorator'
import { Roles } from 'src/shared/decorators/roles.decorator'
import { MessageResDTO } from 'src/shared/dtos/response.dto'
import { AuthRoleGuard } from 'src/shared/guards/auth-role.guard'
import { ValidUserWorkspaceGuard } from 'src/shared/guards/valid-user-workspace.guard'
import { UserService } from './user.service'

@Controller('user')
@ApiTags('User Module')
export class UserController {
  constructor(private readonly userService: UserService) { }

  // my profile
  @Get('/me')
  @Roles([RoleName.SuperAdmin, RoleName.Admin, RoleName.ProjectManager, RoleName.Employee])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  getMe(@GetUserId() userId: string) {
    return this.userService.getMe(userId)
  }

  @Put('/update-profile')
  @Roles([RoleName.SuperAdmin, RoleName.Admin, RoleName.ProjectManager, RoleName.Employee])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  updateProfile(
    @GetUserId() userId: string,
    @Body() body: UserUpdateProfileBodyDto,
  ) {
    return this.userService.updateProfile(userId, body)
  }

  // Super admin routes
  @Get('/super-admin')
  @Roles([RoleName.SuperAdmin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  getAllUsersBySuperAdmin(@GetUserId() actorId: string) {
    return this.userService.getAllUsersBySuperAdmin(actorId)
  }

  @Get('/super-admin/:id')
  @Roles([RoleName.SuperAdmin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  getUserByIdForSuperAdmin(@Param('id') userId: string) {
    return this.userService.getUserBySuperAdmin(userId)
  }

  @Post('/super-admin/create')
  @Roles([RoleName.SuperAdmin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  createUserBySuperAdmin(
    @Body() body: UserCreateBodyDto,
  ) {
    return this.userService.createUserBySuperAdmin(body)
  }

  @Put('/super-admin/delete/:id')
  @Roles([RoleName.SuperAdmin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  deleteUserBySuperAdmin(
    @Param('id') userId: string,
    @Body() body: UserDeleteBodyDto,
  ) {
    return this.userService.deleteUser(userId, body)
  }

  @Put('/super-admin/:id')
  @Roles([RoleName.SuperAdmin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  updateUserBySuperAdmin(
    @Param('id') userId: string,
    @Body() body: UserUpdateBodyDto,
  ) {
    return this.userService.updateUserBySuperAdmin(userId, body)
  }

  // Admin routes
  @Get('/admin')
  @Roles([RoleName.Admin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  getAllUsersByAdmin(@GetUserId() actorId: string, @GetWorkSpaceId() workspaceId: string) {
    return this.userService.getAllUsersByAdmin(actorId, workspaceId)
  }

  @Get('/admin/:id')
  @Roles([RoleName.Admin])
  @UseGuards(AuthRoleGuard, ValidUserWorkspaceGuard)
  @ZodSerializerDto(MessageResDTO)
  getUserById(@Param('id') userId: string, @GetWorkSpaceId() workspaceId: string) {
    return this.userService.getUserByAdmin(userId, workspaceId)
  }

  @Post('/admin/create')
  @Roles([RoleName.Admin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  createUserByAdmin(
    @Body() body: UserCreateByAdminBodyDto,
    @GetWorkSpaceId() workspaceId: string
  ) {
    return this.userService.createUserByAdmin(body, workspaceId)
  }

  @Put('/admin/delete/:id')
  @Roles([RoleName.Admin])
  @UseGuards(AuthRoleGuard, ValidUserWorkspaceGuard)
  @ZodSerializerDto(MessageResDTO)
  deleteUserByAdmin(
    @Param('id') userId: string,
    @Body() body: UserDeleteBodyDto,
  ) {
    return this.userService.deleteUser(userId, body)
  }

  @Put('/admin/:id')
  @Roles([RoleName.Admin])
  @UseGuards(AuthRoleGuard, ValidUserWorkspaceGuard)
  @ZodSerializerDto(MessageResDTO)
  updateUser(
    @Param('id') userId: string,
    @Body() body: UserUpdateByAdminBodyDto,
    @GetWorkSpaceId() workspaceId: string
  ) {
    return this.userService.updateUserByAdmin(userId, workspaceId, body)
  }

}
