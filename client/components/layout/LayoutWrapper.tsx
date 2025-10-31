'use client'

import { ReactNode } from 'react'
import { useAppSelector } from '@/lib/redux/hooks'
import { Layout } from './Layout'

interface LayoutWrapperProps {
  children: ReactNode
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const { isAuthenticated } = useAppSelector((state) => state.auth)

  // Show layout only for authenticated users
  if (isAuthenticated) {
    return <Layout>{children}</Layout>
  }

  // Show children without layout for unauthenticated users (login/register pages)
  return <>{children}</>
}
