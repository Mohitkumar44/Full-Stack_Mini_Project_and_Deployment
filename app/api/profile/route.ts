import { NextRequest } from 'next/server';
import { getUserClient, ok, fail } from '@/lib/api-utils';

export async function GET(req: NextRequest) {
  const ctx = await getUserClient(req);
  if (!ctx) return fail('Unauthorized', 401);
  const { client, user } = ctx;

  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error) return fail('Failed to load profile', 500);
  if (!data) return fail('Profile not found', 404);
  return ok(data);
}

export async function PUT(req: NextRequest) {
  const ctx = await getUserClient(req);
  if (!ctx) return fail('Unauthorized', 401);
  const { client, user } = ctx;

  try {
    const body = await req.json();
    const { full_name, email } = body;

    const update: Record<string, unknown> = {};
    if (full_name !== undefined) update.full_name = full_name?.trim() || null;
    if (email !== undefined) update.email = email?.trim() || null;

    const { data, error } = await client
      .from('profiles')
      .update(update)
      .eq('id', user.id)
      .select('*')
      .maybeSingle();

    if (error) return fail('Failed to update profile', 500);
    if (!data) return fail('Profile not found', 404);

    return ok(data);
  } catch {
    return fail('Invalid request', 400);
  }
}
