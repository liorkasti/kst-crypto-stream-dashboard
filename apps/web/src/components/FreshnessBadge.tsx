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
  // Re-renders "updated Ns ago" each second; stale itself is server-owned.
  const [, forceTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => forceTick((n) => n + 1), 1000)
    return () => clearInterval(id)
  }, [])

  // 'connecting' (first load) vs 'reconnecting' (dropped) avoids implying
  // a lost connection that was never established.
  if (connection === 'connecting') return <Badge variant="neutral">connecting…</Badge>
  if (connection === 'reconnecting') return <Badge variant="error">reconnecting…</Badge>

  return (
    <Badge variant={stale ? 'stale' : 'fresh'}>
      {stale ? 'data may be stale' : `updated ${formatSecondsAgo(lastUpdatedAt)}`}
    </Badge>
  )
}
