'use client'

import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { fetchMetrics, fetchCharts } from '@/lib/redux/slices/reportsSlice'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingState } from '@/components/shared/LoadingState'

export default function ReportsPage() {
  const dispatch = useAppDispatch()
  const { metrics, chartData, loading } = useAppSelector((state) => state.reports)

  useEffect(() => {
    dispatch(fetchMetrics())
    dispatch(fetchCharts())
  }, [dispatch])

  if (loading) {
    return <LoadingState type="card" count={4} />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <p className="text-gray-500">View system reports and analytics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{metrics?.totalRevenue || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Collection Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.collectionRate || 0}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Bills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metrics?.pending || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Overdue Bills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics?.overdue || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">Chart data available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bill Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">Chart data available</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
