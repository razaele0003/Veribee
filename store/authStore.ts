import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type Role = 'buyer' | 'seller' | 'rider';

type AuthState = {
  userId: string | null;
  activeRole: Role | null;
  roles: Role[];
  setUser: (userId: string | null) => void;
  setActiveRole: (role: Role | null) => void;
  setRoles: (roles: Role[]) => void;
  reset: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userId: null,
      activeRole: null,
      roles: [],
      setUser: (userId) => set({ userId }),
      setActiveRole: (activeRole) => set({ activeRole }),
      setRoles: (roles) => set({ roles }),
      reset: () => set({ userId: null, activeRole: null, roles: [] }),
    }),
    {
      name: 'veribee-auth',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
