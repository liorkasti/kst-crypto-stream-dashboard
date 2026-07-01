import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().min(1),
  UPSTREAM_BASE_URL: z
    .string()
    .url()
    .default('https://api.coingecko.com/api/v3'),
  REFRESH_MS: z.coerce.number().default(15_000),
  STALE_THRESHOLD_MS: z.coerce.number().default(30_000),
  SIMULATE_UPSTREAM_DOWN: z
    .string()
    .default('false')
    .transform((v) => v === 'true'),
  WEB_ORIGIN: z.string().default('http://localhost:5173'),
});

export const env = envSchema.parse(process.env);
export type Env = z.infer<typeof envSchema>;
