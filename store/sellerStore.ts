import { create } from 'zustand';

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

export const useSellerStore = create<SellerState>((set) => ({
  productDraft: emptyProductDraft,
  products: [],
  updateProductDraft: (patch) =>
    set((state) => ({
      productDraft: { ...state.productDraft, ...patch },
    })),
  clearProductDraft: () => set({ productDraft: emptyProductDraft }),
  addProductFromDraft: (status = 'verified') => {
    const product: LocalProduct = {
      ...emptyProductDraft,
      id: `local-product-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      authStatus: status,
      authScore: status === 'verified' ? 96 : 42,
      reviewerNotes:
        status === 'failed'
          ? 'The serial number provided does not match the submitted brand. Please verify and resubmit.'
          : undefined,
    };

    set((state) => {
      const nextProduct = {
        ...product,
        ...state.productDraft,
      };

      return {
        products: [nextProduct, ...state.products],
        productDraft: emptyProductDraft,
      };
    });

    return product;
  },
  removeProduct: (id) =>
    set((state) => ({
      products: state.products.filter((product) => product.id !== id),
    })),
}));
