import { Module } from '@nestjs/common';
import { SystemRoleService } from './system-role.service';
import { SystemRoleController } from './system-role.controller';
import { SystemRoleRepository } from './system-role.repo';

@Module({
  controllers: [SystemRoleController],
  providers: [SystemRoleService, SystemRoleRepository],
  exports: [SystemRoleService, SystemRoleRepository],
})
export class SystemRoleModule {}
