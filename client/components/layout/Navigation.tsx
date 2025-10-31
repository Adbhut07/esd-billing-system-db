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
}

export function Navigation({ isOpen }: NavigationProps) {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => {}}
        />
      )}

      {/* Sidebar */}
      <nav
        className={cn(
          'fixed top-[57px] left-0 bottom-0 z-40 bg-slate-50 border-r transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'w-64'
        )}
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
                onClick={() => router.push(item.href)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors w-full text-left',
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
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
