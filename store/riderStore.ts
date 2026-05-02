import { create } from 'zustand';
import { ProductImageSource, ProductImages } from '@/constants/productImages';
import { DEMO_ACCOUNTS, DEMO_ROUTE } from '@/lib/demoProfiles';

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
  productImage: ProductImageSource;
  category: string;
  pickupAddress: string;
  deliveryAddress: string;
  pickupLatitude?: number;
  pickupLongitude?: number;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  riderStartLatitude?: number;
  riderStartLongitude?: number;
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
    orderId: DEMO_ROUTE.orderId,
    productName: DEMO_ROUTE.productName,
    productImage: ProductImages.tote,
    category: DEMO_ROUTE.category,
    pickupAddress: DEMO_ROUTE.pickup.address,
    deliveryAddress: DEMO_ROUTE.dropoff.address,
    pickupLatitude: DEMO_ROUTE.pickup.latitude,
    pickupLongitude: DEMO_ROUTE.pickup.longitude,
    deliveryLatitude: DEMO_ROUTE.dropoff.latitude,
    deliveryLongitude: DEMO_ROUTE.dropoff.longitude,
    riderStartLatitude: DEMO_ROUTE.riderStart.latitude,
    riderStartLongitude: DEMO_ROUTE.riderStart.longitude,
    buyerName: DEMO_ACCOUNTS.buyer.fullName,
    buyerPhone: DEMO_ACCOUNTS.buyer.phone,
    sellerName: DEMO_ACCOUNTS.seller.storeName,
    sellerPhone: DEMO_ACCOUNTS.seller.phone,
    distanceKm: DEMO_ROUTE.distanceKm,
    etaMinutes: DEMO_ROUTE.etaMinutes,
    jobFee: DEMO_ROUTE.jobFee,
    otpCode: DEMO_ROUTE.otpCode,
  },
  {
    id: 'job-8925',
    orderId: 'VB-8925',
    productName: 'Canvas City Tote PM',
    productImage: ProductImages.tote,
    category: 'Bags',
    pickupAddress: '88 Salcedo Village, Makati City',
    deliveryAddress: 'Poblacion Community Hub, Makati City',
    buyerName: 'Ana Cruz',
    buyerPhone: '+639178642313',
    sellerName: 'LuxeLane Manila',
    sellerPhone: DEMO_ACCOUNTS.seller.phone,
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
    buyerName: 'Mika Tan',
    buyerPhone: '+639178642314',
    sellerName: 'Heirloom Jewels',
    sellerPhone: '+639178642315',
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
