import { z } from 'zod'
import { pricesResponseSchema, pricePointSchema, type PricesResponse, type PricePoint, type HistoryQuery } from '@kin/shared'

const API_BASE = '/api'
const FETCH_TIMEOUT_MS = 8_000

// Backend's own upstream call has an 8s AbortController timeout — this
// mirrors it client-side. Without it, an unresponsive API leaves the UI
// on the loading skeleton indefinitely instead of surfacing an error.
async function fetchWithTimeout(url: string, timeoutMs = FETCH_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { signal: controller.signal })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs / 1000}s`)
    }
    throw err
  } finally {
    clearTimeout(timeout)
  }
}

export async function fetchPrices(): Promise<PricesResponse> {
  const res = await fetchWithTimeout(`${API_BASE}/prices`)
  if (!res.ok) throw new Error(`Failed to fetch prices: ${res.status}`)
  return pricesResponseSchema.parse(await res.json())
}

export async function fetchHistory(
  assetId: string,
  window: HistoryQuery['window'] = '1h',
): Promise<PricePoint[]> {
  const res = await fetchWithTimeout(
    `${API_BASE}/assets/${encodeURIComponent(assetId)}/history?window=${encodeURIComponent(window)}`,
  )
  if (!res.ok) throw new Error(`Failed to fetch history: ${res.status}`)
  return z.array(pricePointSchema).parse(await res.json())
}

export const STREAM_URL = `${API_BASE}/stream`
