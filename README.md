# Storefront

A modern e-commerce storefront built with Next.js, Supabase, and Stripe.

## Tech Stack

- **Framework** - [Next.js 16](https://nextjs.org) (App Router, React 19)
- **Language** - TypeScript
- **Auth & Database** - [Supabase](https://supabase.com)
- **Payments** - [Stripe](https://stripe.com)
- **Styling** - Tailwind CSS
- **UI Components** - Radix UI + shadcn/ui
- **State Management** - Zustand
- **Forms** - React Hook Form + Zod

## Features

- Product catalog with filtering, sorting, and price range slider
- Product detail pages with image gallery and related products
- Shopping cart with persistent state
- User authentication (sign up, login, forgot/reset password)
- Checkout with Stripe payment processing
- Order history and order detail pages
- Mega menu navigation
- Light/dark theme support

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Stripe](https://stripe.com) account

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the root of the project:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm run start
```

## License

[All Rights Reserved](LICENSE) - No use, copying, or distribution permitted without explicit written permission.
