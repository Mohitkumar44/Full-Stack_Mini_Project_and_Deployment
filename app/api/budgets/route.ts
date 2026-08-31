import { NextRequest } from 'next/server';
import { getUserClient, ok, fail } from '@/lib/api-utils';

export async function GET(req: NextRequest) {
  const ctx = await getUserClient(req);
  if (!ctx) return fail('Unauthorized', 401);
  const { client, user } = ctx;

  const { data, error } = await client
    .from('budgets')
    .select('*')
    .eq('user_id', user.id)
    .order('year', { ascending: false })
    .order('month', { ascending: false });

  if (error) return fail('Failed to load budgets', 500);
  return ok(data);
}

export async function POST(req: NextRequest) {
  const ctx = await getUserClient(req);
  if (!ctx) return fail('Unauthorized', 401);
  const { client, user } = ctx;

  try {
    const body = await req.json();
    const { month, year, amount } = body;

    if (!month || month < 1 || month > 12) return fail('Valid month is required', 400);
    if (!year) return fail('Year is required', 400);
    if (amount === undefined || Number(amount) < 0)
      return fail('Amount must be 0 or greater', 400);

    const { data, error } = await client
      .from('budgets')
      .upsert(
        {
          user_id: user.id,
          month: Number(month),
          year: Number(year),
          amount: Number(amount),
        },
        { onConflict: 'user_id,month,year' }
      )
      .select('*')
      .single();

    if (error) return fail('Failed to save budget', 500);
    return ok(data, 201);
  } catch {
    return fail('Invalid request', 400);
  }
}
