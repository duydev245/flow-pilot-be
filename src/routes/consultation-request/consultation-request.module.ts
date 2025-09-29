import { Module } from '@nestjs/common';
import { ConsultationRequestService } from './consultation-request.service';
import { ConsultationRequestController } from './consultation-request.controller';
import { ConsultationRequestRepository } from './consultation-request.repo';
import { PackageRepository } from '../package/package.repo';

@Module({
  controllers: [ConsultationRequestController],
  providers: [ConsultationRequestService, ConsultationRequestRepository, PackageRepository],
})
export class ConsultationRequestModule {}
