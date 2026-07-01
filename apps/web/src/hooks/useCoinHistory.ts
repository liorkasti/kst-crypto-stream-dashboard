import { useQuery } from '@tanstack/react-query'
import type { HistoryQuery } from '@kin/shared'
import { fetchHistory } from '@/api/client'

export function useCoinHistory(assetId: string | null, window: HistoryQuery['window'] = '1h') {
  return useQuery({
    queryKey: ['history', assetId, window],
    queryFn: () => fetchHistory(assetId as string, window),
    enabled: Boolean(assetId),
  })
}
