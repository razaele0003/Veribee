export type DemoCoordinate = {
  label: string;
  address: string;
  latitude: number;
  longitude: number;
};

export { makeOpenStreetMapDirectionsUrl } from '@/lib/maps';

export const DEMO_PASSWORD = 'VeribeeTest123!';
export const DEMO_OTP = '123456';

export const DEMO_ACCOUNTS = {
  seller: {
    id: 'local-seller',
    role: 'seller',
    fullName: 'Maria Santos',
    storeName: 'LuxeGoods Manila',
    phone: '+639171234501',
    email: 'maria.santos@veribee.demo',
    location: 'Makati City, Metro Manila',
    verifiedSince: '2026-02-12',
    vsiScore: 96,
    coordinate: {
      label: 'LuxeGoods Manila pickup',
      address: 'Unit 14B, Salcedo Market Tower, Makati City',
      latitude: 14.5608,
      longitude: 121.0244,
    },
  },
  buyer: {
    id: 'local-buyer',
    role: 'buyer',
    fullName: 'David Kim',
    phone: '+639171234502',
    email: 'david.kim@veribee.demo',
    location: 'Bonifacio Global City, Taguig',
    verifiedSince: '2026-03-05',
    coordinate: {
      label: 'David Kim delivery',
      address: '45 Hive Avenue, BGC, Taguig City',
      latitude: 14.5503,
      longitude: 121.0518,
    },
  },
  rider: {
    id: 'local-rider',
    role: 'rider',
    fullName: 'Angelo Reyes',
    phone: '+639171234503',
    email: 'angelo.reyes@veribee.demo',
    location: 'Mandaluyong City, Metro Manila',
    verifiedSince: '2026-01-20',
    rating: 4.9,
    vehicle: 'Honda Click 125i',
    plate: 'ABC 1234',
    coordinate: {
      label: 'Angelo Reyes start',
      address: '123 Sampaguita Street, Mandaluyong City',
      latitude: 14.5794,
      longitude: 121.0359,
    },
  },
} as const;

export const DEMO_ROUTE = {
  orderId: 'VB-9982',
  deliveryId: 'delivery-vb-9982',
  productId: 'bag-001',
  productName: 'Classic Artisan Leather Tote',
  category: 'Bags',
  price: 12990,
  authScore: 96,
  handoverMethod: 'OTP',
  pickup: DEMO_ACCOUNTS.seller.coordinate,
  dropoff: DEMO_ACCOUNTS.buyer.coordinate,
  riderStart: DEMO_ACCOUNTS.rider.coordinate,
  distanceKm: 3.2,
  etaMinutes: 12,
  jobFee: 85,
  otpCode: DEMO_OTP,
} as const;
