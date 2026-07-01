import { useState } from 'react'
import type { AssetDto } from '@kin/shared'
import { useLivePrices } from '@/hooks/useLivePrices'
import { FreshnessBadge } from '@/components/FreshnessBadge'
import { PriceTable } from '@/components/PriceTable'
import { CoinDetailModal } from '@/components/CoinDetailModal'
import { Loading } from '@/components/states/Loading'
import { Empty } from '@/components/states/Empty'
import { ErrorState } from '@/components/states/ErrorState'

export default function App() {
  const { data, connection, error } = useLivePrices()
  const [selected, setSelected] = useState<AssetDto | null>(null)

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Kin — Real-Time Crypto Dashboard</h1>
        <FreshnessBadge
          lastUpdatedAt={data?.lastUpdatedAt ?? null}
          stale={data?.stale ?? true}
          connected={connection !== 'reconnecting'}
        />
      </header>

      {error && !data && <ErrorState message={error} onRetry={() => window.location.reload()} />}
      {!error && !data && <Loading />}
      {data && data.data.length === 0 && <Empty />}
      {data && data.data.length > 0 && <PriceTable assets={data.data} onSelect={setSelected} />}

      <CoinDetailModal asset={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
