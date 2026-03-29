export type RootStackParamList = {
  Products: undefined;
  ProductDetail: { productId: string };
  Cart: undefined;
  Checkout: undefined;
};

/** Route name constants — keep in sync with {@link RootStackParamList} (compiler-enforced). */
export const Screens = {
  Products: 'Products',
  ProductDetail: 'ProductDetail',
  Cart: 'Cart',
  Checkout: 'Checkout',
} as const satisfies { [K in keyof RootStackParamList]: K };

export type ScreenName = (typeof Screens)[keyof typeof Screens];

/** Default stack header titles — one per route in {@link RootStackParamList}. */
export const ScreenTitles = {
  Products: 'Products',
  ProductDetail: 'Details',
  Cart: 'Cart',
  Checkout: 'Checkout',
} as const satisfies Record<keyof RootStackParamList, string>;
