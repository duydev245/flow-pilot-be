export interface AccessTokenPayloadCreate {
  user_id: string
  role_id: number
  roleName: string
  key: number
}

export interface AccessTokenPayload extends AccessTokenPayloadCreate {
  exp: number
  iat: number
}

export interface RefreshTokenPayloadCreate {
  user_id: string
  key: number
}

export interface RefreshTokenPayload extends RefreshTokenPayloadCreate {
  exp: number
  iat: number
}
