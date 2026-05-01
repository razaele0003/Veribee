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
    fullName: 'Camille Dizon',
    storeName: 'LuxeLane Manila',
    phone: '+639178642310',
    email: 'camille.dizon@luxelane.ph',
    location: 'Makati City, Metro Manila',
    verifiedSince: '2026-02-12',
    vsiScore: 96,
    coordinate: {
      label: 'LuxeLane Manila pickup',
      address: 'Unit 14B, Salcedo Market Tower, H.V. Dela Costa Street, Makati City',
      latitude: 14.5608,
      longitude: 121.0244,
    },
  },
  buyer: {
    id: 'local-buyer',
    role: 'buyer',
    fullName: 'Nico Villanueva',
    phone: '+639178642311',
    email: 'nico.villanueva@veribee.test',
    location: 'Bonifacio Global City, Taguig',
    verifiedSince: '2026-03-05',
    coordinate: {
      label: 'Nico Villanueva delivery',
      address: 'One Uptown Residence, 36th Street, Bonifacio Global City, Taguig City',
      latitude: 14.5503,
      longitude: 121.0518,
    },
  },
  rider: {
    id: 'local-rider',
    role: 'rider',
    fullName: 'Paolo Reyes',
    phone: '+639178642312',
    email: 'paolo.reyes@veribee.test',
    location: 'Mandaluyong City, Metro Manila',
    verifiedSince: '2026-01-20',
    rating: 4.9,
    vehicle: 'Honda Click 125i',
    plate: 'NCR 4821',
    coordinate: {
      label: 'Paolo Reyes start',
      address: 'Plainview Barangay Hall, Mandaluyong City',
      latitude: 14.5794,
      longitude: 121.0359,
    },
  },
} as const;

export const DEMO_ROUTE = {
  orderId: 'VB-9982',
  deliveryId: 'delivery-vb-9982',
  productId: 'bag-001',
  productName: 'Structured Leather Tote MM',
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
