export const FeatureStatus = {
  active: 'active',
  inactive: 'inactive',
} as const

export const PackageStatus = {
  active: 'active',
  inactive: 'inactive',
} as const

export const WorkspaceStatus = {
  active: 'active',
  inactive: 'inactive',
} as const

export const DepartmentStatus = {
  active: 'active',
  inactive: 'inactive',
} as const

export type WorkspaceStatusType = (typeof WorkspaceStatus)[keyof typeof WorkspaceStatus]
export type PackageStatusType = (typeof PackageStatus)[keyof typeof PackageStatus]
export type UserStatusType = (typeof FeatureStatus)[keyof typeof FeatureStatus]
export type DepartmentStatusType = (typeof DepartmentStatus)[keyof typeof DepartmentStatus]
