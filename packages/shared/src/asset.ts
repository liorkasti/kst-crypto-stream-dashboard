import { z } from 'zod';

export const assetSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  name: z.string(),
  price: z.number(),
  change24h: z.number(),
  marketCap: z.number(),
  updatedAt: z.string(),
});
export type AssetDto = z.infer<typeof assetSchema>;

export const pricesResponseSchema = z.object({
  data: z.array(assetSchema),
  lastUpdatedAt: z.string().nullable(),
  stale: z.boolean(),
});
export type PricesResponse = z.infer<typeof pricesResponseSchema>;

export const pricePointSchema = z.object({
  price: z.number(),
  ts: z.string(),
});
export type PricePoint = z.infer<typeof pricePointSchema>;

export const historyQuerySchema = z.object({
  window: z.enum(['15m', '1h', '24h']).default('1h'),
});
export type HistoryQuery = z.infer<typeof historyQuerySchema>;

export const healthResponseSchema = z.object({
  status: z.enum(['ok', 'error']),
  db: z.boolean(),
});
export type HealthResponse = z.infer<typeof healthResponseSchema>;
