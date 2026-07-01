import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { formatSecondsAgo } from '@/lib/format'
import type { ConnectionState } from '@/hooks/useLivePrices'

interface Props {
  lastUpdatedAt: string | null
  stale: boolean
  connection: ConnectionState
}

export function FreshnessBadge({ lastUpdatedAt, stale, connection }: Props) {
  // Ticks every second purely to re-render "updated Ns ago" — the stale
  // verdict itself always comes from the server, never computed here.
  const [, forceTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => forceTick((n) => n + 1), 1000)
    return () => clearInterval(id)
  }, [])

  // Distinguishing 'connecting' (first load) from 'reconnecting' (dropped
  // after being open) avoids implying a lost connection on initial load.
  if (connection === 'connecting') return <Badge variant="neutral">connecting…</Badge>
  if (connection === 'reconnecting') return <Badge variant="error">reconnecting…</Badge>

  return (
    <Badge variant={stale ? 'stale' : 'fresh'}>
      {stale ? 'data may be stale' : `updated ${formatSecondsAgo(lastUpdatedAt)}`}
    </Badge>
  )
}
