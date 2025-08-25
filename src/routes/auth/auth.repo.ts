import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthRepository {
  register(registerDto: any) {
    return 'This action adds a new auth';
  }

}
