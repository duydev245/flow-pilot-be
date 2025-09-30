import { forwardRef, Global, Module } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import { HashingService } from './services/hashing.service'
import { TokenService } from './services/token.service'
import { JwtModule } from '@nestjs/jwt'
import { AccessTokenGuard } from 'src/shared/guards/access-token.guard'
import { APIKeyGuard } from 'src/shared/guards/api-key.guard'
import { APP_GUARD } from '@nestjs/core'
import { AuthenticationGuard } from 'src/shared/guards/authentication.guard'
import { EmailService } from './services/email.service'
import { SharedUserRepository } from './repositories/shared-user.repo'
import { SharedWorkspaceRepository } from './repositories/shared-workspace.repo'
import { SharedRoleRepository } from './repositories/shared-role.repo'
import { SharedNotificationService } from './services/shared-notification.service'
import { SharedNotificationRepository } from './repositories/shared-notification.repo'
import { S3StorageService } from './services/s3-storage.service'
import { SharedOrderRepository } from './repositories/shared-order.repo'

const sharedServices = [
  PrismaService,
  HashingService,
  TokenService,
  EmailService,
  SharedUserRepository,
  SharedWorkspaceRepository,
  SharedRoleRepository,
  SharedNotificationService,
  SharedNotificationRepository,
  S3StorageService,
  SharedOrderRepository
]

@Global()
@Module({
  imports: [JwtModule],
  providers: [
    ...sharedServices,
    AccessTokenGuard,
    APIKeyGuard,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
  ],
  exports: [...sharedServices],
})
export class SharedModule { }
