import { Body, Controller, Post } from '@nestjs/common'
import { PerformanceService } from './performance.service'

import { PerformanceEvaluationRequestDto } from './performance.dto'

@Controller('performance')
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  @Post('evaluate')
  async evaluatePerformance(@Body() dto: PerformanceEvaluationRequestDto) {
    return await this.performanceService.evaluatePerformanceByAI(dto)
  }
}
