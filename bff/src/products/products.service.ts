import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductDetailDto, ProductListItemDto } from './domain/product.types';
import { PRODUCT_SEED } from './seeds/product.seed';
import { InventoryStore } from '../inventory/inventory.store';

@Injectable()
export class ProductsService {
  constructor(private readonly inventory: InventoryStore) {
    this.inventory.initializeProducts(PRODUCT_SEED);
  }

  list(): ProductListItemDto[] {
    return this.inventory
      .listProducts()
      .map((p) => ({
        id: p.id,
        name: p.name,
        priceCents: p.priceCents,
        availableStock: this.inventory.availableToReserve(p.id),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  getById(id: string): ProductDetailDto {
    const p = this.inventory.getProduct(id);
    if (!p) {
      throw new NotFoundException({ code: 'PRODUCT_NOT_FOUND', message: 'Product not found.' });
    }
    return {
      id: p.id,
      name: p.name,
      description: p.description,
      priceCents: p.priceCents,
      availableStock: this.inventory.availableToReserve(p.id),
    };
  }
}
