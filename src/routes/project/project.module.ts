import { Module } from '@nestjs/common'

import { ProjectService } from './project.service'
import { ProjectController } from './project.controller'
import { ProjectRepository } from 'src/routes/project/project.repo'

@Module({
  controllers: [ProjectController],
  providers: [ProjectService, ProjectRepository],
})
export class ProjectModule {}
