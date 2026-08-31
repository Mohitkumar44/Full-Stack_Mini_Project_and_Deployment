import { NextRequest } from 'next/server';
import { getUserClient, ok, fail } from '@/lib/api-utils';
import type { DashboardStats, Expense } from '@/lib/types';

export async function GET(req: NextRequest) {
  const ctx = await getUserClient(req);
  if (!ctx) return fail('Unauthorized', 401);
  const { client, user } = ctx;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const monthStart = new Date(year, month - 1, 1).toISOString().slice(0, 10);
  const monthEnd = new Date(year, month, 0).toISOString().slice(0, 10);

  const { data: monthExpenses } = await client
    .from('expenses')
    .select('*')
    .eq('user_id', user.id)
    .gte('expense_date', monthStart)
    .lte('expense_date', monthEnd);

  const list = (monthExpenses || []) as Expense[];
  const totalSpending = list.reduce((s, e) => s + Number(e.amount), 0);

  const { data: budget } = await client
    .from('budgets')
    .select('amount')
    .eq('user_id', user.id)
    .eq('month', month)
    .eq('year', year)
    .maybeSingle();

  const monthlyBudget = budget ? Number(budget.amount) : 0;
  const remaining = monthlyBudget - totalSpending;
  const budgetProgress = monthlyBudget > 0 ? (totalSpending / monthlyBudget) * 100 : 0;
  const overBudget = monthlyBudget > 0 && totalSpending > monthlyBudget;

  const catMap = new Map<string, number>();
  for (const e of list) {
    catMap.set(e.category, (catMap.get(e.category) || 0) + Number(e.amount));
  }
  const byCategory = Array.from(catMap.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalSpending > 0 ? (amount / totalSpending) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const monthly: { month: string; amount: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(year, month - 1 - i, 1);
    const ms = new Date(d.getFullYear(), d.getMonth(), 1)
      .toISOString()
      .slice(0, 10);
    const me = new Date(d.getFullYear(), d.getMonth() + 1, 0)
      .toISOString()
      .slice(0, 10);

    const { data: mExp } = await client
      .from('expenses')
      .select('amount')
      .eq('user_id', user.id)
      .gte('expense_date', ms)
      .lte('expense_date', me);

    const amt = (mExp || []).reduce((s, e) => s + Number(e.amount), 0);
    monthly.push({
      month: d.toLocaleString('en-IN', { month: 'short' }),
      amount: amt,
    });
  }

  const { data: recent } = await client
    .from('expenses')
    .select('*')
    .eq('user_id', user.id)
    .order('expense_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(6);

  const stats: DashboardStats = {
    totalSpending,
    monthlyBudget,
    remaining,
    transactions: list.length,
    budgetProgress,
    overBudget,
    byCategory,
    monthly,
    recent: (recent || []) as Expense[],
  };

  return ok(stats);
}
