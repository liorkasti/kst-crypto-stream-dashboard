import {
  Controller,
  Get,
  MessageEvent,
  NotFoundException,
  Param,
  Query,
  Sse,
} from '@nestjs/common';
import { Observable, from, mergeMap } from 'rxjs';
import { historyQuerySchema } from '@kin/shared';
import { PricesService } from './prices.service';
import { PricesStream } from './prices.stream';
import { PrismaService } from '../prisma/prisma.service';

@Controller()
export class PricesController {
  constructor(
    private readonly prices: PricesService,
    private readonly stream: PricesStream,
    private readonly prisma: PrismaService,
  ) {}

  @Get('prices')
  getPrices() {
    return this.prices.getLatest();
  }

  @Get('assets/:id/history')
  async getHistory(@Param('id') id: string, @Query() query: unknown) {
    const asset = await this.prisma.asset.findUnique({ where: { id } });
    if (!asset) throw new NotFoundException('Asset not found');

    const { window } = historyQuerySchema.parse(query);
    return this.prices.getHistory(id, window);
  }

  // Pushes the full latest snapshot on every refresh tick + a 5s heartbeat
  // (so a stalled upstream still visibly flips the client to "stale").
  @Sse('stream')
  stream$(): Observable<MessageEvent> {
    return this.stream.events$.pipe(
      mergeMap(() => from(this.prices.getLatest().then((data) => ({ data })))),
    );
  }
}
