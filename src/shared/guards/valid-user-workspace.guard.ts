import { BadRequestException, CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { UserRepository } from 'src/routes/user/user.repo'
import { RoleName } from 'src/shared/constants/role.constant'
import { UserWithRoleType } from '../models/shared-user.model'
import { ForbiddenResourceException, UserNotFoundException } from '../error'

@Injectable()
export class ValidUserWorkspaceGuard implements CanActivate {
  constructor(
    private readonly userRepository: UserRepository,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()

    const actor: UserWithRoleType = request.user
    if (!actor) {
      throw UserNotFoundException;
    }

    const actorRole = actor.role.role
    if (!actorRole) {
      throw ForbiddenResourceException;
    }

    if (actorRole === RoleName.SuperAdmin) {
      return true
    }

    if (actorRole !== RoleName.Admin) {
      throw ForbiddenResourceException;
    }

    const actorWorkspaceId = actor.workspace_id;
    if (!actorWorkspaceId) {
      throw ForbiddenResourceException;
    }

    const targetUserId: string = request.params.id;
    if (!targetUserId) {
      throw new BadRequestException({ code: 'USER_ID_REQUIRED', message: 'User ID is required in params' });
    }

    const ok = await this.userRepository.checkUserInWorkspace(targetUserId, actorWorkspaceId);
    if (!ok) {
      throw ForbiddenResourceException;
    }

    return true;
  }
}
