"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSelector, useDispatch } from "react-redux"
import type { RootState } from "@/lib/redux/store"
import { logout } from "@/lib/redux/slices/authSlice"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function Dashboard() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { isAuthenticated, admin } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, router])

  const handleLogout = () => {
    dispatch(logout())
    router.push("/")
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-600">Welcome, {admin?.fullName}</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Electricity Readings Card */}
          <Link href="/readings/electricity">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
              <CardHeader>
                <CardTitle className="text-xl">Electricity Readings</CardTitle>
                <CardDescription>Upload and manage electricity meter readings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-blue-600">⚡</div>
                <p className="text-sm text-gray-600 mt-4">
                  Upload CSV/Excel files with import, export, and max demand readings
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Water Readings Card */}
          <Link href="/readings/water">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
              <CardHeader>
                <CardTitle className="text-xl">Water Readings</CardTitle>
                <CardDescription>Upload and manage water meter readings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-blue-400">💧</div>
                <p className="text-sm text-gray-600 mt-4">Upload CSV/Excel files with water consumption readings</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  )
}
