import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import envConfig from '../config';
import { PaymentApiKeyRequiredException } from '../error';

@Injectable()
export class PaymentApiKeyGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest()
    const authHeader = request.headers['authorization'] || request.headers['Authorization'];

    if (!authHeader || !authHeader.startsWith('Apikey ')) {
      throw PaymentApiKeyRequiredException;
    }

    const paymentApiKey = authHeader.replace('Apikey ', '').trim();

    if (paymentApiKey !== envConfig.PAYMENT_API_KEY) {
      throw PaymentApiKeyRequiredException;
    }

    return true;
  }
}
