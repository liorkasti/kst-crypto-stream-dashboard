import { z } from 'zod'
import { pricesResponseSchema, pricePointSchema, type PricesResponse, type PricePoint, type HistoryQuery } from '@kin/shared'

const API_BASE = '/api'

export async function fetchPrices(): Promise<PricesResponse> {
  const res = await fetch(`${API_BASE}/prices`)
  if (!res.ok) throw new Error(`Failed to fetch prices: ${res.status}`)
  return pricesResponseSchema.parse(await res.json())
}

export async function fetchHistory(
  assetId: string,
  window: HistoryQuery['window'] = '1h',
): Promise<PricePoint[]> {
  const res = await fetch(`${API_BASE}/assets/${assetId}/history?window=${window}`)
  if (!res.ok) throw new Error(`Failed to fetch history: ${res.status}`)
  return z.array(pricePointSchema).parse(await res.json())
}

export const STREAM_URL = `${API_BASE}/stream`
