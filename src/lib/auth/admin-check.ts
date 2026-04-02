import { createClient } from '@/lib/supabase/server';

export async function checkIsAdmin() {
  // create client session
  const supabase = await createClient();

  // get user from supabase
  const { data : { user } } = await supabase.auth.getUser();

  // if user is null return false
  if (!user) {
    // console.log("ERROR: No user detected");
    return false;
  }
  
  // grab the user entry from supabase, match via role column and id is same as user.id
  const { data, error } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single();

  // if the grab has an error return false
  if (error) {
    // console.log("ERROR: No match found for current user and user records");
    return false;
  } 
  
  return (data?.role === "admin") ? true : false;

}

// Throws if the caller is not an admin.
// Use this at the top of every admin server action.
export async function requireAdmin() {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) throw new Error('Unauthorized');
}