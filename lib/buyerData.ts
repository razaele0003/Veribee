import { ProductImages } from '@/constants/productImages';

export type BuyerProduct = {
  id: string;
  title: string;
  category: string;
  price: number;
  sellerId: string;
  sellerName: string;
  sellerVsi: number;
  imageUrl?: string;
  authStatus: 'verified' | 'pending';
  description: string;
};

export type BuyerOrder = {
  id: string;
  productId: string;
  productTitle: string;
  sellerName: string;
  orderedAt: string;
  price: number;
  status: 'processing' | 'in_transit' | 'delivered' | 'disputed';
};

export const BUYER_PRODUCTS: BuyerProduct[] = [
  {
    id: 'watch-001',
    title: 'Series 9 Chronograph Smartwatch',
    category: 'Electronics',
    price: 18500,
    sellerId: 'seller-techhaven',
    sellerName: 'TechHaven PH',
    sellerVsi: 98,
    imageUrl: ProductImages.watch,
    authStatus: 'verified',
    description:
      'A premium smartwatch with verified serial details, clean casing, and a leather band ready for daily wear.',
  },
  {
    id: 'bag-001',
    title: 'Classic Artisan Leather Tote',
    category: 'Bags',
    price: 12990,
    sellerId: 'seller-luxegoods',
    sellerName: 'LuxeGoods Manila',
    sellerVsi: 95,
    imageUrl: ProductImages.tote,
    authStatus: 'verified',
    description:
      'A structured artisan leather tote with warm tone, careful stitching, and Veribee authentication evidence.',
  },
  {
    id: 'shoes-001',
    title: 'Limited Edition Urban Kicks',
    category: 'Shoes',
    price: 8450,
    sellerId: 'seller-sole',
    sellerName: 'SoleAuthentic',
    sellerVsi: 92,
    imageUrl: ProductImages.sneakers,
    authStatus: 'verified',
    description:
      'Rare designer sneakers in excellent condition, verified through photos, labels, and seller history.',
  },
  {
    id: 'jewelry-001',
    title: '18k Gold Heritage Pendant',
    category: 'Jewelry',
    price: 24000,
    sellerId: 'seller-heirloom',
    sellerName: 'Heirloom Jewels',
    sellerVsi: 99,
    imageUrl: ProductImages.pendant,
    authStatus: 'verified',
    description:
      'A vintage-inspired gold pendant with provenance notes and strong authentication confidence.',
  },
];

export const BUYER_ORDERS: BuyerOrder[] = [
  {
    id: 'VB-9982',
    productId: 'bag-001',
    productTitle: 'Classic Artisan Leather Tote',
    sellerName: 'LuxeGoods Manila',
    orderedAt: 'April 20, 2026',
    price: 12990,
    status: 'in_transit',
  },
  {
    id: 'VB-9981',
    productId: 'watch-001',
    productTitle: 'Series 9 Chronograph Smartwatch',
    sellerName: 'TechHaven PH',
    orderedAt: 'April 18, 2026',
    price: 18500,
    status: 'delivered',
  },
  {
    id: 'VB-9978',
    productId: 'shoes-001',
    productTitle: 'Limited Edition Urban Kicks',
    sellerName: 'SoleAuthentic',
    orderedAt: 'April 14, 2026',
    price: 8450,
    status: 'processing',
  },
];

export function formatPHP(value: number) {
  return `PHP ${Math.round(value).toLocaleString('en-PH')}`;
}

export function findBuyerProduct(id?: string | string[]) {
  const productId = Array.isArray(id) ? id[0] : id;
  return BUYER_PRODUCTS.find((product) => product.id === productId) ?? BUYER_PRODUCTS[0];
}
