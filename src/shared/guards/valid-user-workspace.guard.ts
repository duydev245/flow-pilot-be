import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { UserService } from 'src/routes/user/user.service'
import { RoleName } from 'src/shared/constants/role.constant'

@Injectable()
export class ValidUserWorkspaceGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const userId = request.params.id
    const role = request.user?.role?.role
    if (!role) return false

    if (role === RoleName.SuperAdmin) {
      return true
    }

    const user = await this.userService.getUserById(userId)
    const workspaceId = user?.data?.workspace_id
    if (!workspaceId) {
      return false
    }
    return await this.userService.checkUserInWorkspace(userId, workspaceId)
  }
}
