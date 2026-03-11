/**
 * Dashboard - Profile page
 *
 * Server Component: fetches the user's profile, then hands it to
 * the ProfileForm (Client Component) which owns the edit/submit logic.
 */

import { createClient } from '@/lib/supabase/server';
import { ProfileForm } from '@/components/dashboard/profile-form';

export default async function DashboardProfilePage() {

  // ============================================================
  // Fetch the current user and their full profile row
  //
  // You need the full profile row (all columns), not just full_name.
  //
  // Think about:
  //   - What changes in the .select() call when you want all columns?
  //   - ProfileForm needs both `profile` and `email` as props.
  //     Where does email come from - the profile row or the auth user?
  // ============================================================

  // get the supabase client, current user, and full profile row
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user!.id)
  .single()



  return (
    <div className="space-y-6">

      <h2 className="text-xl font-semibold">Profile</h2>

      {/* render <ProfileForm> with the profile and email props */}
      <ProfileForm profile={profile} email={`${user!.email}`}/>
    </div>
  )
}
