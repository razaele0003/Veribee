import { create } from 'zustand';
import { ProductImages } from '@/constants/productImages';

export type RiderJobStatus =
  | 'accepted'
  | 'heading_to_pickup'
  | 'arrived_pickup'
  | 'picked_up'
  | 'heading_to_buyer'
  | 'arrived_buyer'
  | 'delivered';

export type RiderJob = {
  id: string;
  orderId: string;
  productName: string;
  productImage: string;
  category: string;
  pickupAddress: string;
  deliveryAddress: string;
  buyerName: string;
  buyerPhone: string;
  sellerName: string;
  sellerPhone: string;
  distanceKm: number;
  etaMinutes: number;
  jobFee: number;
  otpCode: string;
};

export type ActiveDelivery = RiderJob & {
  deliveryId: string;
  status: RiderJobStatus;
  acceptedAt: string;
};

type RiderState = {
  isOnline: boolean;
  activeDelivery: ActiveDelivery | null;
  completedJobs: ActiveDelivery[];
  jobs: RiderJob[];
  todayEarnings: number;
  setOnline: (isOnline: boolean) => void;
  addJob: (job: RiderJob) => void;
  acceptJob: (jobId: string) => ActiveDelivery | null;
  declineJob: (jobId: string) => void;
  updateActiveStatus: (status: RiderJobStatus) => void;
  completeActiveDelivery: () => ActiveDelivery | null;
  clearActiveDelivery: () => void;
};

const initialJobs: RiderJob[] = [
  {
    id: 'job-8924',
    orderId: 'VB-8924',
    productName: 'Series 9 Chronograph Smartwatch',
    productImage: ProductImages.watch,
    category: 'Electronics',
    pickupAddress: '123 Bee St, Makati',
    deliveryAddress: '45 Hive Ave, BGC',
    buyerName: 'David Kim',
    buyerPhone: '+639171234502',
    sellerName: 'TechHaven PH',
    sellerPhone: '+639171234501',
    distanceKm: 3.2,
    etaMinutes: 12,
    jobFee: 85,
    otpCode: '123456',
  },
  {
    id: 'job-8925',
    orderId: 'VB-8925',
    productName: 'Classic Artisan Leather Tote',
    productImage: ProductImages.tote,
    category: 'Bags',
    pickupAddress: '88 Salcedo Village',
    deliveryAddress: 'Poblacion Hub',
    buyerName: 'Ana Cruz',
    buyerPhone: '+639171234504',
    sellerName: 'LuxeGoods Manila',
    sellerPhone: '+639171234505',
    distanceKm: 1.8,
    etaMinutes: 8,
    jobFee: 65,
    otpCode: '123456',
  },
  {
    id: 'job-8926',
    orderId: 'VB-8926',
    productName: '18k Gold Heritage Pendant',
    productImage: ProductImages.pendant,
    category: 'Jewelry',
    pickupAddress: 'Greenbelt 5 Concierge',
    deliveryAddress: 'Rockwell East Tower',
    buyerName: 'Mika Reyes',
    buyerPhone: '+639171234506',
    sellerName: 'Heirloom Jewels',
    sellerPhone: '+639171234507',
    distanceKm: 4.1,
    etaMinutes: 18,
    jobFee: 110,
    otpCode: '123456',
  },
];

export function formatRiderMoney(value: number) {
  return `PHP ${Math.round(value).toLocaleString('en-PH')}`;
}

export const useRiderStore = create<RiderState>((set, get) => ({
  isOnline: true,
  activeDelivery: null,
  completedJobs: [],
  jobs: initialJobs,
  todayEarnings: 340,
  setOnline: (isOnline) => set({ isOnline }),
  addJob: (job) =>
    set((state) => ({
      jobs: [job, ...state.jobs.filter((item) => item.id !== job.id)],
    })),
  acceptJob: (jobId) => {
    const job = get().jobs.find((item) => item.id === jobId);
    if (!job) return null;

    const activeDelivery: ActiveDelivery = {
      ...job,
      deliveryId: `delivery-${job.orderId.toLowerCase()}`,
      status: 'heading_to_pickup',
      acceptedAt: new Date().toISOString(),
    };

    set((state) => ({
      activeDelivery,
      jobs: state.jobs.filter((item) => item.id !== jobId),
    }));

    return activeDelivery;
  },
  declineJob: (jobId) =>
    set((state) => ({
      jobs: state.jobs.filter((item) => item.id !== jobId),
    })),
  updateActiveStatus: (status) =>
    set((state) => ({
      activeDelivery: state.activeDelivery
        ? { ...state.activeDelivery, status }
        : null,
    })),
  completeActiveDelivery: () => {
    const activeDelivery = get().activeDelivery;
    if (!activeDelivery) return null;

    const completed: ActiveDelivery = {
      ...activeDelivery,
      status: 'delivered',
    };

    set((state) => ({
      activeDelivery: null,
      completedJobs: [completed, ...state.completedJobs],
      todayEarnings: state.todayEarnings + completed.jobFee,
    }));

    return completed;
  },
  clearActiveDelivery: () => set({ activeDelivery: null }),
}));
