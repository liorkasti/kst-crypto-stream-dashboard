import { PrismaClient } from '@prisma/client';

export async function truncateAll(prisma: PrismaClient): Promise<void> {
  await prisma.priceHistory.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.refreshMeta.deleteMany();
}

// Already old enough to be stale — skips waiting out STALE_THRESHOLD_MS.
export async function seedStaleSnapshot(prisma: PrismaClient): Promise<void> {
  await prisma.asset.create({
    data: {
      symbol: 'btc',
      name: 'Bitcoin',
      price: 50_000,
      change24h: 1.5,
      marketCap: BigInt(1_000_000_000),
      updatedAt: new Date(),
    },
  });
  await prisma.refreshMeta.upsert({
    where: { id: 1 },
    create: { id: 1, lastSuccessAt: new Date(Date.now() - 3_600_000) },
    update: { lastSuccessAt: new Date(Date.now() - 3_600_000) },
  });
}
