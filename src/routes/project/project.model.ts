import { ProjectSchema } from "src/shared/models/shared-project-model"
import z from "zod"

export const CreateProjectSchemaByAdmin = ProjectSchema.pick({
  workspace_id: true,
  name: true,
  description: true,
  start_date: true,
  end_date: true,
  team_size: true,
  manager_id: true,
  status: true,
})
export const CreateProjectSchema = ProjectSchema.pick({
  name: true,
  description: true,
  start_date: true,
  end_date: true,
  process: true,
  team_size: true,
  manager_id: true,
  status: true,
})
export const UpdateProjectByAdminSchema = ProjectSchema.pick({
  workspace_id: true,
  name: true,
  description: true,
  start_date: true,
  end_date: true,
  process: true,
  team_size: true,
  manager_id: true,
  status: true,
}).partial()
export const UpdateProjectByUserSchema = ProjectSchema.pick({
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
export type CreateProjectByAdminType = z.infer<typeof CreateProjectSchemaByAdmin>
export type UpdateProjectByAdminType = z.infer<typeof UpdateProjectByAdminSchema>
export type UpdateProjectByUserType = z.infer<typeof UpdateProjectByUserSchema>

// DTO cho assign nhiều user vào project
export const AssignUsersToProjectSchema = z.object({
  users: z.array(
    z.object({
      user_id: z.string(),
      role: z.string().optional(),
    })
  ),
});
export type AssignUsersToProjectDto = z.infer<typeof AssignUsersToProjectSchema>;