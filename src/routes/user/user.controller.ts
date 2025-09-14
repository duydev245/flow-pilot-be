import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ZodSerializerDto } from 'nestjs-zod'
import { UserCreateBodyDto, UserDeleteBodyDto, UserUpdateBodyDto } from 'src/routes/user/user.dto'
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

  @Get()
  @Roles([RoleName.SuperAdmin, RoleName.Admin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  getAllUsers(@GetRoleUser() role: string, @GetWorkSpaceId() workspaceId: string) {
    return this.userService.getAllUsers(role, workspaceId)
  }

  @Get('/me')
  @Roles([RoleName.SuperAdmin, RoleName.Admin, RoleName.ProjectManager, RoleName.Employee])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  getMe(@GetUserId() userId: string) {
    return this.userService.getMe(userId)
  }

  @Get(':id')
  @Roles([RoleName.SuperAdmin, RoleName.Admin])
  @UseGuards(AuthRoleGuard, ValidUserWorkspaceGuard)
  @ZodSerializerDto(MessageResDTO)
  getUserById(@Param('id') userId: string) {
    return this.userService.getUserById(userId)
  }

  @Post('create')
  @Roles([RoleName.SuperAdmin, RoleName.Admin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  createUser(
    @Body() body: UserCreateBodyDto,
    @GetRoleUser() role: string,
  ) {
    return this.userService.createUser(body, role)
  }

  @Put(':id')
  @Roles([RoleName.SuperAdmin, RoleName.Admin])
  @UseGuards(AuthRoleGuard, ValidUserWorkspaceGuard)
  @ZodSerializerDto(MessageResDTO)
  updateUser(
    @Body() body: UserUpdateBodyDto,
    @Param('id') userId: string,
    @GetRoleUser() role: string,
  ) {
    return this.userService.updateUser(userId, body, role)
  }

  @Put('/delete/:id')
  @Roles([RoleName.SuperAdmin, RoleName.Admin])
  @UseGuards(AuthRoleGuard, ValidUserWorkspaceGuard)
  @ZodSerializerDto(MessageResDTO)
  deleteUser(
    @Body() body: UserDeleteBodyDto,
    @Param('id') userId: string,
  ) {
    return this.userService.deleteUser(userId, body)
  }
}
