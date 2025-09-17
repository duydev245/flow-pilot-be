export const RoleName = {
  SuperAdmin: 'SUPERADMIN',
  Admin: 'ADMIN',
  ProjectManager: 'PROJECTMANAGER',
  Employee: 'EMPLOYEE',
} as const

export type RoleNameType = (typeof RoleName)[keyof typeof RoleName]

export const RoleNameId = {
  SuperAdmin: 1,
  Admin: 2,
  ProjectManager: 3,
  Employee: 4,
} as const

export type RoleNameIdType = (typeof RoleNameId)[keyof typeof RoleNameId]

export const HTTPMethod = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
  OPTIONS: 'OPTIONS',
  HEAD: 'HEAD',
} as const
