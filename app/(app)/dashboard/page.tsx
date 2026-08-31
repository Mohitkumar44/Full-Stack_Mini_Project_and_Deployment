'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { authedRequest } from '@/lib/api';
import type { DashboardStats } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import { AppShell } from '@/components/app-shell';
import { StatCard } from '@/components/stat-card';
import { CategoryBadge } from '@/components/category-badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Wallet, Target, TrendingDown, Receipt, ArrowRight, AlertTriangle, Plus } from 'lucide-react';
import { formatINR, formatDate } from '@/lib/format';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const PIE_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  '#f97316',
  '#06b6d4',
  '#84cc16',
  '#a3a3a3',
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const res = await authedRequest<DashboardStats>('/api/dashboard/stats');
      if (active) {
        if (res.success && res.data) setStats(res.data);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const firstName = (profile?.full_name || '').split(' ')[0] || 'there';

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {getGreeting()}, {firstName} 👋
            </h1>
            <p className="text-muted-foreground">Here&apos;s your spending overview.</p>
          </div>
          <Button asChild>
            <Link href="/expenses">
              <Plus className="mr-2 h-4 w-4" />
              Add expense
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Spending"
                value={formatINR(stats?.totalSpending || 0)}
                icon={Wallet}
                description="This month"
              />
              <StatCard
                title="Monthly Budget"
                value={formatINR(stats?.monthlyBudget || 0)}
                icon={Target}
                description={stats?.monthlyBudget ? 'Set for this month' : 'No budget set'}
                tone={stats?.monthlyBudget ? 'success' : 'warning'}
              />
              <StatCard
                title="Remaining"
                value={formatINR(stats?.remaining || 0)}
                icon={TrendingDown}
                description={stats?.overBudget ? 'Over budget!' : 'Left to spend'}
                tone={stats?.overBudget ? 'danger' : 'success'}
              />
              <StatCard
                title="Transactions"
                value={String(stats?.transactions || 0)}
                icon={Receipt}
                description="This month"
              />
            </div>

            {/* Budget progress */}
            {stats?.monthlyBudget ? (
              <Card className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Budget Progress</p>
                    <p className="text-lg font-bold">
                      {formatINR(stats.totalSpending)}{' '}
                      <span className="text-muted-foreground font-normal">
                        / {formatINR(stats.monthlyBudget)}
                      </span>
                    </p>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      stats.overBudget ? 'text-red-600 dark:text-red-400' : 'text-primary'
                    }`}
                  >
                    {Math.min(Math.round(stats.budgetProgress), 100)}%
                  </span>
                </div>
                <Progress
                  value={Math.min(stats.budgetProgress, 100)}
                  className="h-3"
                />
                {stats.overBudget && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
                    <AlertTriangle className="h-4 w-4" />
                    You&apos;ve exceeded your budget by{' '}
                    {formatINR(stats.totalSpending - stats.monthlyBudget)}.
                  </div>
                )}
              </Card>
            ) : (
              <Card className="flex items-center justify-between p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Target className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">No budget set for this month</p>
                    <p className="text-sm text-muted-foreground">
                      Set a budget to track your spending limits.
                    </p>
                  </div>
                </div>
                <Button asChild variant="outline">
                  <Link href="/budgets">Set budget</Link>
                </Button>
              </Card>
            )}

            {/* Charts */}
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Spending by Category */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Spending by Category</CardTitle>
                  <CardDescription>This month&apos;s breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats && stats.byCategory.length > 0 ? (
                    <div className="flex flex-col items-center gap-4 sm:flex-row">
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie
                            data={stats.byCategory}
                            dataKey="amount"
                            nameKey="category"
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={2}
                          >
                            {stats.byCategory.map((_, i) => (
                              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(v: number) => formatINR(v)}
                            contentStyle={{
                              borderRadius: '0.5rem',
                              border: '1px solid hsl(var(--border))',
                              background: 'hsl(var(--popover))',
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="w-full space-y-2">
                        {stats.byCategory.slice(0, 5).map((c, i) => (
                          <div key={c.category} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span
                                className="h-3 w-3 rounded-full"
                                style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                              />
                              <span>{c.category}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-medium">{formatINR(c.amount)}</span>
                              <span className="text-muted-foreground text-xs">
                                {Math.round(c.percentage)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
                      No expenses this month yet.
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Monthly Spending */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Monthly Spending</CardTitle>
                  <CardDescription>Last 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={stats?.monthly || []}>
                      <XAxis
                        dataKey="month"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v: number) => `₹${v >= 1000 ? `${Math.round(v / 1000)}k` : v}`}
                      />
                      <Tooltip
                        formatter={(v: number) => formatINR(v)}
                        contentStyle={{
                          borderRadius: '0.5rem',
                          border: '1px solid hsl(var(--border))',
                          background: 'hsl(var(--popover))',
                        }}
                        cursor={{ fill: 'hsl(var(--muted))' }}
                      />
                      <Bar dataKey="amount" fill="hsl(var(--chart-1))" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Recent transactions */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Recent Expenses</CardTitle>
                  <CardDescription>Your latest transactions</CardDescription>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/expenses">
                    View all
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {stats && stats.recent.length > 0 ? (
                  <div className="space-y-1">
                    {stats.recent.map((e) => (
                      <div
                        key={e.id}
                        className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-secondary/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                            <Receipt className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{e.title}</p>
                            <div className="flex items-center gap-2">
                              <CategoryBadge category={e.category} />
                              <span className="text-xs text-muted-foreground">
                                {formatDate(e.expense_date)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className="text-sm font-semibold">{formatINR(Number(e.amount))}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                      <Receipt className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">No expenses yet</p>
                      <p className="text-sm text-muted-foreground">
                        Start tracking your spending by adding your first expense.
                      </p>
                    </div>
                    <Button asChild>
                      <Link href="/expenses">
                        <Plus className="mr-2 h-4 w-4" />
                        Add expense
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AppShell>
  );
}
