import { Controller, Post, Body, UseGuards, Put, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ChangePasswordBodyDTO, ForgotPasswordBodyDTO, LoginBodyDTO, LoginResDTO, LogoutBodyDTO, RefreshTokenBodyDTO, RefreshTokenResDTO, SendOTPBodyDTO } from './auth.dto';
import { ZodSerializerDto } from 'nestjs-zod';
import { MessageResDTO } from 'src/shared/dtos/response.dto';
import { RefreshTokenGuard } from 'src/shared/guards/refresh-token.guard';
import { RefreshTokenStr } from 'src/shared/decorators/refresh-token.decorator';
import { ApiTags } from '@nestjs/swagger';
import { AuthRoleGuard } from 'src/shared/guards/auth-role.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { RoleName } from 'src/shared/constants/role.constant';
import { APIKeyGuard } from 'src/shared/guards/api-key.guard';

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

  @Post('send-otp')
  @ZodSerializerDto(MessageResDTO)
  sendOTP(@Body() body: SendOTPBodyDTO) {
    return this.authService.sendOTP(body)
  }

  // @Post('verify-otp')
  // @ZodSerializerDto(MessageResDTO)
  // verifyOTP(@Body() body: VerifyOTPBodyDTO) {
  //   return this.authService.verifyOTP(body)
  // }

  @Post('refresh-token')
  @UseGuards(RefreshTokenGuard)
  @ZodSerializerDto(RefreshTokenResDTO)
  refreshToken(@Body() _body: RefreshTokenBodyDTO, @RefreshTokenStr() refreshToken: string) {
    return this.authService.refreshToken(refreshToken)
  }

  @Post('forgot-password')
  @ZodSerializerDto(MessageResDTO)
  forgotPassword(@Body() body: ForgotPasswordBodyDTO) {
    return this.authService.forgotPassword(body);
  }

  @Put('change-password')
  @Roles([RoleName.SuperAdmin, RoleName.Admin, RoleName.ProjectManager, RoleName.Employee])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  changePassword(@Body() body: ChangePasswordBodyDTO) {
    return this.authService.changePassword(body);
  }

  @Get('test-access-token')
  @Roles([RoleName.Employee])
  @UseGuards(AuthRoleGuard)
  testAccessToken() {
    return { message: 'Access token is valid!' }
  }

}
