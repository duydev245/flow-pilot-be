import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { SharedOrderRepository } from 'src/shared/repositories/shared-order.repo';
import { PaymentRepository } from './payment.repo';
import { EmailService } from 'src/shared/services/email.service';
import { ConsultationRequestRepository } from '../consultation-request/consultation-request.repo';

@Module({
  controllers: [PaymentController],
  providers: [
    PaymentService, 
    SharedOrderRepository, 
    PaymentRepository, 
    EmailService, 
    ConsultationRequestRepository
  ],
})
export class PaymentModule {}
