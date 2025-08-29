import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginBodyDTO } from './auth.dto';
import { AccessToken } from 'src/shared/decorators/access-token.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  login(@Body() body: LoginBodyDTO) {
    return this.authService.login(body);
  }

  @Post('logout')
  logout(@AccessToken() accessToken: string) {
    return this.authService.logout(accessToken);
  }

}
