import type { Role } from '@/store/authStore';
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from '@/lib/demoProfiles';

export type LocalTestAccount = {
  id: string;
  role: Role;
  phone: string;
  password: string;
  fullName: string;
  email: string;
  location: string;
  address: string;
  profileSummary: string;
  verifiedSince: string;
  demoNotes: string[];
};

export const LOCAL_OTP_CODE = '123456';

export const LOCAL_TEST_ACCOUNTS: LocalTestAccount[] = [
  {
    id: DEMO_ACCOUNTS.seller.id,
    role: 'seller',
    phone: DEMO_ACCOUNTS.seller.phone,
    password: DEMO_PASSWORD,
    fullName: DEMO_ACCOUNTS.seller.fullName,
    email: DEMO_ACCOUNTS.seller.email,
    location: DEMO_ACCOUNTS.seller.location,
    address: DEMO_ACCOUNTS.seller.coordinate.address,
    profileSummary: 'Trusted luxury resale seller focused on watches, bags, and authenticated accessories.',
    verifiedSince: DEMO_ACCOUNTS.seller.verifiedSince,
    demoNotes: [
      `Store name: ${DEMO_ACCOUNTS.seller.storeName}`,
      `VSI score: ${DEMO_ACCOUNTS.seller.vsiScore}`,
      'KYC complete with business permit and valid government ID',
    ],
  },
  {
    id: DEMO_ACCOUNTS.buyer.id,
    role: 'buyer',
    phone: DEMO_ACCOUNTS.buyer.phone,
    password: DEMO_PASSWORD,
    fullName: DEMO_ACCOUNTS.buyer.fullName,
    email: DEMO_ACCOUNTS.buyer.email,
    location: DEMO_ACCOUNTS.buyer.location,
    address: DEMO_ACCOUNTS.buyer.coordinate.address,
    profileSummary: 'High-value buyer testing verified delivery, OTP handover, and saved products.',
    verifiedSince: DEMO_ACCOUNTS.buyer.verifiedSince,
    demoNotes: [
      'Preferred payment: Cash on verified handover',
      'Default delivery window: 6:00 PM to 9:00 PM',
      'Requires OTP for orders above PHP 10,000',
    ],
  },
  {
    id: DEMO_ACCOUNTS.rider.id,
    role: 'rider',
    phone: DEMO_ACCOUNTS.rider.phone,
    password: DEMO_PASSWORD,
    fullName: DEMO_ACCOUNTS.rider.fullName,
    email: DEMO_ACCOUNTS.rider.email,
    location: DEMO_ACCOUNTS.rider.location,
    address: DEMO_ACCOUNTS.rider.coordinate.address,
    profileSummary: 'Verified rider assigned to secure pickup, route tracking, and OTP/biometric handover.',
    verifiedSince: DEMO_ACCOUNTS.rider.verifiedSince,
    demoNotes: [
      `Vehicle: ${DEMO_ACCOUNTS.rider.vehicle}, plate ${DEMO_ACCOUNTS.rider.plate}`,
      `Delivery rating: ${DEMO_ACCOUNTS.rider.rating}`,
      'KYC complete with driver license and OR/CR',
    ],
  },
];

export function toLocalPhoneDigits(value: string) {
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('63')) digits = digits.slice(2);
  if (digits.startsWith('0')) digits = digits.slice(1);
  return digits.slice(0, 10);
}

export function toLocalPhone(value: string) {
  return `+63${toLocalPhoneDigits(value)}`;
}

export function findLocalAccountByPhone(phoneDigits: string) {
  const phone = toLocalPhone(phoneDigits);
  return LOCAL_TEST_ACCOUNTS.find((account) => account.phone === phone);
}

export function findLocalAccount(phoneDigits: string, password: string) {
  const account = findLocalAccountByPhone(phoneDigits);
  return account?.password === password ? account : undefined;
}

export function makeLocalUserId(phone: string) {
  return `local-${toLocalPhone(phone).replace(/\D/g, '')}`;
}

export function isLocalUserId(userId?: string | null) {
  return !!userId && userId.startsWith('local-');
}
