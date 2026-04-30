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
