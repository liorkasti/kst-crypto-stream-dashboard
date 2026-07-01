import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { PricesModule } from './prices/prices.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [ScheduleModule.forRoot(), PrismaModule, PricesModule, HealthModule],
})
export class AppModule {}
