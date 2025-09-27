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
} from '@nestjs/common'
import { FileService } from './file.service'
import { FileInterceptor } from '@nestjs/platform-express'
import * as multer from 'multer'
import { UseFilters } from '@nestjs/common'
import { MulterExceptionsFilter, InvalidFileExtensionError } from 'src/shared/filters/multer-exception.filter'
import type { Response } from 'express'
import { UseGuards } from '@nestjs/common'
import { UploadForTaskBodyDto, UploadForUserBodyDto, UploadFileDto } from './file.dto'
import { ZodSerializerDto } from 'nestjs-zod'
import { GetUserId } from 'src/shared/decorators/active-user.decorator'
import { Roles } from 'src/shared/decorators/roles.decorator'
import { RoleName } from 'src/shared/constants/role.constant'
import { AuthRoleGuard } from 'src/shared/guards/auth-role.guard'

const uploadOptions = {
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const ext = file.originalname?.slice(file.originalname.lastIndexOf('.')).toLowerCase() ?? ''
    const allowed = ['.pdf', '.txt', '.csv', '.doc', '.docx', '.xlsx']
    if (!allowed.includes(ext)) return cb(new InvalidFileExtensionError('INVALID_FILE_EXTENSION') as any, false)
    cb(null, true)
  },
}

@Controller('file')
@UseFilters(MulterExceptionsFilter)
@UseGuards(AuthRoleGuard)
@Roles([RoleName.ProjectManager, RoleName.Employee, RoleName.Admin, RoleName.SuperAdmin])
export class FileController {
  constructor(private readonly fileService: FileService) { }

  // upload file for a task - multipart form: file, task_id ; user_id taken from token
  @Post('upload/task')
  @UseInterceptors(FileInterceptor('file', uploadOptions))
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
  @ZodSerializerDto(UploadFileDto)
  async uploadForUser(
    @GetUserId() user_id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadForUserBodyDto
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
