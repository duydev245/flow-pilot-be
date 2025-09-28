import { NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common'

export const GetFileFail = new NotFoundException({
	code: 'NOT_FOUND_FILE_EXCEPTION',
	message: 'Cannot get file',
})

export const InvalidFile = new BadRequestException({
	code: 'INVALID_FILE_EXCEPTION',
	message: 'Invalid file',
})

export const UploadFileFail = new InternalServerErrorException({
	code: 'UPLOAD_FILE_EXCEPTION',
	message: 'Upload file failed',
})

export const DeleteFileFail = new InternalServerErrorException({
	code: 'DELETE_FILE_EXCEPTION',
	message: 'Delete file failed',
})

