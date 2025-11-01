'use client'

import { ReactNode, useState } from 'react'
import { Navigation } from './Navigation'
import { Header } from './Header'
import { cn } from '@/lib/utils'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Navigation isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main
        // Always add left padding on large screens (reserve space for sidebar).
        // On small screens the sidebar is overlayed so no padding is applied.
        className={cn('pt-[57px] transition-all duration-300 lg:pl-64')}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
