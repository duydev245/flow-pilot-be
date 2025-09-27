import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common'
import { HttpAdapterHost } from '@nestjs/core'
import { MulterError } from 'multer'
import { InvalidFile } from 'src/routes/file/file.error'

export class InvalidFileExtensionError extends Error { }

@Catch(MulterError, InvalidFileExtensionError)
export class MulterExceptionsFilter implements ExceptionFilter {
    constructor(private readonly httpAdapterHost: HttpAdapterHost) { }

    catch(exception: unknown, host: ArgumentsHost): void {
        const { httpAdapter } = this.httpAdapterHost
        const ctx = host.switchToHttp()
        const res = ctx.getResponse()
        const req = ctx.getRequest()

        let status = HttpStatus.INTERNAL_SERVER_ERROR
        let payload: any = { message: 'Internal Server Error' }

        if (exception instanceof MulterError) {
            // Map common Multer errors to InvalidFile
            status = HttpStatus.BAD_REQUEST
            const invalidResp = typeof (InvalidFile as any).getResponse === 'function' ? (InvalidFile as any).getResponse() : { code: 'INVALID_FILE_EXCEPTION', message: 'Invalid file' }
            payload = { ...invalidResp, message: exception.message }
        } else if (exception instanceof InvalidFileExtensionError) {
            status = HttpStatus.BAD_REQUEST
            const invalidResp = typeof (InvalidFile as any).getResponse === 'function' ? (InvalidFile as any).getResponse() : { code: 'INVALID_FILE_EXCEPTION', message: 'Invalid file' }
            payload = { ...invalidResp, message: 'Invalid file extension' }
        }

        const responseBody = {
            success: false,
            statusCode: status,
            ...payload,
            timestamp: new Date().toISOString(),
            path: httpAdapter.getRequestUrl(req),
        }

        httpAdapter.reply(res, responseBody, status)
    }
}
