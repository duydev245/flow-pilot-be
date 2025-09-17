import { Module } from '@nestjs/common'
import { PackageService } from './package.service'
import { PackageController } from './package.controller'
import { PackageRepository } from 'src/routes/package/package.repo'

@Module({
  controllers: [PackageController],
  providers: [PackageService, PackageRepository],
})
export class PackageModule {}
