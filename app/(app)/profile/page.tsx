'use client';

import { useState, useEffect } from 'react';
import { authedRequest } from '@/lib/api';
import type { Profile } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Loader2, User, Mail, Calendar, Save } from 'lucide-react';
import { formatDate } from '@/lib/format';
import { toast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setEmail(profile.email || user?.email || '');
      setLoading(false);
    } else if (user) {
      setEmail(user.email || '');
      setLoading(false);
    }
  }, [profile, user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast({ title: 'Name cannot be empty', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const res = await authedRequest<Profile>('/api/profile', {
      method: 'PUT',
      body: JSON.stringify({ full_name: fullName.trim(), email: email.trim() }),
    });
    setSaving(false);
    if (res.success) {
      toast({ title: 'Profile updated' });
      refreshProfile();
    } else {
      toast({ title: res.message || 'Failed to update profile', variant: 'destructive' });
    }
  };

  const initials = (fullName || email || 'U')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profile &amp; Settings</h1>
          <p className="text-muted-foreground">Manage your account information.</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        ) : (
          <>
            {/* Profile summary */}
            <Card className="p-6">
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center sm:text-left">
                  <h2 className="text-xl font-bold">{fullName || 'Your name'}</h2>
                  <p className="text-muted-foreground">{email}</p>
                  {profile?.created_at && (
                    <p className="mt-1 flex items-center justify-center sm:justify-start gap-1.5 text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      Member since {formatDate(profile.created_at)}
                    </p>
                  )}
                </div>
              </div>
            </Card>

            {/* Edit form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Account Information</CardTitle>
                <CardDescription>Update your personal details.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-9"
                        disabled={saving}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-9"
                        disabled={saving}
                      />
                    </div>
                  </div>
                  <Separator />
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    {saving ? 'Saving...' : 'Save changes'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AppShell>
  );
}
