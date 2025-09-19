import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import envConfig from 'src/shared/config'
import { InvalidAPIKeyException } from '../error';

@Injectable()
export class APIKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const xAPIKey = request.headers['x-api-key'] || request.headers['X-API-KEY'];
    if (xAPIKey !== envConfig.SECRET_API_KEY) {
      throw InvalidAPIKeyException;
    }
    return true
  }
}
