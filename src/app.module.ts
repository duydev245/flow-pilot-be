import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { SharedModule } from './shared/shared.module'
import { AuthModule } from './routes/auth/auth.module'
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core'
import { APIKeyGuard } from './shared/guards/api-key.guard'
import { CatchEverythingFilter } from './shared/filters/catch-everything.filter'
import { ProjectModule } from './routes/project/project.module'
import { UserModule } from 'src/routes/user/user.module'
import CustomZodValidationPipe from './shared/pipes/custom-zod-validation.pipe'
import { FeatureModule } from './routes/feature/feature.module'
import { PackageModule } from './routes/package/package.module'
import { WorkspaceModule } from 'src/routes/workspace/workspace.module'

@Module({
  imports: [SharedModule, AuthModule, ProjectModule, UserModule, FeatureModule, PackageModule, WorkspaceModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: CustomZodValidationPipe,
    },
    {
      provide: APP_FILTER,
      useClass: CatchEverythingFilter,
    },
    {
      provide: APP_GUARD,
      useClass: APIKeyGuard,
    },
  ],
})
export class AppModule {}
