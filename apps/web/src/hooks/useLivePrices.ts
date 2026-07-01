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
    let hasOpened = false

    source.onopen = () => {
      hasOpened = true
      setConnection('open')
    }
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
    // EventSource retries automatically on error. onerror also fires on the
    // very first failed connection attempt, before onopen has ever run —
    // without the hasOpened check, that would show "reconnecting" for a
    // connection that was never actually established in the first place.
    source.onerror = () => setConnection(hasOpened ? 'reconnecting' : 'connecting')

    return () => source.close()
  }, [])

  return { data, connection, error }
}
