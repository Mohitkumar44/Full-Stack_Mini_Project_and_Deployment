'use client';

import { supabase } from '@/lib/supabase/client';
import type { ApiResponse } from '@/lib/types';

async function request<T>(
  path: string,
  options?: RequestInit & { accessToken?: string }
): Promise<ApiResponse<T>> {
  const { accessToken } = options ?? {};
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  try {
    const res = await fetch(path, { ...options, headers });
    const json = (await res.json()) as ApiResponse<T>;
    return json;
  } catch {
    return { success: false, message: 'Network error. Please try again.' };
  }
}

export async function authedRequest<T>(
  path: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;
  if (!accessToken) return { success: false, message: 'Not authenticated' };
  return request<T>(path, { ...options, accessToken });
}
