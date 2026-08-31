import { NextRequest } from 'next/server';
import { getUserClient, ok, fail } from '@/lib/api-utils';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const ctx = await getUserClient(req);
  if (!ctx) return fail('Unauthorized', 401);
  const { client, user } = ctx;

  try {
    const body = await req.json();
    const { amount } = body;
    if (amount === undefined || Number(amount) < 0)
      return fail('Amount must be 0 or greater', 400);

    const { data, error } = await client
      .from('budgets')
      .update({ amount: Number(amount) })
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select('*')
      .maybeSingle();

    if (error) return fail('Failed to update budget', 500);
    if (!data) return fail('Budget not found', 404);
    return ok(data);
  } catch {
    return fail('Invalid request', 400);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const ctx = await getUserClient(req);
  if (!ctx) return fail('Unauthorized', 401);
  const { client, user } = ctx;

  const { error, count } = await client
    .from('budgets')
    .delete({ count: 'exact' })
    .eq('id', params.id)
    .eq('user_id', user.id);

  if (error) return fail('Failed to delete budget', 500);
  if (count === 0) return fail('Budget not found', 404);
  return ok({ id: params.id });
}
