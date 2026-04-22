'use server';

import { headers } from 'next/headers';
import { authRatelimit } from '@/lib/ratelimit';
import { createClient } from '@/lib/supabase/server';

export async function loginAction(
  email: string,
  password: string
): Promise<{ error?: string }> {
  const headersList = await headers();
  const ip =
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1';

  const { success } = await authRatelimit.limit(ip);
  if (!success) {
    return { error: 'Too many sign-in attempts. Please wait a minute and try again.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  return {};
}
