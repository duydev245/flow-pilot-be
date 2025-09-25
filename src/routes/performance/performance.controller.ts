import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { PerformanceService } from './performance.service'

import { PerformanceEvaluationRequestDto } from './performance.dto'
import { GetUserId } from 'src/shared/decorators/active-user.decorator'
import { Roles } from 'src/shared/decorators/roles.decorator'
import { RoleName } from 'src/shared/constants/role.constant'
import { AuthRoleGuard } from 'src/shared/guards/auth-role.guard'
import { ZodSerializerDto } from 'nestjs-zod'
import { MessageResDTO } from 'src/shared/dtos/response.dto'

@Controller('performance')
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  @Post('evaluate')
  @Roles([RoleName.Employee, RoleName.ProjectManager, RoleName.Admin])
  @UseGuards(AuthRoleGuard)
  @ZodSerializerDto(MessageResDTO)
  async evaluatePerformance(@GetUserId() userId: string, @Body() dto: PerformanceEvaluationRequestDto) {
    return await this.performanceService.evaluatePerformanceByAI(userId, { ...dto, userId })
  }
}
