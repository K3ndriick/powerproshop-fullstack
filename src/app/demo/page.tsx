import Link from 'next/link';
// eslint-disable-next-line @typescript-eslint/no-deprecated
import { Github, Globe, Layers } from 'lucide-react';
import {
  siNextdotjs,
  siTypescript,
  siSupabase,
  siStripe,
  siTailwindcss,
  siShadcnui,
  siMailtrap,
} from 'simple-icons';

function BrandIcon({ path }: { path: string }) {
  return (
    <svg role="img" viewBox="0 0 24 24" className="w-6 h-6 fill-current shrink-0" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-24">

        <div className="space-y-8">

          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Portfolio Project</p>
            <h1 className="text-4xl font-bold">PowerProShop</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              This is a full-stack e-commerce and business management platform built as a real-world development project.
              It is not a live commercial store.
            </p>
          </div>

          <div className="border-t pt-8 space-y-4">
            <h2 className="font-semibold text-lg">What was built</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'E-commerce',   desc: 'Product catalog, filtering, cart, Stripe checkout, order history' },
                { label: 'Auth',         desc: 'Email/password login, signup, and password reset via Supabase Auth' },
                { label: 'Appointments', desc: 'Service catalog, real-time slot availability, online booking, email confirmations' },
                { label: 'Dashboard',    desc: 'Order history, appointment management, saved addresses, profile settings' },
                { label: 'Admin',        desc: 'Analytics, product CRUD, order management, appointment queue, review moderation' },
                { label: 'Inventory',    desc: 'Stock adjustments, audit log, suppliers, purchase orders, checkout reservations' },
              ].map(({ label, desc }) => (
                <div key={label} className="border p-4 space-y-1">
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-8 space-y-4">
            <h2 className="font-semibold text-lg">Tech stack</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Next.js 16 (App Router)',      href: 'https://nextjs.org/docs',           icon: <BrandIcon path={siNextdotjs.path} /> },
                { label: 'TypeScript',                   href: 'https://www.typescriptlang.org',    icon: <BrandIcon path={siTypescript.path} /> },
                { label: 'Supabase (PostgreSQL + Auth)', href: 'https://supabase.com/docs',         icon: <BrandIcon path={siSupabase.path} /> },
                { label: 'Stripe Payments',              href: 'https://stripe.com/docs',           icon: <BrandIcon path={siStripe.path} /> },
                { label: 'Tailwind CSS v3',              href: 'https://v3.tailwindcss.com',        icon: <BrandIcon path={siTailwindcss.path} /> },
                { label: 'shadcn/ui + Radix',            href: 'https://ui.shadcn.com',             icon: <BrandIcon path={siShadcnui.path} /> },
                { label: 'Zustand',                      href: 'https://zustand-demo.pmnd.rs',      icon: <Layers className="w-6 h-6 shrink-0" /> },
                { label: 'Nodemailer (Mailtrap)',         href: 'https://nodemailer.com',            icon: <BrandIcon path={siMailtrap.path} /> },
              ].map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border p-4 flex flex-col gap-3 hover:bg-muted transition-colors"
                >
                  {icon}
                  <p className="text-sm text-muted-foreground">{label}</p>
                </a>
              ))}
            </div>
          </div>

          <div className="border-t pt-8 space-y-4">
            <h2 className="font-semibold text-lg">Pages not yet built</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {['Contact', 'FAQ', 'Shipping & Returns', 'Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((page) => (
                <div key={page} className="border p-4">
                  <p className="text-sm text-muted-foreground">{page}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-8 space-y-4">
            <h2 className="font-semibold text-lg">Built by</h2>
            <p className="text-sm text-muted-foreground">
              Kendrick
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://github.com/K3ndriick"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <Github className="w-4 h-4" />
                GitHub
              </a>
              <a
                href="https://kendrick-lee.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
              >
                <Globe className="w-4 h-4" />
                Portfolio
              </a>
            </div>
          </div>

          <div className="border-t pt-8 flex flex-wrap gap-3">
            <Link
              href="/"
              className="bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              View the Store
            </Link>
            <Link
              href="/products"
              className="border px-5 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
            >
              Browse Products
            </Link>
            <Link
              href="/services"
              className="border px-5 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
            >
              Book a Service
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
