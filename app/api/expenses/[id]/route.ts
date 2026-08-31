import { NextRequest } from 'next/server';
import { getUserClient, ok, fail } from '@/lib/api-utils';
import { CATEGORIES, PAYMENT_METHODS } from '@/lib/types';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const ctx = await getUserClient(req);
  if (!ctx) return fail('Unauthorized', 401);
  const { client, user } = ctx;

  const { data, error } = await client
    .from('expenses')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) return fail('Failed to load expense', 500);
  if (!data) return fail('Expense not found', 404);
  return ok(data);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const ctx = await getUserClient(req);
  if (!ctx) return fail('Unauthorized', 401);
  const { client, user } = ctx;

  try {
    const body = await req.json();
    const { title, amount, category, description, payment_method, expense_date } = body;

    const update: Record<string, unknown> = {};
    if (title !== undefined) {
      if (!title.trim()) return fail('Title is required', 400);
      update.title = title.trim();
    }
    if (amount !== undefined) {
      if (Number(amount) <= 0) return fail('Amount must be greater than 0', 400);
      update.amount = Number(amount);
    }
    if (category !== undefined) {
      if (!CATEGORIES.includes(category)) return fail('Invalid category', 400);
      update.category = category;
    }
    if (description !== undefined) update.description = description?.trim() || null;
    if (payment_method !== undefined) {
      if (payment_method && !PAYMENT_METHODS.includes(payment_method))
        return fail('Invalid payment method', 400);
      update.payment_method = payment_method || null;
    }
    if (expense_date !== undefined) {
      if (!expense_date) return fail('Date is required', 400);
      const parsedDate = new Date(expense_date);
      if (Number.isNaN(parsedDate.getTime())) return fail('Invalid date', 400);
      update.expense_date = expense_date;
    }

    const { data, error } = await client
      .from('expenses')
      .update(update)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select('*')
      .maybeSingle();

    if (error) return fail('Failed to update expense', 500);
    if (!data) return fail('Expense not found', 404);
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
    .from('expenses')
    .delete({ count: 'exact' })
    .eq('id', params.id)
    .eq('user_id', user.id);

  if (error) return fail('Failed to delete expense', 500);
  if (count === 0) return fail('Expense not found', 404);
  return ok({ id: params.id });
}
