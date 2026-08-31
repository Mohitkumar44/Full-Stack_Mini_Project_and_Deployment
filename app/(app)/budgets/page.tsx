'use client';

import { useEffect, useState, useCallback } from 'react';
import { authedRequest } from '@/lib/api';
import type { Budget } from '@/lib/types';
import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Target, Plus, Trash2, Loader2, AlertTriangle, Pencil } from 'lucide-react';
import { formatINR, monthName } from '@/lib/format';
import { toast } from '@/hooks/use-toast';

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const YEARS = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Budget | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadBudgets = useCallback(async () => {
    setLoading(true);
    const res = await authedRequest<Budget[]>('/api/budgets');
    if (res.success && res.data) {
      setBudgets(res.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) < 0) {
      toast({ title: 'Please enter a valid amount', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const res = await authedRequest<Budget>('/api/budgets', {
      method: 'POST',
      body: JSON.stringify({ month, year, amount: Number(amount) }),
    });
    setSaving(false);
    if (res.success) {
      toast({ title: 'Budget saved' });
      setAmount('');
      loadBudgets();
    } else {
      toast({ title: res.message || 'Failed to save budget', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await authedRequest(`/api/budgets/${deleteTarget.id}`, { method: 'DELETE' });
    setDeleting(false);
    if (res.success) {
      toast({ title: 'Budget deleted' });
      setDeleteTarget(null);
      loadBudgets();
    } else {
      toast({ title: res.message || 'Failed to delete', variant: 'destructive' });
    }
  };

  const handleEdit = (b: Budget) => {
    setMonth(b.month);
    setYear(b.year);
    setAmount(String(b.amount));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Budgets</h1>
          <p className="text-muted-foreground">Set and track your monthly spending limits.</p>
        </div>

        {/* Set budget form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Set Monthly Budget</CardTitle>
            <CardDescription>
              Choose a month and enter your spending limit. Setting the same month again updates it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <div className="space-y-2">
                <Label>Month</Label>
                <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m) => (
                      <SelectItem key={m} value={String(m)}>
                        {monthName(m)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Year</Label>
                <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {YEARS.map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  placeholder="15000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" className="w-full" disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                  {saving ? 'Saving...' : 'Save budget'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Budget list */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : budgets.length === 0 ? (
          <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
              <Target className="h-7 w-7 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">No budgets set yet</p>
              <p className="text-sm text-muted-foreground">
                Set a monthly budget above to start tracking your spending limits.
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {budgets.map((b) => {
              const isCurrent =
                b.month === new Date().getMonth() + 1 && b.year === new Date().getFullYear();
              return (
                <Card key={b.id} className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">
                          {monthName(b.month)} {b.year}
                        </p>
                        {isCurrent && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-2xl font-bold">{formatINR(Number(b.amount))}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(b)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700"
                        onClick={() => setDeleteTarget(b)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this budget?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. The budget for{' '}
                {deleteTarget ? `${monthName(deleteTarget.month)} ${deleteTarget.year}` : ''} will be
                permanently removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {deleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppShell>
  );
}
