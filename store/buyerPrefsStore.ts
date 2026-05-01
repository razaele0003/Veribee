import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage, persist } from 'zustand/middleware';

export const BUYER_LOCATIONS = [
  'Metro Manila',
  'Cebu City',
  'Davao City',
  'Iloilo City',
  'Baguio City',
] as const;

export type BuyerLocation = (typeof BUYER_LOCATIONS)[number];

type BuyerPrefsState = {
  savedProductIds: string[];
  location: BuyerLocation;
  toggleSavedProduct: (productId: string) => void;
  isSaved: (productId: string) => boolean;
  setLocation: (location: BuyerLocation) => void;
};

export const useBuyerPrefsStore = create<BuyerPrefsState>()(
  persist(
    (set, get) => ({
      savedProductIds: [],
      location: 'Metro Manila',
      toggleSavedProduct: (productId) =>
        set((state) => ({
          savedProductIds: state.savedProductIds.includes(productId)
            ? state.savedProductIds.filter((id) => id !== productId)
            : [...state.savedProductIds, productId],
        })),
      isSaved: (productId) => get().savedProductIds.includes(productId),
      setLocation: (location) => set({ location }),
    }),
    {
      name: 'veribee-buyer-prefs',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
