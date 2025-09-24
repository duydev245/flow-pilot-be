import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { SharedModule } from './shared/shared.module'
import { AuthModule } from './routes/auth/auth.module'
import { APP_FILTER, APP_PIPE } from '@nestjs/core'
import { CatchEverythingFilter } from './shared/filters/catch-everything.filter'
import { ProjectModule } from './routes/project/project.module'
import { UserModule } from 'src/routes/user/user.module'
import CustomZodValidationPipe from './shared/pipes/custom-zod-validation.pipe'
import { FeatureModule } from './routes/feature/feature.module'
import { PackageModule } from './routes/package/package.module'
import { WorkspaceModule } from 'src/routes/workspace/workspace.module'
import { FocusLogModule } from './routes/focus-log/focus-log.module';
import { MicroFeedbackModule } from './routes/micro-feedback/micro-feedback.module';
import { TaskModule } from './routes/task/task.module';
import { NotificationModule } from './routes/notification/notification.module';
import { WebSocketModule } from './web-socket/web-socket.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    SharedModule,
    AuthModule,
    ProjectModule,
    UserModule,
    FeatureModule,
    PackageModule,
    WorkspaceModule,
    FocusLogModule,
    MicroFeedbackModule,
    TaskModule,
    NotificationModule,
    WebSocketModule,
    EventEmitterModule.forRoot(),
  ],
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
