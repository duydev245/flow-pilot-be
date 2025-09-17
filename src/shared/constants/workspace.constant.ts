export const WorkspaceStatus = {
  active: 'active',
  inactive: 'inactive',
} as const

export type WorkspaceStatusType = (typeof WorkspaceStatus)[keyof typeof WorkspaceStatus]