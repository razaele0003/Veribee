import type { Role } from '@/store/authStore';

export type LocalTestAccount = {
  id: string;
  role: Role;
  phone: string;
  password: string;
  fullName: string;
};

export const LOCAL_OTP_CODE = '123456';

export const LOCAL_TEST_ACCOUNTS: LocalTestAccount[] = [
  {
    id: 'local-seller',
    role: 'seller',
    phone: '+639171234501',
    password: 'VeribeeTest123!',
    fullName: 'Maria Santos',
  },
  {
    id: 'local-buyer',
    role: 'buyer',
    phone: '+639171234502',
    password: 'VeribeeTest123!',
    fullName: 'David Kim',
  },
  {
    id: 'local-rider',
    role: 'rider',
    phone: '+639171234503',
    password: 'VeribeeTest123!',
    fullName: 'Leo Reyes',
  },
];

export function toLocalPhone(value: string) {
  const digits = value.replace(/\D/g, '');
  if (digits.startsWith('63')) return `+${digits.slice(0, 12)}`;
  return `+63${digits.slice(0, 10)}`;
}

export function findLocalAccount(phoneDigits: string, password: string) {
  const phone = toLocalPhone(phoneDigits);
  return LOCAL_TEST_ACCOUNTS.find(
    (account) => account.phone === phone && account.password === password,
  );
}

export function makeLocalUserId(phone: string) {
  return `local-${toLocalPhone(phone).replace(/\D/g, '')}`;
}

export function isLocalUserId(userId?: string | null) {
  return !!userId && userId.startsWith('local-');
}
