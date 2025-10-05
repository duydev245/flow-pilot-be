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

    async getByUserId(userId: string) {
        try {
            if (!userId) {
                throw new BadRequestException(FocusLogErrors.InvalidUserId);
            }

            const logs = await this.focusLogRepo.findByUserId(userId);

            if (!logs || logs.length === 0) {
                throw new NotFoundException(FocusLogErrors.NoLogsFound);
            }

            // Aggregate logs by date (YYYY-MM-DD) using created_at
            const map = new Map<string, { date: string; total_focused_minutes: number; notes: string[]; items: any[] }>();

            for (const l of logs) {
                const date = l.created_at instanceof Date ? l.created_at.toISOString().slice(0, 10) : String(l.created_at).slice(0, 10);
                const existing = map.get(date);
                if (existing) {
                    existing.total_focused_minutes += l.focused_minutes || 0;
                    if (l.note) existing.notes.push(l.note);
                    existing.items.push(l);
                } else {
                    map.set(date, {
                        date,
                        total_focused_minutes: l.focused_minutes || 0,
                        notes: l.note ? [l.note] : [],
                        items: [l],
                    });
                }
            }

            const aggregated = Array.from(map.values()).sort((a, b) => (a.date < b.date ? 1 : -1));

            return SuccessResponse('Get user focus logs successfully', aggregated);
        } catch (err) {
            if (err instanceof NotFoundException || err instanceof BadRequestException) {
                throw err;
            }
            throw new BadRequestException(FocusLogErrors.GetByUserIdFailed);
        }
    }
}
