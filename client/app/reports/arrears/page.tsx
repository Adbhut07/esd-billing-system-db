'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { fetchArrearsReport } from '@/lib/redux/slices/reportsSlice'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/shared/DataTable'
import { LoadingState } from '@/components/shared/LoadingState'

export default function ArrearsReportPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { arrearsData, loading } = useAppSelector((state) => state.reports)

  useEffect(() => {
    dispatch(fetchArrearsReport({}))
  }, [dispatch])

  if (loading) {
    return <LoadingState type="table" count={5} />
  }

  const columns = [
    { header: 'House ID', accessor: 'houseId' as const },
    { header: 'Total Arrears', cell: (row: any) => `₹${row.totalArrears}` },
    { header: 'Days Overdue', accessor: 'daysOverdue' as const },
    { header: 'Status', accessor: 'status' as const },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/reports')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Arrears Report</h1>
          <p className="text-gray-500">View overdue and arrears</p>
        </div>
      </div>

      <DataTable data={arrearsData} columns={columns} loading={loading} />
    </div>
  )
}
