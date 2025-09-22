import { Controller } from '@nestjs/common';
import { MicroFeedbackService } from './micro-feedback.service';

@Controller('micro-feedback')
export class MicroFeedbackController {
  constructor(private readonly microFeedbackService: MicroFeedbackService) {}
}
