import { create } from 'zustand';
import { ProductImages } from '@/constants/productImages';

export type ProductDraft = {
  photos: string[];
  title: string;
  category: string;
  price: string;
  description: string;
  serialNumber: string;
  brand: string;
  model: string;
  evidencePhotos: string[];
};

export type LocalProduct = ProductDraft & {
  id: string;
  submittedAt: string;
  authStatus: 'verified' | 'pending' | 'failed';
  authScore: number;
  reviewerNotes?: string;
};

type SellerState = {
  productDraft: ProductDraft;
  products: LocalProduct[];
  updateProductDraft: (patch: Partial<ProductDraft>) => void;
  clearProductDraft: () => void;
  addProductFromDraft: (status?: LocalProduct['authStatus']) => LocalProduct;
  removeProduct: (id: string) => void;
  updateProduct: (id: string, patch: Partial<ProductDraft>) => void;
};

const emptyProductDraft: ProductDraft = {
  photos: [],
  title: '',
  category: '',
  price: '',
  description: '',
  serialNumber: '',
  brand: '',
  model: '',
  evidencePhotos: [],
};

const initialProducts: LocalProduct[] = [
  {
    id: 'sample-watch-001',
    photos: [ProductImages.watch],
    title: 'Series 9 Chronograph Smartwatch',
    category: 'Electronics',
    price: '18500',
    description:
      'Premium smartwatch with verified serial details, clean casing, and leather band. High-value handover requires OTP and biometric confirmation.',
    serialNumber: 'VT-S9-2026-000184',
    brand: 'VeriTime',
    model: 'Series 9 Chronograph',
    evidencePhotos: [ProductImages.watch],
    submittedAt: '2026-04-20T08:30:00.000Z',
    authStatus: 'verified',
    authScore: 97,
  },
  {
    id: 'sample-tote-001',
    photos: [ProductImages.tote],
    title: 'Classic Artisan Leather Tote',
    category: 'Bags',
    price: '12990',
    description:
      'Structured leather tote with interior label, stitching, and receipt evidence. Seller history supports the authenticity score.',
    serialNumber: 'MA-TOTE-MM-042026-77',
    brand: 'Maison Aurelia',
    model: 'Classic Artisan Tote MM',
    evidencePhotos: [ProductImages.tote],
    submittedAt: '2026-04-21T09:15:00.000Z',
    authStatus: 'verified',
    authScore: 96,
  },
  {
    id: 'sample-sneakers-001',
    photos: [ProductImages.sneakers],
    title: 'Limited Edition Urban Kicks',
    category: 'Shoes',
    price: '8450',
    description:
      'Limited edition sneakers with box label OCR, insole stitching evidence, and outsole pattern review.',
    serialNumber: 'NK-UK-LE-840221-PH',
    brand: 'Nike',
    model: 'Urban Kicks Limited Edition',
    evidencePhotos: [ProductImages.sneakers],
    submittedAt: '2026-04-22T11:00:00.000Z',
    authStatus: 'verified',
    authScore: 93,
  },
  {
    id: 'sample-wallet-001',
    photos: [ProductImages.tote],
    title: 'Monogram Canvas Wallet',
    category: 'Bags',
    price: '6900',
    description:
      'Compact wallet pending final authentication. The label image needs a sharper macro photo before buyer checkout.',
    serialNumber: 'MA-WLT-CZ-2026-118',
    brand: 'Maison Aurelia',
    model: 'Compact Zip Wallet',
    evidencePhotos: [ProductImages.tote],
    submittedAt: '2026-04-23T10:40:00.000Z',
    authStatus: 'pending',
    authScore: 71,
    reviewerNotes:
      'Initial evidence is readable, but the label photo is too soft for final AI scanner confidence.',
  },
  {
    id: 'sample-rejected-001',
    photos: [ProductImages.pendant],
    title: 'Logo Label Pendant',
    category: 'Jewelry',
    price: '3900',
    description:
      'Pendant listing held back because the uploaded hallmark and declared model do not match.',
    serialNumber: 'HJ-UNK-2026-441',
    brand: 'Heirloom Jewels',
    model: 'Logo Label Pendant',
    evidencePhotos: [ProductImages.pendant],
    submittedAt: '2026-04-24T14:20:00.000Z',
    authStatus: 'failed',
    authScore: 42,
    reviewerNotes:
      'Hallmark photo and declared model conflict. Upload clearer hallmark proof or revise the product details.',
  },
];

export const useSellerStore = create<SellerState>((set, get) => ({
  productDraft: emptyProductDraft,
  products: initialProducts,
  updateProductDraft: (patch) =>
    set((state) => ({
      productDraft: { ...state.productDraft, ...patch },
    })),
  clearProductDraft: () => set({ productDraft: emptyProductDraft }),
  addProductFromDraft: (status = 'verified') => {
    const product: LocalProduct = {
      ...emptyProductDraft,
      ...get().productDraft,
      id: `local-product-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      authStatus: status,
      authScore: status === 'verified' ? 96 : 42,
      reviewerNotes:
        status === 'failed'
          ? 'The serial number provided does not match the submitted brand. Please verify and resubmit.'
          : undefined,
    };

    set((state) => ({
      products: [product, ...state.products],
      productDraft: emptyProductDraft,
    }));

    return product;
  },
  removeProduct: (id) =>
    set((state) => ({
      products: state.products.filter((product) => product.id !== id),
    })),
  updateProduct: (id, patch) =>
    set((state) => ({
      products: state.products.map((product) =>
        product.id === id ? { ...product, ...patch } : product,
      ),
    })),
}));
