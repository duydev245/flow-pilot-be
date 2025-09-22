import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { FocusLogRepository } from './focus-log.repo';
import { DailyFocusLogCreateType, DailyFocusLogUpdateType } from './focus-log.model';
import { FocusLogErrors } from './focus-log.error';
import { SuccessResponse } from 'src/shared/sucess';

@Injectable()
export class FocusLogService {
    constructor(private readonly focusLogRepo: FocusLogRepository) { }

    async create(data: DailyFocusLogCreateType) {
        try {
            await this.focusLogRepo.create(data);
            return SuccessResponse('Create focus log successfully');
        } catch (err) {
            throw new BadRequestException(FocusLogErrors.CreateFailed);
        }
    }

    async findAll() {
        const result = await this.focusLogRepo.findAll();
        return SuccessResponse('Get focus log list successfully', result);
    }

    async findById(id: number) {
        const log = await this.focusLogRepo.findById(id);
        if (!log) throw new NotFoundException(FocusLogErrors.NotFound);
        return SuccessResponse('Get focus log successfully', log);
    }

    async update(id: number, data: DailyFocusLogUpdateType) {
        try {
            const updated = await this.focusLogRepo.update(id, data);
            if (!updated) throw new NotFoundException(FocusLogErrors.NotFound);
            return SuccessResponse('Update focus log successfully', updated);
        } catch (err) {
            throw new BadRequestException(FocusLogErrors.UpdateFailed);
        }
    }

    async delete(id: number) {
        try {
            const deleted = await this.focusLogRepo.delete(id);
            if (!deleted) throw new NotFoundException(FocusLogErrors.NotFound);
            return SuccessResponse('Delete focus log successfully', deleted);
        } catch (err) {
            throw new BadRequestException(FocusLogErrors.DeleteFailed);
        }
    }
}
