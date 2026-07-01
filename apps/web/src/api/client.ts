import { z } from 'zod'
import { pricesResponseSchema, pricePointSchema, type PricesResponse, type PricePoint, type HistoryQuery } from '@kin/shared'

const API_BASE = '/api'
const FETCH_TIMEOUT_MS = 8_000

// Backend's own upstream call has an 8s AbortController timeout — this
// mirrors it client-side. Without it, an unresponsive API leaves the UI
// on the loading skeleton indefinitely instead of surfacing an error.
//
// The timeout must stay active through the body read, not just until
// fetch() resolves — fetch() resolves as soon as headers arrive, so a
// server that responds promptly but then stalls the body would hang
// res.json() with zero timeout protection if that call happened outside
// this function's scope. Reading the JSON here keeps the abort signal
// live for the whole request, not just the header round-trip.
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
    // Check `.name` directly rather than gating on `instanceof DOMException`
    // first — some runtimes/polyfills throw an AbortError-named object that
    // isn't a real DOMException, which would silently skip this branch.
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
