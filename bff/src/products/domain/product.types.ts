export interface ProductRecord {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  /** Physical units on hand (decrements after successful checkout). */
  stock: number;
}

export interface ProductListItemDto {
  id: string;
  name: string;
  priceCents: number;
  /** Units not reserved by any cart (browse-time availability). */
  availableStock: number;
}

export interface ProductDetailDto extends ProductListItemDto {
  description: string;
}
