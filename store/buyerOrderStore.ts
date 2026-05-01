import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { BuyerOrder } from '@/lib/buyerData';
import { CartItem } from '@/store/cartStore';

type BuyerOrderState = {
  orders: BuyerOrder[];
  placeLocalOrder: (items: CartItem[], total: number) => BuyerOrder | null;
  markDisputed: (orderId: string) => void;
};

function makeOrderId() {
  return `VB-${Math.floor(1000 + Math.random() * 9000)}`;
}

function formatOrderDate() {
  return new Intl.DateTimeFormat('en-PH', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());
}

export const useBuyerOrderStore = create<BuyerOrderState>()(
  persist(
    (set) => ({
      orders: [],
      placeLocalOrder: (items, total) => {
        const first = items[0];
        if (!first) return null;

        const order: BuyerOrder = {
          id: makeOrderId(),
          productId: first.productId,
          productTitle:
            items.length === 1 ? first.title : `${first.title} +${items.length - 1} more`,
          sellerName: first.sellerName,
          orderedAt: formatOrderDate(),
          price: total,
          status: 'processing',
        };

        set((state) => ({ orders: [order, ...state.orders] }));
        return order;
      },
      markDisputed: (orderId) =>
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId ? { ...order, status: 'disputed' } : order,
          ),
        })),
    }),
    {
      name: 'veribee-buyer-orders',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
