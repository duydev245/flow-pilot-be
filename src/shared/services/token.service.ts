import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import envConfig from 'src/shared/config'

import { v4 as uuidv4 } from 'uuid'
import { IAccessTokenPayload, IAccessTokenPayloadCreate, IRefreshTokenPayload, IRefreshTokenPayloadCreate } from '../types/jwt.type'

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) { }

  signAccessToken(payload: IAccessTokenPayloadCreate) {
    return this.jwtService.sign({ ...payload, uuid: uuidv4() }, {
      secret: envConfig.ACCESS_TOKEN_SECRET,
      expiresIn: envConfig.ACCESS_TOKEN_EXPIRES_IN,
      algorithm: 'HS256',
    })
  }

  signRefreshToken(payload: IRefreshTokenPayloadCreate) {
    return this.jwtService.sign({ ...payload, uuid: uuidv4() }, {
      secret: envConfig.REFRESH_TOKEN_SECRET,
      expiresIn: envConfig.REFRESH_TOKEN_EXPIRES_IN,
      algorithm: 'HS256',
    })
  }

  verifyAccessToken(token: string): Promise<IAccessTokenPayload> {
    return this.jwtService.verifyAsync(token, {
      secret: envConfig.ACCESS_TOKEN_SECRET,
    })
  }

  verifyRefreshToken(token: string): Promise<IRefreshTokenPayload> {
    return this.jwtService.verifyAsync(token, {
      secret: envConfig.REFRESH_TOKEN_SECRET,
    })
  }

  decodeAccessToken(token: string): IAccessTokenPayload {
    return this.jwtService.decode(token)
  }

  decodeRefreshToken(token: string): IRefreshTokenPayload {
    return this.jwtService.decode(token)
  }
}
