'use client'

import { ReactNode, useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAppSelector } from '@/lib/redux/hooks'
import { Layout } from './Layout'

interface LayoutWrapperProps {
  children: ReactNode
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Redirect to login if not authenticated after mount
  useEffect(() => {
    if (mounted && !isAuthenticated && pathname !== '/') {
      router.replace('/')
    }
  }, [mounted, isAuthenticated, pathname, router])

  // During SSR and initial render, always render children without layout
  // This ensures server and client HTML match exactly
  if (!mounted) {
    return <>{children}</>
  }

  // After mount, show layout only for authenticated users
  if (isAuthenticated) {
    return <Layout>{children}</Layout>
  }

  // Show children without layout for unauthenticated users
  return <>{children}</>
}
