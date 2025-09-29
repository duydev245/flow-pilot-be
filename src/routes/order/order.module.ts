import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { OrderRepository } from './order.repo';
import { PackageRepository } from '../package/package.repo';
import { SharedWorkspaceRepository } from 'src/shared/repositories/shared-workspace.repo';

@Module({
  controllers: [OrderController],
  providers: [OrderService, OrderRepository, PackageRepository, SharedWorkspaceRepository],
})
export class OrderModule {}
