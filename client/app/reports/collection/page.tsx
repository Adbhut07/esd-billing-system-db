'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/shared/DataTable'

export default function CollectionReportPage() {
  const router = useRouter()
  const collectionData: any[] = []

  const columns = [
    { header: 'House ID', accessor: 'houseId' as const },
    { header: 'Month', accessor: 'month' as const },
    { header: 'Total Amount', cell: (row: any) => `₹${row.totalAmount}` },
    { header: 'Paid Amount', cell: (row: any) => `₹${row.paidAmount}` },
    { header: 'Pending', cell: (row: any) => `₹${row.totalAmount - row.paidAmount}` },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/reports')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Collection Report</h1>
          <p className="text-gray-500">View collection details by house</p>
        </div>
      </div>

      <DataTable data={collectionData} columns={columns} loading={false} />
    </div>
  )
}
