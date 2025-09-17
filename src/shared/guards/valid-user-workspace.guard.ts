import { BadRequestException, CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { RoleName } from 'src/shared/constants/role.constant'
import { UserWithRoleType } from '../models/shared-user.model'
import { ForbiddenResourceException, UserNotFoundException } from '../error'
import { SharedUserRepository } from '../repositories/shared-user.repo'
import { validate as isUuid } from 'uuid'

@Injectable()
export class ValidUserWorkspaceGuard implements CanActivate {
  constructor(
    private readonly sharedUserRepository: SharedUserRepository,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()

    // get actor user from request
    const actor: UserWithRoleType = request.user
    if (!actor) {
      throw UserNotFoundException;
    }

    // check actor role
    const roleName = actor.role?.role;
    if (!roleName) throw ForbiddenResourceException;

    // if super admin, allow all
    if (roleName === RoleName.SuperAdmin) return true;

    // if admin, check workspace and target user
    if (roleName !== RoleName.Admin) throw ForbiddenResourceException;

    const workspaceId = actor.workspace_id;
    if (!workspaceId) throw ForbiddenResourceException;

    // get target user id from params
    const targetUserId: string = request.params.id;
    if (!targetUserId || !isUuid(targetUserId)) {
      throw new BadRequestException({ code: 'USER_ID_REQUIRED', message: 'User ID is required in params' });
    }

    const targetInWorkspace = await this.sharedUserRepository.findUniqueByWorkspace({
      id: targetUserId,
      workspace_id: workspaceId,
    });

    if (!targetInWorkspace) throw ForbiddenResourceException;

    return true;
  }
}
