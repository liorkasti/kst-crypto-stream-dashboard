import type { AssetDto } from '@kin/shared'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCompactUsd, formatPercent, formatUsd } from '@/lib/format'
import { cn } from '@/lib/utils'

interface Props {
  assets: AssetDto[]
  onSelect: (asset: AssetDto) => void
}

export function PriceTable({ assets, onSelect }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Coin</TableHead>
          <TableHead className="text-right">Price</TableHead>
          <TableHead className="text-right">24h</TableHead>
          <TableHead className="text-right">Market Cap</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {assets.map((asset) => (
          <TableRow key={asset.id} onClick={() => onSelect(asset)} className="cursor-pointer">
            <TableCell className="font-medium">
              {/* role="button" on a <tr> is an invalid ARIA override for
                  table semantics — a real <button> here gives keyboard
                  users a proper focus target with native Enter/Space
                  activation, no manual key handling needed. stopPropagation
                  avoids double-firing onSelect via the row's own onClick. */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onSelect(asset)
                }}
                className="rounded text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                {asset.name} <span className="text-gray-400 uppercase">{asset.symbol}</span>
              </button>
            </TableCell>
            <TableCell className="text-right tabular-nums">{formatUsd(asset.price)}</TableCell>
            <TableCell
              className={cn(
                'text-right tabular-nums',
                asset.change24h >= 0 ? 'text-emerald-600' : 'text-red-600',
              )}
            >
              {formatPercent(asset.change24h)}
            </TableCell>
            <TableCell className="text-right tabular-nums">{formatCompactUsd(asset.marketCap)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
