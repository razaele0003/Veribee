import type { ImageSourcePropType } from 'react-native';

export type ProductImageSource = ImageSourcePropType | string;

export function resolveImageSource(source?: ProductImageSource) {
  if (!source) return undefined;
  return typeof source === 'string' ? { uri: source } : source;
}

export const ProductImages = {
  watch: require('../assets/images/product-watch-photo.jpg'),
  tote: require('../assets/images/product-tote-photo.jpg'),
  sneakers: require('../assets/images/product-sneakers-photo.jpg'),
  pendant: require('../assets/images/product-pendant-photo.jpg'),
  marketWatch: require('../assets/images/product-market-watch-photo.jpg'),
  headphones: require('../assets/images/product-headphones-photo.jpg'),
  chronograph: require('../assets/images/product-chronograph-photo.jpg'),
} as const satisfies Record<string, ProductImageSource>;

export const CategoryImages = {
  electronics: require('../assets/images/category-electronics-photo.jpg'),
  bags: require('../assets/images/category-bags-photo.jpg'),
  shoes: require('../assets/images/category-shoes-photo.jpg'),
  jewelry: require('../assets/images/category-jewelry-photo.jpg'),
} as const satisfies Record<string, ProductImageSource>;
