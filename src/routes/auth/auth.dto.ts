import { createZodDto } from "nestjs-zod";
import { ForgotPasswordBodySchema, LoginBodySchema, LoginResSchema, LogoutBodySchema, RefreshTokenBodySchema, RefreshTokenResSchema, SendOTPBodySchema, VerifyOTPBodySchema } from "./auth.model";

export class SendOTPBodyDTO extends createZodDto(SendOTPBodySchema) {}

export class VerifyOTPBodyDTO extends createZodDto(VerifyOTPBodySchema) {}

export class LoginBodyDTO extends createZodDto(LoginBodySchema) { }

export class LoginResDTO extends createZodDto(LoginResSchema) { }

export class RefreshTokenBodyDTO extends createZodDto(RefreshTokenBodySchema){}

export class RefreshTokenResDTO extends createZodDto(RefreshTokenResSchema){}

export class LogoutBodyDTO extends createZodDto(LogoutBodySchema) {}

export class ForgotPasswordBodyDTO extends createZodDto(ForgotPasswordBodySchema) {}
