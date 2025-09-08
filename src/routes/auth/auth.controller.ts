import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginBodyDTO, LoginResDTO, LogoutBodyDTO, RefreshTokenBodyDTO, RefreshTokenResDTO } from './auth.dto';
import { ZodSerializerDto } from 'nestjs-zod';
import { MessageResDTO } from 'src/shared/dtos/response.dto';
import { RefreshTokenGuard } from 'src/shared/guards/refresh-token.guard';
import { RefreshTokenStr } from 'src/shared/decorators/refresh-token.decorator';
import { ApiTags } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('Auth Module')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  @ZodSerializerDto(LoginResDTO)
  login(@Body() body: LoginBodyDTO) {
    return this.authService.login(body);
  }

  @Post('logout')
  @UseGuards(RefreshTokenGuard)
  @ZodSerializerDto(MessageResDTO)
  logout(@Body() _body: LogoutBodyDTO, @RefreshTokenStr() refreshToken: string) {
    return this.authService.logout(refreshToken);
  }

  @Post('refresh-token')
  @UseGuards(RefreshTokenGuard)
  @ZodSerializerDto(RefreshTokenResDTO)
  refreshToken(@Body() _body: RefreshTokenBodyDTO, @RefreshTokenStr() refreshToken: string) {
    return this.authService.refreshToken(refreshToken)
  }

}
