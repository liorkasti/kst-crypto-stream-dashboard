import { Injectable } from '@nestjs/common';
import { Subject, interval, merge } from 'rxjs';

@Injectable()
export class PricesStream {
  private readonly ticks$ = new Subject<void>();

  // Refresh-driven ticks + a 5s heartbeat so the client's staleness view
  // re-evaluates even during an upstream outage (no new refresh to trigger it).
  readonly events$ = merge(this.ticks$, interval(5_000));

  notify(): void {
    this.ticks$.next();
  }
}
