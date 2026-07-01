import { Controller, Get } from '@nestjs/common';
import type { HealthResponse } from '@kin/shared';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check(): Promise<HealthResponse> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', db: true };
    } catch {
      return { status: 'error', db: false };
    }
  }
}
