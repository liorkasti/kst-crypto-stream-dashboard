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
          <TableRow
            key={asset.id}
            onClick={() => onSelect(asset)}
            onKeyDown={(e) => {
              // Enter activates on keydown (native behavior); Space is
              // deliberately deferred to keyup below — firing it here would
              // repeat-select on every keydown auto-repeat while held.
              if (e.key === 'Enter') onSelect(asset)
              else if (e.key === ' ') e.preventDefault()
            }}
            onKeyUp={(e) => {
              if (e.key === ' ') onSelect(asset)
            }}
            tabIndex={0}
            role="button"
            className="cursor-pointer"
          >
            <TableCell className="font-medium">
              {asset.name} <span className="text-gray-400 uppercase">{asset.symbol}</span>
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
