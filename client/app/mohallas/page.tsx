'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { fetchMohallas, deleteMohalla } from '@/lib/redux/slices/mohallaSlice'
import { DataTable } from '@/components/shared/DataTable'
import { FilterBar } from '@/components/shared/FilterBar'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function MohallaPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { mohallas, loading } = useAppSelector((state) => state.mohalla)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    dispatch(fetchMohallas({}))
  }, [])

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await dispatch(deleteMohalla(deleteId)).unwrap()
        toast.success('Mohalla deleted successfully')
        setDeleteId(null)
        dispatch(fetchMohallas({}))
      } catch (error) {
        toast.error('Failed to delete mohalla')
      }
    }
  }

  const columns = [
    {
      header: 'Sector Number',
      accessor: 'sectorNumber' as const,
    },
    {
      header: 'Sector Name',
      accessor: 'sectorName' as const,
    },
    {
      header: 'Total Houses',
      accessor: 'totalHouses' as const,
    },
    {
      header: 'Active Houses',
      accessor: 'activeHouses' as const,
    },
    {
      header: 'Actions',
      cell: (row: any) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/mohallas/${row._id}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/mohallas/${row._id}/edit`)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteId(row._id)}
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mohalla Management</h1>
          <p className="text-gray-500">Manage sectors and mohallas</p>
        </div>
        <Button onClick={() => router.push('/mohallas/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Mohalla
        </Button>
      </div>

      <FilterBar
        searchValue=""
        onSearchChange={() => {}}
        searchPlaceholder="Search by sector name..."
      />

      <DataTable
        data={mohallas}
        columns={columns}
        loading={loading}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Mohalla"
        description="Are you sure you want to delete this mohalla? This action cannot be undone."
        onConfirm={handleDelete}
      />
    </div>
  )
}
