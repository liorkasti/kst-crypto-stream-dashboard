import { Test } from '@nestjs/testing';
import { PricesService } from './prices.service';
import { PrismaService } from '../prisma/prisma.service';
import { env } from '../config/env';

describe('PricesService — staleness computation', () => {
  let service: PricesService;
  let prisma: {
    asset: { findMany: jest.Mock };
    refreshMeta: { findUnique: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      asset: { findMany: jest.fn().mockResolvedValue([]) },
      refreshMeta: { findUnique: jest.fn() },
    };

    const module = await Test.createTestingModule({
      providers: [PricesService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(PricesService);
  });

  it('is stale once lastSuccessAt is older than STALE_THRESHOLD_MS', async () => {
    prisma.refreshMeta.findUnique.mockResolvedValue({
      id: 1,
      lastSuccessAt: new Date(Date.now() - env.STALE_THRESHOLD_MS - 1_000),
    });

    const result = await service.getLatest();

    expect(result.stale).toBe(true);
  });

  it('is fresh while lastSuccessAt is within STALE_THRESHOLD_MS', async () => {
    prisma.refreshMeta.findUnique.mockResolvedValue({
      id: 1,
      lastSuccessAt: new Date(Date.now() - 1_000),
    });

    const result = await service.getLatest();

    expect(result.stale).toBe(false);
  });

  it('is stale when no refresh has ever succeeded', async () => {
    prisma.refreshMeta.findUnique.mockResolvedValue(null);

    const result = await service.getLatest();

    expect(result.stale).toBe(true);
    expect(result.lastUpdatedAt).toBeNull();
  });
});
