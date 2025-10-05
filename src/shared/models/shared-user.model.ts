import z from 'zod';
import { SystemRoleSchema } from './shared-role.model';
import { UserStatus } from '../constants/auth.constant';

export const UserSchema = z.object({
    id: z.uuid(),
    name: z.string().min(1).max(100),
    email: z.email(),
    password: z.string().min(6).max(100),
    avatar_url: z.string().nullable().optional(),
    phone: z.string().min(10).max(15).nullable().optional(),
    address: z.string().min(1).max(500).nullable().optional(),
    bio: z.string().min(1).max(500).nullable().optional(),
    nickname: z.string().min(1).max(100).nullable().optional(),
    role_id: z.number().int().positive(),
    workspace_id: z.uuid().nullable().optional(),
    department_id: z.number().int().nullable().optional(),
    is_first_login: z.boolean().default(true),
    password_changed_at: z.date().nullable().optional(),
    created_at: z.date().default(() => new Date()),
    updated_at: z.date().nullable().default(() => new Date()),
    status: z.enum([UserStatus.active, UserStatus.inactive]).default(UserStatus.active),
});

export const UserWithRoleSchema = UserSchema.extend({
    role: SystemRoleSchema,
});

export type UserType = z.infer<typeof UserSchema>
export type UserWithRoleType = z.infer<typeof UserWithRoleSchema>;
