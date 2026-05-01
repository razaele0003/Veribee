import { BuyerProduct } from '@/lib/buyerData';
import { DEMO_ACCOUNTS } from '@/lib/demoProfiles';
import { LocalProduct } from '@/store/sellerStore';

export function sellerProductToBuyerProduct(product: LocalProduct): BuyerProduct {
  return {
    id: product.id,
    title: product.title || 'Untitled product',
    category: product.category || 'Other',
    price: Number(product.price || 0),
    sellerId: DEMO_ACCOUNTS.seller.id,
    sellerName: DEMO_ACCOUNTS.seller.storeName,
    sellerVsi: DEMO_ACCOUNTS.seller.vsiScore,
    imageUrl: product.photos[0],
    authStatus: product.authStatus === 'verified' ? 'verified' : 'pending',
    description: product.description || 'Seller-submitted Veribee listing.',
    brand: product.brand || 'Seller submitted',
    model: product.model || 'Unspecified model',
    condition: 'Excellent',
    serialNumber: product.serialNumber || 'Pending serial review',
    authScore: product.authScore,
    authenticatedAt:
      product.authStatus === 'verified'
        ? new Date(product.submittedAt).toLocaleDateString('en-PH', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })
        : 'Pending review',
    aiScannerResult:
      product.authStatus === 'verified'
        ? 'Seller evidence, serial details, and image signals passed the local Veribee demo checks.'
        : product.reviewerNotes ?? 'Authentication is still being reviewed.',
    evidence: [
      'Product photos',
      'Serial number',
      'Seller KYC status',
      'Uploaded evidence photos',
    ],
    handoverMethod: Number(product.price || 0) >= 10000 ? 'Biometric + OTP' : 'OTP',
    warrantyNote: 'Covered by the Veribee demo authenticity report.',
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
    brand: String(row.brand ?? 'Verified brand'),
    model: String(row.model ?? 'Verified model'),
    condition: 'Excellent',
    serialNumber: String(row.serial_number ?? 'Verified by seller evidence'),
    authScore: Number(row.auth_score ?? 94),
    authenticatedAt: 'Verified',
    aiScannerResult:
      'Live listing passed Veribee seller, serial, and image evidence checks.',
    evidence: ['Seller KYC', 'Product images', 'Serial evidence'],
    handoverMethod: Number(row.price ?? 0) >= 10000 ? 'Biometric + OTP' : 'OTP',
    warrantyNote: 'Covered by Veribee verified delivery documentation.',
  };
}
