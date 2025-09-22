import { z } from 'zod';

export const DailyFocusLogSchema = z.object({
  id: z.number().int().positive(),
  user_id: z.uuid(),
  focused_minutes: z.number().int().nonnegative(),
  note: z.string().optional().nullable(),
  created_at: z.date(),
  updated_at: z.date().optional().nullable(),
});

export const DailyFocusLogCreateSchema = DailyFocusLogSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const DailyFocusLogUpdateSchema = DailyFocusLogCreateSchema.partial();

export type DailyFocusLogType = z.infer<typeof DailyFocusLogSchema>;
export type DailyFocusLogCreateType = z.infer<typeof DailyFocusLogCreateSchema>;
export type DailyFocusLogUpdateType = z.infer<typeof DailyFocusLogUpdateSchema>;
