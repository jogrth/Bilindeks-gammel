import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function requireAdmin() {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/');
  }

  const { data: adminRecord } = await supabase
    .from('system_admins')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!adminRecord) {
    redirect('/');
  }

  return { user, supabase };
}

export async function checkIsAdmin(): Promise<boolean> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return false;

  const { data: adminRecord } = await supabase
    .from('system_admins')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();

  return !!adminRecord;
}
