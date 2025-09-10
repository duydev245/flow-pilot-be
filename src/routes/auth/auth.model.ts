import { TypeOfVerificationCode } from "src/shared/constants/auth.constant";
import { UserSchema } from "src/shared/models/shared-user.model";
import z from "zod";

// export const RegisterBodySchema = UserSchema.pick({
//     email: true,
//     password: true,
//     name: true,
// }).extend({
//     confirmPassword: z.string().min(6).max(100)
// }).strict().superRefine(({ confirmPassword, password }, ctx) => {
//     if (confirmPassword !== password) {
//         ctx.addIssue({
//             code: 'custom',
//             message: 'Password and confirm password must match',
//             path: ['confirmPassword'],
//         })
//     }
// })

// export type RegisterBodyType = z.infer<typeof RegisterBodySchema>

export const ForgotPasswordBodySchema = z
    .object({
        email: z.email(),
        code: z.string().length(6),
        newPassword: z.string().min(6).max(100).regex(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/, "Password must contain at least one uppercase letter, one number, and one special character"),
        confirmNewPassword: z.string().min(6).max(100)
    })
    .strict()
    .superRefine(({ confirmNewPassword, newPassword }, ctx) => {
        if (confirmNewPassword !== newPassword) {
            ctx.addIssue({
                code: 'custom',
                message: 'Passwords do not match',
                path: ['confirmNewPassword'],
            })
        }
    })

export const VerificationCodeSchema = z.object({
    id: z.number().int(),
    email: z.email().max(500),
    code: z.string().length(6),
    type: z.enum([
        TypeOfVerificationCode.register,
        TypeOfVerificationCode.forgot_password
    ]),
    expired_at: z.date(),
    created_at: z.date(),
})

export const SendOTPBodySchema = VerificationCodeSchema.pick({
    email: true,
    type: true,
}).strict()

export const VerifyOTPBodySchema = VerificationCodeSchema.pick({
    email: true,
    code: true,
    type: true
}).strict()

export const LoginBodySchema = UserSchema.pick({
    email: true,
    password: true,
}).strict()

export const LoginResSchema = z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    role: z.string(),
}).strict()

export const RefreshTokenBodySchema = z.object({
    refreshToken: z.string(),
}).strict()

export const RefreshTokenSchema = z.object({
    id: z.number(),
    token: z.string(),
    device_info: z.string().nullable(),
    ip_address: z.string().nullable(),
    user_id: z.uuid(),
    expired_at: z.date().nullable(),
    created_at: z.date().default(() => new Date()),
    updated_at: z.date().nullable().default(() => new Date())
});

export const LogoutBodySchema = RefreshTokenBodySchema

export const RefreshTokenResSchema = LoginResSchema

export type ForgotPasswordBodyType = z.infer<typeof ForgotPasswordBodySchema>
export type SendOTPBodyType = z.infer<typeof SendOTPBodySchema>
export type VerifyOTPBodyType = z.infer<typeof VerifyOTPBodySchema>
export type VerificationCodeType = z.infer<typeof VerificationCodeSchema>
export type LoginBodyType = z.infer<typeof LoginBodySchema>
export type LoginResType = z.infer<typeof LoginResSchema>
export type RefreshTokenBodyType = z.infer<typeof RefreshTokenBodySchema>
export type RefreshTokenResType = LoginResType
export type RefreshTokenType = z.infer<typeof RefreshTokenSchema>
export type LogoutBodyType = RefreshTokenBodyType
