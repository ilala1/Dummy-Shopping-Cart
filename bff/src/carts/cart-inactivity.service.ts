import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { CartsService } from './carts.service';

const SWEEP_MS = 10_000;

@Injectable()
export class CartInactivityService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CartInactivityService.name);
  private handle: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly carts: CartsService) {}

  onModuleInit(): void {
    this.handle = setInterval(() => {
      const removed = this.carts.purgeStale();
      if (removed.length) {
        this.logger.debug(`Released reservations for expired carts: ${removed.join(', ')}`);
      }
    }, SWEEP_MS);
  }

  onModuleDestroy(): void {
    if (this.handle) {
      clearInterval(this.handle);
      this.handle = null;
    }
  }
}
