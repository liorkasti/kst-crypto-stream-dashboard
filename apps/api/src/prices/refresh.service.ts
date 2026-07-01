import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, Interval } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { UpstreamService } from './upstream.service';
import { PricesStream } from './prices.stream';
import { env } from '../config/env';

const RETENTION_MS = 24 * 60 * 60_000;

@Injectable()
export class RefreshService {
  private readonly logger = new Logger(RefreshService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly upstream: UpstreamService,
    private readonly stream: PricesStream,
  ) {}

  // Single shared loop — the ONLY place upstream is ever called.
  @Interval(env.REFRESH_MS)
  async tick(): Promise<void> {
    try {
      const markets = await this.upstream.fetchTopMarkets();
      const now = new Date();

      // upsert() returns the full row, so the transaction result is reused
      // directly below instead of a follow-up findMany — one fewer DB
      // round-trip on every tick.
      const results = await this.prisma.$transaction([
        ...markets.map((m) =>
          this.prisma.asset.upsert({
            where: { symbol: m.symbol },
            create: {
              symbol: m.symbol,
              name: m.name,
              price: m.current_price,
              change24h: m.price_change_percentage_24h ?? 0,
              marketCap: BigInt(Math.round(m.market_cap ?? 0)),
              updatedAt: now,
            },
            update: {
              name: m.name,
              price: m.current_price,
              change24h: m.price_change_percentage_24h ?? 0,
              marketCap: BigInt(Math.round(m.market_cap ?? 0)),
              updatedAt: now,
            },
          }),
        ),
        this.prisma.refreshMeta.upsert({
          where: { id: 1 },
          create: { id: 1, lastSuccessAt: now },
          update: { lastSuccessAt: now },
        }),
      ]);

      const assets = results.slice(0, -1) as Awaited<
        ReturnType<typeof this.prisma.asset.upsert>
      >[];
      const bySymbol = new Map(assets.map((a) => [a.symbol, a]));

      await this.prisma.priceHistory.createMany({
        data: markets
          .filter((m) => bySymbol.has(m.symbol))
          .map((m) => ({
            assetId: bySymbol.get(m.symbol)!.id,
            price: m.current_price,
            ts: now,
          })),
      });

      this.stream.notify();
    } catch (err) {
      // Failure is expected and handled: last-known-good stays in the DB,
      // lastSuccessAt does NOT advance (so /prices flips stale on its own), next tick retries.
      this.logger.warn(
        `Refresh tick failed, serving last-known-good: ${(err as Error).message}`,
      );
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async pruneHistory(): Promise<void> {
    const cutoff = new Date(Date.now() - RETENTION_MS);
    const { count } = await this.prisma.priceHistory.deleteMany({
      where: { ts: { lt: cutoff } },
    });
    if (count > 0)
      this.logger.log(`Pruned ${count} price_history rows older than 24h`);
  }
}
