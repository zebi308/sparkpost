'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, FileText, Calendar, Plug, Star,
  Settings, ScrollText, LogOut, ChevronDown, Plus
} from 'lucide-react'

interface Brand { id: string; name: string; slug: string; status: string }

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Post History', href: '/posts', icon: FileText },
  { label: 'Schedule', href: '/schedule', icon: Calendar },
  { label: 'Integrations', href: '/integrations', icon: Plug },
  { label: 'Brands', href: '/brands', icon: Star },
  { label: 'Settings', href: '/settings', icon: Settings },
  { label: 'Run Logs', href: '/logs', icon: ScrollText },
]

export default function Sidebar({ brands }: { brands: Brand[] }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createBrowserClient()
  const [brandOpen, setBrandOpen] = useState(false)

  // Derive active brand from URL or default to first
  const activeBrand = brands[0]

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="w-[220px] flex-shrink-0 bg-white border-r border-border flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border">
      <div className="font-serif italic text-xl text-ink">SparkPost</div>
      <div className="text-[10px] text-ink-3 tracking-[0.15em] uppercase mt-0.5">AI Publishing</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto">
        <div className="text-[10px] text-ink-3 tracking-[0.15em] uppercase px-2.5 mb-2">Workspace</div>
        {navItems.slice(0, 4).map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`sidebar-link ${pathname === href || pathname.startsWith(href + '/') ? 'active' : ''}`}
          >
            <Icon size={15} className="opacity-60 flex-shrink-0" />
            {label}
          </Link>
        ))}

        <div className="text-[10px] text-ink-3 tracking-[0.15em] uppercase px-2.5 mt-4 mb-2">Config</div>
        {navItems.slice(4).map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`sidebar-link ${pathname === href ? 'active' : ''}`}
          >
            <Icon size={15} className="opacity-60 flex-shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Brand switcher */}
      <div className="px-3 py-3 border-t border-border">
        <div className="text-[10px] text-ink-3 tracking-[0.12em] uppercase mb-1.5 px-1">Active brand</div>
        <div className="relative">
          <button
            onClick={() => setBrandOpen(!brandOpen)}
            className="w-full flex items-center justify-between px-2.5 py-2 text-sm text-ink border border-border rounded-md bg-surface-2 hover:bg-surface-3 transition-colors"
          >
            <span className="truncate">{activeBrand?.name || 'No brand'}</span>
            <ChevronDown size={13} className="text-ink-3 flex-shrink-0 ml-1" />
          </button>

          {brandOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-border rounded-md shadow-sm overflow-hidden z-50">
              {brands.map((b) => (
                <button
                  key={b.id}
                  onClick={() => { setBrandOpen(false) }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-surface-2 flex items-center justify-between"
                >
                  <span className="truncate">{b.name}</span>
                  {b.status === 'active' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-green flex-shrink-0" />
                  )}
                </button>
              ))}
              <div className="border-t border-border">
                <Link
                  href="/brands/new"
                  onClick={() => setBrandOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-ink-3 hover:bg-surface-2"
                >
                  <Plus size={13} /> Add brand
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sign out */}
      <div className="px-3 pb-4">
        <button
          onClick={handleSignOut}
          className="sidebar-link w-full text-ink-3 hover:text-brand-red"
        >
          <LogOut size={15} className="opacity-60" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
