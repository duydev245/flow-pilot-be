import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { isUniqueConstraintPrismaError } from '../helpers';

@Catch()
export class CatchEverythingFilter implements ExceptionFilter {
    constructor(private readonly httpAdapterHost: HttpAdapterHost) { }

    catch(exception: unknown, host: ArgumentsHost): void {
        // In certain situations `httpAdapter` might not be available in the
        // constructor method, thus we should resolve it here.
        const { httpAdapter } = this.httpAdapterHost;

        const ctx = host.switchToHttp();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let payload: Record<string, any> = { message: 'Internal Server Error' };

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const res = exception.getResponse();

            payload = typeof res === 'string' ? { message: res } : (res as Record<string, any>);
            const { statusCode: _ignored, ...rest } = payload;
            payload = rest;
        } else if (isUniqueConstraintPrismaError(exception)) {
            status = HttpStatus.CONFLICT;
            payload = { message: 'Record is already existed!' };
        }

        const responseBody = {
            success: false,
            statusCode: status,
            ...payload,
            timestamp: new Date().toISOString(),
            path: httpAdapter.getRequestUrl(ctx.getRequest()),
        };

        httpAdapter.reply(ctx.getResponse(), responseBody, status);
    }
}
