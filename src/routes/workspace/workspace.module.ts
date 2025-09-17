import { Module } from '@nestjs/common'
import { WorkspaceService } from './workspace.service'
import { WorkspaceController } from './workspace.controller'
import { WorkspaceRepository } from './workspace.repo'
import { PackageRepository } from 'src/routes/package/package.repo'

@Module({
  controllers: [WorkspaceController],
  providers: [WorkspaceService, WorkspaceRepository, PackageRepository],
})
export class WorkspaceModule {}
