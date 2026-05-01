import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage, persist } from 'zustand/middleware';

export type CartItem = {
  productId: string;
  title: string;
  price: number;
  sellerId: string;
  sellerName: string;
  imageUrl?: string;
  quantity: number;
  authStatus: 'verified' | 'pending';
  selected?: boolean;
};

type CartState = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  toggleSelection: (productId: string) => void;
  clearCart: () => void;
  totalPrice: () => number;
  authFee: () => number;
  deliveryFee: () => number;
  grandTotal: () => number;
};

const DELIVERY_FEE = 85;
const AUTH_FEE = 50;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (cartItem) => cartItem.productId === item.productId,
          );
          if (existing) {
            return {
              items: state.items.map((cartItem) =>
                cartItem.productId === item.productId
                  ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
                  : cartItem,
              ),
            };
          }
          return { items: [...state.items, { ...item, selected: true }] };
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        })),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((item) => item.productId !== productId)
              : state.items.map((item) =>
                  item.productId === productId ? { ...item, quantity } : item,
                ),
        })),
      toggleSelection: (productId) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId ? { ...item, selected: !item.selected } : item,
          ),
        })),
      clearCart: () => set({ items: [] }),
      totalPrice: () =>
        get().items.reduce((total, item) => total + item.price * item.quantity, 0),
      authFee: () =>
        get().items.reduce(
          (total, item) =>
            total + (item.authStatus === 'verified' ? AUTH_FEE * item.quantity : 0),
          0,
        ),
      deliveryFee: () => (get().items.length > 0 ? DELIVERY_FEE : 0),
      grandTotal: () => get().totalPrice() + get().authFee() + get().deliveryFee(),
    }),
    {
      name: 'veribee-cart',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
