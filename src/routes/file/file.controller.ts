import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  Param,
  Delete,
  Get,
  Res,
  ParseIntPipe,
  HttpCode,
  Query,
} from '@nestjs/common'
import { FileService } from './file.service'
import { FileInterceptor } from '@nestjs/platform-express'
import * as multer from 'multer'
import { UseFilters } from '@nestjs/common'
import { MulterExceptionsFilter, InvalidFileExtensionError } from 'src/shared/filters/multer-exception.filter'
import type { Response } from 'express'
import { UseGuards } from '@nestjs/common'
import { UploadFileDto, UploadForTaskBodyDto } from './file.dto'
import { ZodSerializerDto } from 'nestjs-zod'
import { GetUserId } from 'src/shared/decorators/active-user.decorator'
import { Roles } from 'src/shared/decorators/roles.decorator'
import { RoleName } from 'src/shared/constants/role.constant'
import { AuthRoleGuard } from 'src/shared/guards/auth-role.guard'
import path from 'path'
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiSecurity, ApiTags } from '@nestjs/swagger'

const uploadOptions = {
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const ext = path.extname(file.originalname || '').toLowerCase()
    const allowed = ['.pdf', '.txt', '.csv', '.doc', '.docx', '.xlsx']
    if (!allowed.includes(ext)) return cb(new InvalidFileExtensionError('INVALID_FILE_EXTENSION') as any, false)
    cb(null, true)
  },
}

@Controller('file')
@ApiTags('File')
@ApiSecurity('x-api-key')
@ApiBearerAuth('access-token')
@UseFilters(MulterExceptionsFilter)
@UseGuards(AuthRoleGuard)
@Roles([RoleName.ProjectManager, RoleName.Employee, RoleName.Admin, RoleName.SuperAdmin])
export class FileController {
  constructor(private readonly fileService: FileService) { }

  // get all files by task id with pagination and search
  @Get('task/:task_id')
  async getFilesByTaskId(
    @Param('task_id') task_id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.fileService.getFilesByTaskId(task_id, page, limit, search)
  }

  // get all files by user id with pagination and search
  @Get('user-files')
  async getFilesByUserId(
    @GetUserId() user_id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.fileService.getFilesByUserId(user_id, page, limit, search)
  }

  // upload file for a task - multipart form: file, task_id ; user_id taken from token
  @Post('upload/task')
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        task_id: { type: 'string', example: '7d5c88c3-1f79-4a1a-9e1e-3d2c9fcbf2d1' },
      },
      required: ['file', 'task_id'],
    },
  })
  @ZodSerializerDto(UploadFileDto)
  async uploadForTask(
    @GetUserId() user_id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadForTaskBodyDto
  ) {
    const { task_id } = body
    return this.fileService.uploadForTask({ user_id, task_id, file })
  }

  // upload file for a user - multipart form: file ; user_id taken from token
  @Post('upload/user')
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
      required: ['file'],
    },
  })
  @ZodSerializerDto(UploadFileDto)
  async uploadForUser(
    @GetUserId() user_id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.fileService.uploadForUser({ user_id, file })
  }

  // delete file by id
  @Delete(':id')
  async deleteById(@Param('id', ParseIntPipe) id: number) {
    return this.fileService.deleteById(id)
  }

  // download file by id
  @Get(':id/download')
  @HttpCode(200)
  async downloadById(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response
  ) {
    const { buffer, meta } = await this.fileService.downloadById(id)
    res.setHeader('Content-Type', meta.mime_type || 'application/octet-stream')
    res.setHeader('Content-Disposition', `attachment; filename="${meta.file_name}"`)
    res.send(buffer)
  }
}
