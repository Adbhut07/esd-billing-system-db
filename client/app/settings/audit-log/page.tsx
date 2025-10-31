'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { fetchAuditLogs } from '@/lib/redux/slices/settingsSlice'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/shared/DataTable'
import { LoadingState } from '@/components/shared/LoadingState'

export default function AuditLogPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { auditLogs, loading } = useAppSelector((state) => state.settings)

  useEffect(() => {
    dispatch(fetchAuditLogs({}))
  }, [])

  if (loading) {
    return <LoadingState type="table" count={5} />
  }

  const columns = [
    { header: 'Admin', accessor: 'admin' as const },
    { header: 'Action', accessor: 'action' as const },
    { header: 'Resource', accessor: 'resource' as const },
    { header: 'Timestamp', accessor: 'timestamp' as const },
    { header: 'Details', accessor: 'details' as const },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/settings')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Audit Log</h1>
          <p className="text-gray-500">View system activity and changes</p>
        </div>
      </div>

      <DataTable data={auditLogs as any} columns={columns as any} loading={loading} />
    </div>
  )
}
