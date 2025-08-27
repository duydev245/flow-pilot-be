import { UserSchema } from "src/shared/models/share-user.model";
import z from "zod";


export const RegisterBodySchema = UserSchema.pick({
    email: true,
    password: true,
    name: true,
}).extend({
    confirmPassword: z.string().min(6).max(100)
}).strict().superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
        ctx.addIssue({
            code: 'custom',
            message: 'Password and confirm password must match',
            path: ['confirmPassword'],
        })
    }
})


