import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { formatSecondsAgo } from '@/lib/format'

interface Props {
  lastUpdatedAt: string | null
  stale: boolean
  connected: boolean
}

export function FreshnessBadge({ lastUpdatedAt, stale, connected }: Props) {
  // Ticks every second purely to re-render "updated Ns ago" — the stale
  // verdict itself always comes from the server, never computed here.
  const [, forceTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => forceTick((n) => n + 1), 1000)
    return () => clearInterval(id)
  }, [])

  if (!connected) return <Badge variant="error">reconnecting…</Badge>

  return (
    <Badge variant={stale ? 'stale' : 'fresh'}>
      {stale ? 'data may be stale' : `updated ${formatSecondsAgo(lastUpdatedAt)}`}
    </Badge>
  )
}
