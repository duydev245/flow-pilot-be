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

export const LoginBodySchema = UserSchema.pick({
    email: true,
    password: true,
}).strict()

export const LoginResSchema = z.object({
    accessToken: z.string(),
    role: z.string(),
    wsid: z.string(),
}).strict()

export const RefreshTokenBodySchema = z.object({
    refreshToken: z.string(),
}).strict()

export const RefreshTokenResSchema = LoginResSchema

export type LoginBodyType = z.infer<typeof LoginBodySchema>
export type LoginResType = z.infer<typeof LoginResSchema>
export type RefreshTokenBodyType = z.infer<typeof RefreshTokenBodySchema>
export type RefreshTokenResType = LoginResType