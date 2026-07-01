import { useEffect, useRef, useState } from 'react'
import { pricesResponseSchema, type PricesResponse } from '@kin/shared'
import { fetchPrices, STREAM_URL } from '@/api/client'

export type ConnectionState = 'connecting' | 'open' | 'reconnecting'

export function useLivePrices() {
  const [data, setData] = useState<PricesResponse | null>(null)
  const [connection, setConnection] = useState<ConnectionState>('connecting')
  const [error, setError] = useState<string | null>(null)
  const sourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    // Prime the view immediately so we don't wait for the first SSE tick.
    fetchPrices()
      .then((snapshot) => {
        setData(snapshot)
        setError(null)
      })
      .catch((err) => setError((err as Error).message))

    const source = new EventSource(STREAM_URL)
    sourceRef.current = source

    source.onopen = () => setConnection('open')
    source.onmessage = (event) => {
      try {
        const parsed = pricesResponseSchema.parse(JSON.parse(event.data))
        setData(parsed)
        setError(null)
        setConnection('open')
      } catch {
        // malformed frame — keep last-good data on screen, wait for the next tick
      }
    }
    source.onerror = () => setConnection('reconnecting')

    return () => source.close()
  }, [])

  return { data, connection, error }
}
