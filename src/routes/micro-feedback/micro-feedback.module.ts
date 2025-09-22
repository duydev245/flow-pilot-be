import { Module } from '@nestjs/common';
import { MicroFeedbackService } from './micro-feedback.service';
import { MicroFeedbackController } from './micro-feedback.controller';

@Module({
  controllers: [MicroFeedbackController],
  providers: [MicroFeedbackService],
})
export class MicroFeedbackModule {}
