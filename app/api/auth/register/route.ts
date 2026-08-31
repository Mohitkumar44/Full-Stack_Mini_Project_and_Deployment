import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getUserFromRequest, ok, fail } from '@/lib/api-utils';

export async function POST(req: NextRequest) {
  try {
    const { email, password, full_name } = await req.json();
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const normalizedName = typeof full_name === 'string' ? full_name.trim() : '';

    if (!normalizedName || !normalizedEmail || !password) {
      return fail('Name, email, and password are required', 400);
    }
    if (password.length < 6) {
      return fail('Password must be at least 6 characters', 400);
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
      user_metadata: { full_name: normalizedName },
    });

    if (error) {
      if (error.message.toLowerCase().includes('already')) {
        return fail('An account with this email already exists', 409);
      }
      return fail('Unable to create your account', 400);
    }

    const userId = data.user.id;
    const { error: profileError } = await supabaseAdmin.from('profiles').insert({
      id: userId,
      full_name: normalizedName,
      email: normalizedEmail,
    });

    if (profileError) {
      return fail('Account created but profile setup failed', 500);
    }

    return ok({ id: userId, email }, 201);
  } catch {
    return fail('Unable to create your account', 500);
  }
}
