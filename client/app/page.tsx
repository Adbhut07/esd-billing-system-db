"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import type { RootState } from "@/lib/redux/store"
import LoginPage from "@/components/auth/login-page"

export default function Home() {
  const router = useRouter()
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, router, mounted])

  return <LoginPage />
}
