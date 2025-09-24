import { z } from 'zod';
import { NotificationEnum } from '../constants/notification.constant';

export const NotificationSchema = z.object({
  id: z.number().int().positive(),
  user_id: z.uuid(),
  title: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  is_read: z.boolean().default(false),
  created_at: z.date().default(() => new Date()),
  updated_at: z.date().nullable().default(() => new Date()),
  type: z.enum([NotificationEnum.info, NotificationEnum.warning, NotificationEnum.alert, NotificationEnum.task, NotificationEnum.project, NotificationEnum.system]),
  data: z.any().optional().nullable(),
});

export const NotificationCreateSchema = NotificationSchema.pick({
  user_id: true,
  title: true,
  content: true,
  type: true,
  data: true,
}).strict();

export const NotificationUpdateSchema = z.object({
  title: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  type: z.enum([NotificationEnum.info, NotificationEnum.warning, NotificationEnum.alert, NotificationEnum.task, NotificationEnum.project, NotificationEnum.system]).optional(),
  data: z.any().optional().nullable(),
  is_read: z.boolean().optional(),
})
  .refine(obj => Object.keys(obj).length > 0, { message: 'Nothing to update' })
  .strict()

export type NotificationType = z.infer<typeof NotificationSchema>;
export type NotificationCreateType = z.infer<typeof NotificationCreateSchema>;
export type NotificationUpdateType = z.infer<typeof NotificationUpdateSchema>;
