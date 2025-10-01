import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { OrderRepository } from './order.repo';
import { PackageRepository } from '../package/package.repo';
import { SharedWorkspaceRepository } from 'src/shared/repositories/shared-workspace.repo';
import { PaymentModule } from '../payment/payment.module';
import { ConsultationRequestModule } from '../consultation-request/consultation-request.module';

@Module({
  imports: [PaymentModule, ConsultationRequestModule],
  controllers: [OrderController],
  providers: [OrderService, OrderRepository, PackageRepository, SharedWorkspaceRepository],
})
export class OrderModule {}
