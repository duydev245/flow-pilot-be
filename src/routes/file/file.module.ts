import { Module } from '@nestjs/common'
import { FileService } from './file.service'
import { FileController } from './file.controller'
import { FileRepository } from './file.repo'

@Module({
  controllers: [FileController],
  providers: [FileService, FileRepository],
})
export class FileModule {}
