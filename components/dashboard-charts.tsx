'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatINR } from '@/lib/format';
import type { DashboardStats } from '@/lib/types';
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

interface DashboardChartsProps {
  stats: DashboardStats | null;
}

export function DashboardCharts({ stats }: DashboardChartsProps) {
  return (
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
  );
}
