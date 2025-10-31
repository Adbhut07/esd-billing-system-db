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
      <Navigation isOpen={sidebarOpen} />
      <main
        className={cn(
          'pt-[57px] transition-all duration-300',
          sidebarOpen ? 'lg:pl-64' : 'pl-0'
        )}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
