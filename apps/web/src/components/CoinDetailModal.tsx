import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { AssetDto } from '@kin/shared'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { useCoinHistory } from '@/hooks/useCoinHistory'
import { formatUsd } from '@/lib/format'

interface Props {
  asset: AssetDto | null
  onClose: () => void
}

export function CoinDetailModal({ asset, onClose }: Props) {
  const { data: history, isLoading, isError } = useCoinHistory(asset?.id ?? null, '1h')

  return (
    <Dialog open={Boolean(asset)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        {asset && (
          <>
            <DialogTitle>
              {asset.name} <span className="text-gray-400 uppercase">{asset.symbol}</span>
            </DialogTitle>
            <DialogDescription>Last hour, from stored history — no upstream call.</DialogDescription>
            <div className="mt-4 text-2xl font-semibold tabular-nums">{formatUsd(asset.price)}</div>

            <div className="mt-4 h-48">
              {isLoading && (
                <div className="flex h-full items-center justify-center text-sm text-gray-400">
                  Loading history…
                </div>
              )}
              {isError && (
                <div className="flex h-full items-center justify-center text-sm text-red-500">
                  Couldn't load history.
                </div>
              )}
              {!isLoading && !isError && history?.length === 0 && (
                <div className="flex h-full items-center justify-center text-sm text-gray-400">
                  No history yet — check back in a minute.
                </div>
              )}
              {!isLoading && !isError && history && history.length > 0 && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history}>
                    <XAxis dataKey="ts" hide />
                    <YAxis domain={['auto', 'auto']} hide />
                    <Tooltip
                      formatter={(value: number) => formatUsd(value)}
                      labelFormatter={(label: string) => new Date(label).toLocaleTimeString()}
                    />
                    <Line type="monotone" dataKey="price" stroke="#4f46e5" dot={false} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
