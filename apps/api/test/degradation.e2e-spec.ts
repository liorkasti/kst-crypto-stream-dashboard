import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { PrismaClient } from '@prisma/client';
import { pricesResponseSchema } from '@kin/shared';
import { AppModule } from '../src/app.module';
import { truncateAll, seedStaleSnapshot } from './helpers/db';

// Proves the brief's headline resilience requirement: when upstream is
// down, the API keeps serving last-known-good data with stale:true —
// never an error, never an empty body. SIMULATE_UPSTREAM_DOWN=true is
// forced on for this whole file via test/setup-e2e.ts.
describe('Graceful degradation (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaClient;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    prisma = new PrismaClient();
    await truncateAll(prisma);
    await seedStaleSnapshot(prisma);
  });

  afterAll(async () => {
    await truncateAll(prisma);
    await prisma.$disconnect();
    await app.close();
  });

  it('serves last-known-good data with stale:true when upstream is down', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/prices')
      .expect(200);

    // Parsing through the shared contract schema (not just asserting on
    // res.body directly) gives real types instead of `any`, and doubles
    // as a check that the response actually matches the frontend's contract.
    const body = pricesResponseSchema.parse(res.body);

    expect(body.stale).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data[0].symbol).toBe('btc');
  });
});
