import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { SharedModule } from './shared/shared.module'
import { AuthModule } from './routes/auth/auth.module'
import { APP_FILTER, APP_PIPE } from '@nestjs/core'
import { CatchEverythingFilter } from './shared/filters/catch-everything.filter'
import { WorkspaceModule } from './routes/workspace/workspace.module'
import { ProjectModule } from './routes/project/project.module'
import { UserModule } from 'src/routes/user/user.module'
import CustomZodValidationPipe from './shared/pipes/custom-zod-validation.pipe'
import { FeatureModule } from './routes/feature/feature.module'
import { PackageModule } from './routes/package/package.module'

@Module({
  imports: [SharedModule, AuthModule, WorkspaceModule, ProjectModule, UserModule, FeatureModule, PackageModule],
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
    }
  ],
})
export class AppModule { }
