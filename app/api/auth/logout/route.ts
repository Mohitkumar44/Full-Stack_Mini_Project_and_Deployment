import { ok } from '@/lib/api-utils';

export async function POST() {
  return ok({ message: 'Logged out' });
}
