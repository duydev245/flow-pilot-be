import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from './shared/shared.module';
import { AuthModule } from './routes/auth/auth.module';
import { APP_FILTER } from '@nestjs/core';
import { CatchEverythingFilter } from './shared/filters/catch-everything.filter';
import { WorkspaceModule } from './routes/workspace/workspace.module';
import { UserModule } from './routes/user/user.module';
import { ProjectModule } from './routes/project/project.module';

@Module({
  imports: [SharedModule, AuthModule, WorkspaceModule, UserModule, ProjectModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: CatchEverythingFilter,
    },
  ],
})
export class AppModule { }
