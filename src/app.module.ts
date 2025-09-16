import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { SharedModule } from './shared/shared.module'
import { AuthModule } from './routes/auth/auth.module'
import { APP_FILTER, APP_GUARD } from '@nestjs/core'
import { APIKeyGuard } from './shared/guards/api-key.guard'
import { CatchEverythingFilter } from './shared/filters/catch-everything.filter'
import { WorkspaceModule } from './routes/workspace/workspace.module'
import { ProjectModule } from './routes/project/project.module'
import { UserModule } from 'src/routes/user/user.module'
import { FeatureModule } from './routes/feature/feature.module';
import { PackageModule } from './routes/package/package.module';

@Module({
  imports: [SharedModule, AuthModule, WorkspaceModule, ProjectModule, UserModule, FeatureModule, PackageModule],
  controllers: [AppController],
  providers: [
    AppService,
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
