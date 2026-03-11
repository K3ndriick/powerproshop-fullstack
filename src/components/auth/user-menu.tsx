'use client';

/**
 * UserMenu
 *
 * The user account control in the header. Renders one of three states
 * based on auth state from useAuth():
 *
 *   1. loading = true  -> skeleton placeholder (prevents layout shift)
 *   2. user = null     -> "Sign in" link (logged out)
 *   3. user exists     -> dropdown menu with account options (logged in)
 *
 * This is the key concept: a single component that reads auth state and
 * renders completely different UI depending on what it finds.
 * No prop drilling - it reads state directly from context via useAuth().
 *
 * Dropdown menu structure (when logged in):
 *   [User icon button]  <- DropdownMenuTrigger
 *     [Name or email]   <- DropdownMenuLabel (non-interactive header)
 *     ─────────────     <- DropdownMenuSeparator
 *     My Profile        <- DropdownMenuItem -> /profile
 *     My Orders         <- DropdownMenuItem -> /orders
 *     ─────────────     <- DropdownMenuSeparator
 *     Sign out          <- DropdownMenuItem -> calls signOut()
 */

import Link from 'next/link';
import { User, LogOut, Package, UserCircle } from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '@/lib/auth/auth-context';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// =============================================================
// COMPONENT
// =============================================================

export function UserMenu() {
  const { user, profile, loading, signOut } = useAuth();

  // --- handleSignOut ---
  //
  // Sign out handler.
  //
  // signOut() (from AuthContext) already:
  //   - calls supabase.auth.signOut()
  //   - clears cookies
  //   - redirects to '/' via router.push('/')
  // So you only need to handle the error case here.
  //
  // Steps:
  //   try: await signOut()
  //   catch (error): toast.error(error instanceof Error ? error.message : 'Failed to sign out')
  //
  // Note: no router.push needed - signOut() handles the redirect internally.

  const handleSignOut = async () => {
    try {
      toast.success('Signed out successfully');
      await signOut();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to sign out');
    }
  };

  // =============================================================
  // STATE 1: Loading
  // =============================================================
  // While auth state is being determined on first page load, render a
  // placeholder the same size as the icon. This prevents the header
  // from "jumping" between the sign-in link and the user icon.

  if (loading) {
    return (
      <div className="h-6 w-6 rounded-full bg-muted animate-pulse" />
    );
  }

  // =============================================================
  // STATE 2: Logged out
  // =============================================================
  // If there is no user (user is null/falsy), return a sign-in link.
  //
  // Return this JSX:
  //   <Link
  //     href="/login"
  //     className="text-foreground hover:text-accent transition-colors"
  //     aria-label="Sign in"
  //   >
  //     <User className="h-6 w-6" />
  //   </Link>
  //
  
  if (!user) {
    return (
      <Link
        href={"/login"}
        className="text-foreground hover:text-accent transition-colors"
        aria-label='Sign-in'
      >
        <User className='h-6 w-6'/>
      </Link>
    )
  }

  // =============================================================
  // STATE 3: Logged in
  // =============================================================
  // If we reach here, the user is authenticated. Render the dropdown.
  //
  // profile?.full_name   - the name from the profiles table (may be null)
  // user.email           - always present, used as fallback display name
  // ?? operator          - use full_name if it exists, otherwise fall back to email

  return (
    <DropdownMenu>

      {/* Trigger - the clickable User icon in the header */}
      {/* asChild passes the button behaviour to the child element instead of wrapping it */}
      <DropdownMenuTrigger asChild>
        <button
          className="text-foreground hover:text-accent transition-colors"
          aria-label="Account menu"
        >
          <User className="h-6 w-6" />
        </button>
      </DropdownMenuTrigger>

      {/* Dropdown content - appears below the trigger, aligned to the right edge */}
      <DropdownMenuContent align="end" className="w-48">

        {/* User identity - non-interactive label showing who is logged in */}
        <DropdownMenuLabel className="font-normal">
          <p className="font-medium truncate">
            {profile?.full_name ?? user!.email}
          </p>
          {profile?.full_name && (
            <p className="text-xs text-muted-foreground truncate">{user!.email}</p>
          )}
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Navigation items - asChild lets us use Link inside DropdownMenuItem */}
        <DropdownMenuItem asChild>
          <Link href="/dashboard/profile" className="cursor-pointer">
            <UserCircle />
            My Profile
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/dashboard/orders" className="cursor-pointer">
            <Package />
            My Orders
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Sign out - calls handleSignOut on click, not a navigation link */}
        <DropdownMenuItem
          onClick={handleSignOut}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut />
          Sign out
        </DropdownMenuItem>

      </DropdownMenuContent>
    </DropdownMenu>
  );
}
