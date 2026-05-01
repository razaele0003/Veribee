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
  brand: string;
  model: string;
  condition: 'New' | 'Like New' | 'Excellent' | 'Good';
  serialNumber: string;
  authScore: number;
  authenticatedAt: string;
  aiScannerResult: string;
  evidence: string[];
  handoverMethod: 'OTP' | 'Biometric + OTP';
  warrantyNote: string;
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
    brand: 'VeriTime',
    model: 'Series 9 Chronograph',
    condition: 'Excellent',
    serialNumber: 'VT-S9-2026-000184',
    authScore: 97,
    authenticatedAt: 'April 20, 2026',
    aiScannerResult:
      'Serial format, crown engraving, case alignment, and product photo patterns match verified reference signals.',
    evidence: [
      'Serial number photo',
      'Back case macro image',
      'Purchase receipt scan',
      'Seller transaction history',
    ],
    handoverMethod: 'Biometric + OTP',
    warrantyNote: '7-day Veribee authenticity dispute window after confirmed handover.',
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
    brand: 'Maison Aurelia',
    model: 'Classic Artisan Tote MM',
    condition: 'Like New',
    serialNumber: 'MA-TOTE-MM-042026-77',
    authScore: 96,
    authenticatedAt: 'April 21, 2026',
    aiScannerResult:
      'Stitch spacing, heat stamp, material grain, and seller history are consistent with authentic references.',
    evidence: [
      'Interior label macro',
      'Stitching close-up',
      'Dust bag photo',
      'Original receipt upload',
    ],
    handoverMethod: 'OTP',
    warrantyNote: 'Eligible for Veribee assisted return if authenticity evidence is disputed.',
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
    brand: 'Nike',
    model: 'Urban Kicks Limited Edition',
    condition: 'Good',
    serialNumber: 'NK-UK-LE-840221-PH',
    authScore: 93,
    authenticatedAt: 'April 22, 2026',
    aiScannerResult:
      'Box label OCR, outsole pattern, stitching symmetry, and SKU structure passed the Veribee scanner.',
    evidence: [
      'Box label OCR result',
      'Insole stitching photo',
      'Outsole pattern photo',
      'Seller fulfillment record',
    ],
    handoverMethod: 'OTP',
    warrantyNote: 'Item is covered by Veribee verified delivery documentation.',
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
    brand: 'Heirloom Jewels',
    model: '18k Heritage Pendant',
    condition: 'Excellent',
    serialNumber: 'HJ-18K-HP-2026-019',
    authScore: 98,
    authenticatedAt: 'April 23, 2026',
    aiScannerResult:
      'Hallmark OCR, weight declaration, seller reputation, and provenance notes passed authenticity checks.',
    evidence: [
      'Hallmark macro photo',
      'Weight scale photo',
      'Provenance note',
      'Seller KYC and prior transaction signal',
    ],
    handoverMethod: 'Biometric + OTP',
    warrantyNote: 'High-value handover requires buyer OTP confirmation before release.',
    description:
      'A vintage-inspired gold pendant with provenance notes and strong authentication confidence.',
  },
  {
    id: 'bag-002',
    title: 'Monogram Canvas Wallet',
    category: 'Bags',
    price: 6900,
    sellerId: 'seller-luxegoods',
    sellerName: 'LuxeGoods Manila',
    sellerVsi: 95,
    imageUrl: ProductImages.tote,
    authStatus: 'pending',
    brand: 'Maison Aurelia',
    model: 'Compact Zip Wallet',
    condition: 'Good',
    serialNumber: 'MA-WLT-CZ-2026-118',
    authScore: 71,
    authenticatedAt: 'Pending review',
    aiScannerResult:
      'Initial photo set is readable, but the label image needs a sharper macro shot before final verification.',
    evidence: [
      'Exterior canvas photo',
      'Partial label photo',
      'Seller declaration',
    ],
    handoverMethod: 'OTP',
    warrantyNote: 'Pending items are hidden from checkout until authentication is complete.',
    description:
      'Compact wallet submitted for Veribee review. Additional proof is required before it becomes checkout-ready.',
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
