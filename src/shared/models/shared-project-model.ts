import { ProjectStatus } from 'src/shared/constants/project.constant'
import z from 'zod'

export const ProjectSchema = z.object({
  id: z.uuid(),
  workspace_id: z.uuid(),
  name: z.string().min(2).max(100),
  description: z.string().max(255).optional(),
  start_date: z.string(),
  end_date: z.string(),
  process: z.number().min(0).max(100).default(0),
  team_size: z.number().int().positive().optional(),
  manager_id: z.uuid(),
  status: z.enum([ProjectStatus.active, ProjectStatus.inactive, ProjectStatus.not_started, ProjectStatus.completed]),
  created_at: z.date().default(() => new Date()),
  updated_at: z.date().nullable(),
})

export const CreateProjectSchema = ProjectSchema.pick({
  workspace_id: true,
  name: true,
  description: true,
  start_date: true,
  end_date: true,
  team_size: true,
  manager_id: true,
  status: true,
})
export const UpdateProjectSchema = ProjectSchema.pick({
  name: true,
  description: true,
  start_date: true,
  end_date: true,
  process: true,
  team_size: true,
  manager_id: true,
  status: true,
}).partial()
export const ProjectIdSchema = ProjectSchema.pick({
  workspace_id: true,
})
export type CreateProjectType = z.infer<typeof CreateProjectSchema>
export type UpdateProjectType = z.infer<typeof UpdateProjectSchema>
