import { Module } from '@nestjs/common';
import { PricesController } from './prices.controller';
import { PricesService } from './prices.service';
import { RefreshService } from './refresh.service';
import { UpstreamService } from './upstream.service';
import { PricesStream } from './prices.stream';

@Module({
  controllers: [PricesController],
  providers: [PricesService, RefreshService, UpstreamService, PricesStream],
})
export class PricesModule {}
