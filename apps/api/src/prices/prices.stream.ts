import { Injectable } from '@nestjs/common';
import { Subject, interval, merge, share } from 'rxjs';

@Injectable()
export class PricesStream {
  private readonly ticks$ = new Subject<void>();

  // Ticks + a 5s heartbeat (staleness re-evaluates during an outage too).
  // share() avoids a separate interval() timer per SSE connection.
  readonly events$ = merge(this.ticks$, interval(5_000)).pipe(share());

  notify(): void {
    this.ticks$.next();
  }
}
