import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { FocusLogService } from './focus-log.service';
import type { DailyFocusLogCreateType } from './focus-log.model';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { AuthRoleGuard } from 'src/shared/guards/auth-role.guard';
import { GetUserId } from 'src/shared/decorators/active-user.decorator';
import { RoleName } from 'src/shared/constants/role.constant';
import { ApiBearerAuth, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { MessageResDTO } from 'src/shared/dtos/response.dto';
import { ZodSerializerDto } from 'nestjs-zod';

@Controller('focus-log')
@ApiTags('Focus Log Module')
@ApiSecurity('apiKey')
@ApiBearerAuth('access-token')
@UseGuards(AuthRoleGuard)
@ZodSerializerDto(MessageResDTO)
export class FocusLogController {
  constructor(private readonly focusLogService: FocusLogService) { }

  @Post()
  @Roles([RoleName.Employee, RoleName.Admin, RoleName.ProjectManager, RoleName.SuperAdmin])
  create(@GetUserId() user_id: string, @Body() data: Omit<DailyFocusLogCreateType, 'user_id'>) {
    return this.focusLogService.create({ ...data, user_id });
  }

  @Get()
  @Roles([RoleName.SuperAdmin])
  findAll() {
    return this.focusLogService.findAll();
  }

  // @Get(':id')
  // @Roles([RoleName.SuperAdmin])
  // findById(@Param('id') id: string) {
  //   return this.focusLogService.findById(Number(id));
  // }

  // @Put(':id')
  // @Roles([RoleName.SuperAdmin])
  // update(
  //   @Param('id') id: string,
  //   @GetUserId() user_id: string,
  //   @Body() data: Omit<DailyFocusLogUpdateType, 'user_id'>
  // ) {
  //   return this.focusLogService.update(Number(id), { ...data, user_id });
  // }

  @Delete(':id')
  @Roles([RoleName.SuperAdmin])
  delete(@Param('id') id: string) {
    return this.focusLogService.delete(Number(id));
  }
}
