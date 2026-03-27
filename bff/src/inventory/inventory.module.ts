import { Global, Module } from '@nestjs/common';
import { InventoryStore } from './inventory.store';

@Global()
@Module({
  providers: [InventoryStore],
  exports: [InventoryStore],
})
export class InventoryModule {}
