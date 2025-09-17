import { Module } from '@nestjs/common'
import { FeatureService } from './feature.service'
import { FeatureController } from './feature.controller'
import { FeatureRepository } from 'src/routes/feature/feature.repo'
import { PackageRepository } from 'src/routes/package/package.repo'

@Module({
  controllers: [FeatureController],
  providers: [FeatureService, FeatureRepository, PackageRepository],
})
export class FeatureModule {}
