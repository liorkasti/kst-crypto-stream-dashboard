import { Injectable, Logger } from '@nestjs/common';
import { env } from '../config/env';

export interface UpstreamAsset {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
}

@Injectable()
export class UpstreamService {
  private readonly logger = new Logger(UpstreamService.name);

  async fetchTopMarkets(): Promise<UpstreamAsset[]> {
    if (env.SIMULATE_UPSTREAM_DOWN) {
      throw new Error('Upstream simulated down (SIMULATE_UPSTREAM_DOWN=true)');
    }

    const url = `${env.UPSTREAM_BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8_000);

    try {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) {
        throw new Error(`Upstream responded ${res.status}`);
      }
      const body = (await res.json()) as UpstreamAsset[];
      if (!Array.isArray(body) || body.length === 0) {
        throw new Error('Upstream returned empty/invalid payload');
      }
      return body;
    } finally {
      clearTimeout(timeout);
    }
  }
}
