'use client'

import { useRouter, usePathname } from 'next/navigation'
import {
  Home,
  Building2,
  Zap,
  Droplet,
  FileText,
  Users,
  MapPin,
  BarChart3,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Houses', href: '/houses', icon: Building2 },
  { name: 'Electricity', href: '/readings/electricity', icon: Zap },
  { name: 'Water', href: '/readings/water', icon: Droplet },
  { name: 'Bills', href: '/bills', icon: FileText },
  { name: 'Admins', href: '/admins', icon: Users },
  { name: 'Mohallas', href: '/mohallas', icon: MapPin },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
]

interface NavigationProps {
  isOpen: boolean
  onClose?: () => void
}

export function Navigation({ isOpen, onClose }: NavigationProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleNavClick = (href: string) => {
    router.push(href)
    // close overlay on mobile after navigation
    onClose?.()
  }

  return (
    <>
      {/* Overlay shown only on small screens when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      {/* Sidebar */}
      <nav
        className={cn(
          'fixed top-[57px] left-0 bottom-0 z-50 bg-slate-100 border-sidebar-border border-r transition-transform duration-300 ease-in-out w-64',
          // On mobile: toggle translate based on isOpen.
          // On large screens: always visible (lg:translate-x-0).
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0'
        )}
        aria-label="Sidebar"
      >
        <div className="p-4 space-y-1 overflow-y-auto h-full">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href))

            return (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.href)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors w-full text-left',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}
