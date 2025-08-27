import z from 'zod';
import { UserStatus } from 'src/shared/constants/auth.constant';

export const UserSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1).max(100),
    email: z.string().email(),
    password: z.string().min(6).max(100),
    avatar_url: z.string().nullable().optional(),
    role_id: z.number().int().positive(),
    workspace_id: z.string().uuid().nullable().optional(),
    department_id: z.number().int().nullable().optional(),
    is_first_login: z.boolean().default(true),
    password_changed_at: z.date().nullable().optional(),
    created_at: z.date().default(() => new Date()),
    updated_at: z.date().default(() => new Date()),
    status: z.enum([UserStatus.ACTIVE, UserStatus.INACTIVE]),
});


export type UserType = z.infer<typeof UserSchema>