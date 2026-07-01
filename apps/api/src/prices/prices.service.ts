import { Injectable } from '@nestjs/common';
import type { AssetDto, PricePoint, PricesResponse } from '@kin/shared';
import { PrismaService } from '../prisma/prisma.service';
import { env } from '../config/env';

const WINDOW_MS = {
  '15m': 15 * 60_000,
  '1h': 60 * 60_000,
  '24h': 24 * 60 * 60_000,
} as const;

@Injectable()
export class PricesService {
  constructor(private readonly prisma: PrismaService) {}

  async getLatest(): Promise<PricesResponse> {
    const [assets, meta] = await Promise.all([
      this.prisma.asset.findMany({ orderBy: { marketCap: 'desc' } }),
      this.prisma.refreshMeta.findUnique({ where: { id: 1 } }),
    ]);

    const lastSuccessAt = meta?.lastSuccessAt ?? null;
    const stale =
      !lastSuccessAt ||
      Date.now() - lastSuccessAt.getTime() > env.STALE_THRESHOLD_MS;

    const data: AssetDto[] = assets.map((a) => ({
      id: a.id,
      symbol: a.symbol,
      name: a.name,
      price: Number(a.price),
      change24h: Number(a.change24h),
      marketCap: Number(a.marketCap),
      updatedAt: a.updatedAt.toISOString(),
    }));

    return { data, lastUpdatedAt: lastSuccessAt?.toISOString() ?? null, stale };
  }

  async getHistory(
    assetId: string,
    window: keyof typeof WINDOW_MS = '1h',
  ): Promise<PricePoint[]> {
    const since = new Date(Date.now() - WINDOW_MS[window]);
    const rows = await this.prisma.priceHistory.findMany({
      where: { assetId, ts: { gte: since } },
      orderBy: { ts: 'asc' },
    });
    return rows.map((r) => ({
      price: Number(r.price),
      ts: r.ts.toISOString(),
    }));
  }
}
