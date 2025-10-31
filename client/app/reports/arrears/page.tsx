'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/shared/DataTable'

export default function ArrearsReportPage() {
  const router = useRouter()
  const arrearsData: any[] = []

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

      <DataTable data={arrearsData} columns={columns} loading={false} />
    </div>
  )
}
