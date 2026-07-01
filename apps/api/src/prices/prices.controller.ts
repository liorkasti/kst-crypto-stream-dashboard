import {
  Controller,
  Get,
  MessageEvent,
  NotFoundException,
  Param,
  Query,
  Sse,
} from '@nestjs/common';
import { Observable, exhaustMap, from } from 'rxjs';
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

  // exhaustMap drops ticks while a getLatest() call is in flight instead
  // of queueing them — safe since each frame is a full snapshot, and it
  // caps concurrency without unbounded buildup under a slow DB.
  @Sse('stream')
  stream$(): Observable<MessageEvent> {
    return this.stream.events$.pipe(
      exhaustMap(() =>
        from(this.prices.getLatest().then((data) => ({ data }))),
      ),
    );
  }
}
