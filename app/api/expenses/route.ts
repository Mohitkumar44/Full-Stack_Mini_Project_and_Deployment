import { NextRequest } from 'next/server';
import { getUserClient, ok, fail } from '@/lib/api-utils';
import { CATEGORIES, PAYMENT_METHODS } from '@/lib/types';

export async function GET(req: NextRequest) {
  const ctx = await getUserClient(req);
  if (!ctx) return fail('Unauthorized', 401);
  const { client, user } = ctx;

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search')?.trim() || '';
  const category = searchParams.get('category') || 'all';
  const paymentMethod = searchParams.get('payment_method') || 'all';
  const dateFilter = searchParams.get('date_filter') || 'all';
  const sort = searchParams.get('sort') || 'newest';
  const customStart = searchParams.get('start_date');
  const customEnd = searchParams.get('end_date');

  let query = client
    .from('expenses')
    .select('*')
    .eq('user_id', user.id);

  if (search) {
    query = query.or(
      `title.ilike.%${search}%,description.ilike.%${search}%,category.ilike.%${search}%`
    );
  }

  if (category !== 'all' && CATEGORIES.includes(category as never)) {
    query = query.eq('category', category);
  }

  if (paymentMethod !== 'all' && PAYMENT_METHODS.includes(paymentMethod as never)) {
    query = query.eq('payment_method', paymentMethod);
  }

  const today = new Date();
  if (dateFilter === 'today') {
    query = query.eq('expense_date', today.toISOString().slice(0, 10));
  } else if (dateFilter === 'week') {
    const start = new Date(today);
    start.setDate(start.getDate() - start.getDay());
    query = query.gte('expense_date', start.toISOString().slice(0, 10));
  } else if (dateFilter === 'month') {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    query = query.gte('expense_date', start.toISOString().slice(0, 10));
  } else if (dateFilter === 'last_month') {
    const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const end = new Date(today.getFullYear(), today.getMonth(), 0);
    query = query
      .gte('expense_date', start.toISOString().slice(0, 10))
      .lte('expense_date', end.toISOString().slice(0, 10));
  } else if (dateFilter === 'custom') {
    if (customStart) query = query.gte('expense_date', customStart);
    if (customEnd) query = query.lte('expense_date', customEnd);
  }

  if (sort === 'oldest') query = query.order('expense_date', { ascending: true });
  else if (sort === 'highest') query = query.order('amount', { ascending: false });
  else if (sort === 'lowest') query = query.order('amount', { ascending: true });
  else query = query.order('expense_date', { ascending: false }).order('created_at', { ascending: false });

  const { data, error } = await query;
  if (error) return fail('Failed to load expenses', 500);

  return ok(data);
}

export async function POST(req: NextRequest) {
  const ctx = await getUserClient(req);
  if (!ctx) return fail('Unauthorized', 401);
  const { client, user } = ctx;

  try {
    const body = await req.json();
    const { title, amount, category, description, payment_method, expense_date } = body;

    if (!title || !title.trim()) return fail('Title is required', 400);
    if (amount === undefined || amount === null || Number(amount) <= 0)
      return fail('Amount must be greater than 0', 400);
    if (!category || !CATEGORIES.includes(category)) return fail('Invalid category', 400);
    if (!expense_date) return fail('Date is required', 400);
    if (payment_method && !PAYMENT_METHODS.includes(payment_method))
      return fail('Invalid payment method', 400);

    const parsedDate = new Date(expense_date);
    if (Number.isNaN(parsedDate.getTime())) return fail('Invalid date', 400);

    const { data, error } = await client
      .from('expenses')
      .insert({
        user_id: user.id,
        title: title.trim(),
        amount: Number(amount),
        category,
        description: description?.trim() || null,
        payment_method: payment_method || null,
        expense_date,
      })
      .select('*')
      .single();

    if (error) return fail(`Failed to create expense: ${error.message}`, 500);
    return ok(data, 201);
  } catch {
    return fail('Invalid request', 400);
  }
}
