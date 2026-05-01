import type { Role } from '@/store/authStore';

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
    id: 'local-seller',
    role: 'seller',
    phone: '+639171234501',
    password: 'VeribeeTest123!',
    fullName: 'Maria Santos',
    email: 'maria.santos@veribee.demo',
    location: 'Makati City, Metro Manila',
    address: 'Unit 14B, Salcedo Market Tower, Makati City',
    profileSummary: 'Trusted luxury resale seller focused on watches, bags, and authenticated accessories.',
    verifiedSince: '2026-02-12',
    demoNotes: [
      'Store name: LuxeGoods Manila',
      'VSI score: 96',
      'KYC complete with business permit and valid government ID',
    ],
  },
  {
    id: 'local-buyer',
    role: 'buyer',
    phone: '+639171234502',
    password: 'VeribeeTest123!',
    fullName: 'David Kim',
    email: 'david.kim@veribee.demo',
    location: 'Bonifacio Global City, Taguig',
    address: '45 Hive Avenue, BGC, Taguig City',
    profileSummary: 'High-value buyer testing verified delivery, OTP handover, and saved products.',
    verifiedSince: '2026-03-05',
    demoNotes: [
      'Preferred payment: Cash on verified handover',
      'Default delivery window: 6:00 PM to 9:00 PM',
      'Requires OTP for orders above PHP 10,000',
    ],
  },
  {
    id: 'local-rider',
    role: 'rider',
    phone: '+639171234503',
    password: 'VeribeeTest123!',
    fullName: 'Angelo Reyes',
    email: 'angelo.reyes@veribee.demo',
    location: 'Mandaluyong City, Metro Manila',
    address: '123 Sampaguita Street, Mandaluyong City',
    profileSummary: 'Verified rider assigned to secure pickup, route tracking, and OTP/biometric handover.',
    verifiedSince: '2026-01-20',
    demoNotes: [
      'Vehicle: Honda Click 125i, plate ABC 1234',
      'Delivery rating: 4.9',
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
