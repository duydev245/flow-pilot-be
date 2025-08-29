export interface AccessTokenPayloadCreate {
  userId: string
  roleId: number
  roleName: string
  key: number
}

export interface AccessTokenPayload extends AccessTokenPayloadCreate {
  exp: number
  iat: number
}

export interface RefreshTokenPayloadCreate {
  userId: string
  key: number
}

export interface RefreshTokenPayload extends RefreshTokenPayloadCreate {
  exp: number
  iat: number
}
