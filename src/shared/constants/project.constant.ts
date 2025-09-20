export const ProjectStatus = {
  not_started: 'not_started',
  active: 'active',
  completed: 'completed',
  inactive: 'inactive',
} as const

export type ProjectStatusType = (typeof ProjectStatus)[keyof typeof ProjectStatus]
