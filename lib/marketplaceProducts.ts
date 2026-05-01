import { BuyerProduct } from '@/lib/buyerData';
import { LocalProduct } from '@/store/sellerStore';

export function sellerProductToBuyerProduct(product: LocalProduct): BuyerProduct {
  return {
    id: product.id,
    title: product.title || 'Untitled product',
    category: product.category || 'Other',
    price: Number(product.price || 0),
    sellerId: 'local-seller',
    sellerName: "Maria's Boutique",
    sellerVsi: 87,
    imageUrl: product.photos[0],
    authStatus: product.authStatus === 'verified' ? 'verified' : 'pending',
    description: product.description || 'Seller-submitted Veribee listing.',
  };
}

export function supabaseProductToBuyerProduct(row: any): BuyerProduct {
  const seller = Array.isArray(row.seller) ? row.seller[0] : row.seller;
  return {
    id: String(row.id),
    title: String(row.title ?? 'Verified product'),
    category: String(row.category ?? 'Other'),
    price: Number(row.price ?? 0),
    sellerId: String(row.seller_id ?? seller?.id ?? 'seller'),
    sellerName: String(seller?.full_name ?? seller?.store_name ?? 'Veribee Seller'),
    sellerVsi: Number(seller?.vsi_score ?? 87),
    imageUrl: Array.isArray(row.images) ? row.images[0] : undefined,
    authStatus: 'verified',
    description: String(row.description ?? 'Verified product on Veribee.'),
  };
}
