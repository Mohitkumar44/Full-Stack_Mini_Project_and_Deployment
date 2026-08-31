import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { ok, fail } from '@/lib/api-utils';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return fail('Email and password are required', 400);
    }

    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return fail('Invalid email or password', 401);
    }

    return ok({
      access_token: data.session.access_token,
      user: { id: data.user.id, email: data.user.email },
    });
  } catch {
    return fail('Login failed', 500);
  }
}
