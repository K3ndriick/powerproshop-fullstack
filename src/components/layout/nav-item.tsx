import Link from 'next/link'
import { ReactNode } from 'react'

type NavItemProps = {
  href: string
  children: ReactNode
  hasMegaMenu?: boolean
}

export function NavItem({ href, children, hasMegaMenu = false }: NavItemProps) {
  return (
    <Link
      href={href}
      className="relative text-sm font-medium text-foreground transition-colors group py-2"
    >
      {children}
      {/* Lululemon-style underline - appears below text with gap */}
      <span className="absolute -bottom-0 left-0 w-0 h-0.5 bg-accent group-hover:w-full transition-all duration-300" />
    </Link>
  )
}