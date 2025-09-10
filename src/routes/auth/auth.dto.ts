import { createZodDto } from "nestjs-zod";
import { LoginBodySchema, LoginResSchema, LogoutBodySchema, RefreshTokenBodySchema, RefreshTokenResSchema, SendOTPBodySchema } from "./auth.model";

export class SendOTPBodyDTO extends createZodDto(SendOTPBodySchema) {}

export class LoginBodyDTO extends createZodDto(LoginBodySchema) { }

export class LoginResDTO extends createZodDto(LoginResSchema) { }

export class RefreshTokenBodyDTO extends createZodDto(RefreshTokenBodySchema){}

export class RefreshTokenResDTO extends createZodDto(RefreshTokenResSchema){}

export class LogoutBodyDTO extends createZodDto(LogoutBodySchema) {}
