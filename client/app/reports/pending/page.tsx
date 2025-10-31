'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { fetchPendingReport } from '@/lib/redux/slices/reportsSlice'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/shared/DataTable'
import { LoadingState } from '@/components/shared/LoadingState'

export default function PendingReportPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { pendingData, loading } = useAppSelector((state) => state.reports)

  useEffect(() => {
    dispatch(fetchPendingReport({}))
  }, [dispatch])

  if (loading) {
    return <LoadingState type="table" count={5} />
  }

  const columns = [
    { header: 'House ID', accessor: 'houseId' as const },
    { header: 'Bill Month', accessor: 'month' as const },
    { header: 'Amount', cell: (row: any) => `₹${row.amount}` },
    { header: 'Days Pending', accessor: 'daysPending' as const },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/reports')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Pending Report</h1>
          <p className="text-gray-500">View pending bills</p>
        </div>
      </div>

      <DataTable data={pendingData} columns={columns} loading={loading} />
    </div>
  )
}
