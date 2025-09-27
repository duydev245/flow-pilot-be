import { Module } from '@nestjs/common';
import { PerformanceService } from './performance.service';
import { PerformanceController } from './performance.controller';
import { PerformanceRepository } from 'src/routes/performance/performance.repo';

@Module({
  controllers: [PerformanceController],
  providers: [PerformanceService, PerformanceRepository],
})
export class PerformanceModule {}
