import { Module } from '@nestjs/common';
import { FocusLogService } from './focus-log.service';
import { FocusLogController } from './focus-log.controller';
import { FocusLogRepository } from './focus-log.repo';

@Module({
  controllers: [FocusLogController],
  providers: [FocusLogService, FocusLogRepository],
})
export class FocusLogModule {}
