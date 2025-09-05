import { createZodDto } from "nestjs-zod";
import { LoginBodySchema, LoginResSchema, LogoutBodySchema } from "./auth.model";

export class LoginBodyDTO extends createZodDto(LoginBodySchema) { }

export class LoginResDTO extends createZodDto(LoginResSchema) { }

export class LogoutBodyDTO extends createZodDto(LogoutBodySchema) {}
