import { Injectable } from '@nestjs/common';
import { Subject, interval, merge, share } from 'rxjs';

@Injectable()
export class PricesStream {
  private readonly ticks$ = new Subject<void>();

  // Refresh-driven ticks + a 5s heartbeat so the client's staleness view
  // re-evaluates even during an upstream outage (no new refresh to trigger it).
  // share() makes this one hot stream instead of a cold one — without it,
  // interval(5_000) would spin up a separate timer per SSE connection.
  readonly events$ = merge(this.ticks$, interval(5_000)).pipe(share());

  notify(): void {
    this.ticks$.next();
  }
}
