import { z } from 'zod'
import { pricesResponseSchema, pricePointSchema, type PricesResponse, type PricePoint, type HistoryQuery } from '@kin/shared'

const API_BASE = '/api'
const FETCH_TIMEOUT_MS = 8_000

// json() is read here, inside the timeout's scope — fetch() resolves on
// headers alone, so a stalled body would hang unprotected otherwise.
async function fetchJsonWithTimeout(
  url: string,
  label: string,
  timeoutMs = FETCH_TIMEOUT_MS,
): Promise<unknown> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) throw new Error(`Failed to fetch ${label}: ${res.status}`)
    return await res.json()
  } catch (err) {
    // .name checked directly — some runtimes throw non-DOMException aborts.
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(`Request for ${label} timed out after ${timeoutMs / 1000}s`)
    }
    throw err
  } finally {
    clearTimeout(timeout)
  }
}

export async function fetchPrices(): Promise<PricesResponse> {
  const json = await fetchJsonWithTimeout(`${API_BASE}/prices`, 'prices')
  return pricesResponseSchema.parse(json)
}

export async function fetchHistory(
  assetId: string,
  window: HistoryQuery['window'] = '1h',
): Promise<PricePoint[]> {
  const json = await fetchJsonWithTimeout(
    `${API_BASE}/assets/${encodeURIComponent(assetId)}/history?window=${encodeURIComponent(window)}`,
    'history',
  )
  return z.array(pricePointSchema).parse(json)
}

export const STREAM_URL = `${API_BASE}/stream`
