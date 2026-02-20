/**
 * (auth)/layout.tsx
 *
 * Shared layout for all authentication pages:
 *   /login, /signup, /forgot-password, /forgot-password/confirm
 *
 * This is a NESTED layout - it renders inside root layout's <main> tag.
 * The root layout already provides <Header> and <Footer>, so we get those for free.
 * This layout only handles the visual structure of the auth content area.
 *
 * Layout structure (outermost -> innermost):
 *
 *   RootLayout        <-- html, body, AuthProvider, Header, Footer
 *     (auth)/layout   <-- this file: centers the content
 *       login/page    <-- the actual form card (LoginForm etc.)
 *
 * Visual result:
 *   ┌─────────────────────────────┐
 *   │  Header (from root layout)  │
 *   ├─────────────────────────────┤
 *   │                             │
 *   │        PowerProShop         │  <- brand link
 *   │   ┌─────────────────────┐   │
 *   │   │   [Form Card Here]  │   │  <- {children} = login/signup/etc page
 *   │   └─────────────────────┘   │
 *   │                             │
 *   ├─────────────────────────────┤
 *   │  Footer (from root layout)  │
 *   └─────────────────────────────┘
 */

import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-12 px-4">

      {/* Brand link - clicking takes the user back to the home page */}
      <Link
        href="/"
        className="mb-8 text-2xl font-bold tracking-tight hover:opacity-80 transition-opacity"
      >
        PowerProShop
      </Link>

      {/* Auth form content - constrained to a readable max-width */}
      {/* Each auth page renders its own Card inside this slot */}
      <div className="w-full max-w-md">
        {children}
      </div>

    </div>
  );
}
