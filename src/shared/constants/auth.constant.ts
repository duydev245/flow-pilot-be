export const REQUEST_USER_KEY = 'user'

export const AuthType = {
  Bearer: 'Bearer',
  None: 'None',
  APIKey: 'ApiKey',
} as const

export type AuthTypeType = (typeof AuthType)[keyof typeof AuthType]

export const ConditionGuard = {
  And: 'and',
  Or: 'or',
} as const

export type ConditionGuardType = (typeof ConditionGuard)[keyof typeof ConditionGuard]

export const UserStatus = {
  active: 'active',
  inactive: 'inactive',
} as const

export type UserStatusType = (typeof UserStatus)[keyof typeof UserStatus]

export const TypeOfVerificationCode = {
  register: 'register',
  forgot_password: 'forgot_password',
} as const

export type TypeOfVerificationCodeType = (typeof TypeOfVerificationCode)[keyof typeof TypeOfVerificationCode]