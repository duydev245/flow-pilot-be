import { Module } from '@nestjs/common'
import { DepartmentService } from './department.service'
import { DepartmentController } from './department.controller'
import { DepartmentRepository } from './department.repo'
import { SharedModule } from 'src/shared/shared.module'

@Module({
  imports: [SharedModule],
  controllers: [DepartmentController],
  providers: [DepartmentService, DepartmentRepository],
  exports: [DepartmentService, DepartmentRepository],
})
export class DepartmentModule { }
