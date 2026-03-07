/**
 * /dashboard root page
 *
 * There's nothing to show at /dashboard itself - the real content
 * lives at /dashboard/orders, /dashboard/profile, etc.
 *
 * This page immediately redirects to /dashboard/orders so the user
 * always lands somewhere meaningful.
 *
 * redirect from next/navigation is called to redirect pages
 *
 * That's all this file needs. redirect() never returns - Next.js
 * throws internally to stop execution and issue a 307 response.
 * No JSX required.
 */
import { redirect } from "next/navigation";


export default function DashboardPage() {
  redirect('/dashboard/orders');
}
