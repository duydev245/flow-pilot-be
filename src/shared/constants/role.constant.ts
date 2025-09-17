export const RoleName = {
  SuperAdmin: 'SUPERADMIN',
  Admin: 'ADMIN',
  ProjectManager: 'PROJECTMANAGER',
  Employee: 'EMPLOYEE',
} as const

export type RoleNameType = (typeof RoleName)[keyof typeof RoleName]

export const HTTPMethod = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
  OPTIONS: 'OPTIONS',
  HEAD: 'HEAD',
} as const
