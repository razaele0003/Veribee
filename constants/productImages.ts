import type { ImageSourcePropType } from 'react-native';

export type ProductImageSource = ImageSourcePropType | string;

export function resolveImageSource(source?: ProductImageSource) {
  if (!source) return undefined;
  return typeof source === 'string' ? { uri: source } : source;
}

export const ProductImages = {
  watch: require('../assets/images/product-watch.png'),
  tote: require('../assets/images/product-tote.png'),
  sneakers: require('../assets/images/product-sneakers.png'),
  pendant: require('../assets/images/product-pendant.png'),
  headphones: require('../assets/images/product-headphones.png'),
} as const satisfies Record<string, ProductImageSource>;

export const CategoryImages = {
  electronics: require('../assets/images/category-electronics.png'),
  bags: require('../assets/images/category-bags.png'),
  shoes: require('../assets/images/category-shoes.png'),
  jewelry: require('../assets/images/category-jewelry.png'),
} as const satisfies Record<string, ProductImageSource>;
