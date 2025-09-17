export interface IAccessTokenPayloadCreate {
  user_id: string
  role_id: number
  roleName: string
}

export interface IAccessTokenPayload extends IAccessTokenPayloadCreate {
  exp: number
  iat: number
}

export interface IRefreshTokenPayloadCreate {
  user_id: string
}

export interface IRefreshTokenPayload extends IRefreshTokenPayloadCreate {
  exp: number
  iat: number
}
