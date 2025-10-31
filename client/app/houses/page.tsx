'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { fetchHouses, deleteHouse, setFilters, setPagination } from '@/lib/redux/slices/houseSlice'
import { DataTable } from '@/components/shared/DataTable'
import { FilterBar } from '@/components/shared/FilterBar'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

export default function HousesPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { houses, loading, pagination, filters } = useAppSelector((state) => state.house)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    dispatch(fetchHouses({ ...filters, page: pagination.page, limit: pagination.limit }))
  }, [dispatch, filters, pagination.page])

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await dispatch(deleteHouse(deleteId)).unwrap()
        toast.success('House deleted successfully')
        setDeleteId(null)
        dispatch(fetchHouses({ ...filters, page: pagination.page, limit: pagination.limit }))
      } catch (error) {
        toast.error('Failed to delete house')
      }
    }
  }

  const columns = [
    {
      header: 'Sector',
      accessor: 'sector' as const,
    },
    {
      header: 'House Number',
      accessor: 'houseNumber' as const,
    },
    {
      header: 'Consumer Code',
      accessor: 'consumerCode' as const,
    },
    {
      header: 'Licensee Name',
      accessor: 'licenseeName' as const,
    },
    {
      header: 'Status',
      cell: (row: any) => <StatusBadge status={row.isActive} />,
    },
    {
      header: 'Actions',
      cell: (row: any) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/houses/${row._id}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/houses/${row._id}/edit`)}
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
          <h1 className="text-3xl font-bold">House Management</h1>
          <p className="text-gray-500">Manage all houses in the system</p>
        </div>
        <Button onClick={() => router.push('/houses/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Add House
        </Button>
      </div>

      <FilterBar
        searchValue={filters.search}
        onSearchChange={(value: string) => dispatch(setFilters({ search: value }))}
        searchPlaceholder="Search by house number or consumer code..."
        onReset={() => dispatch(setFilters({ sector: null, status: true, search: '' }))}
      >
        <Select
          value={filters.sector || 'all'}
          onValueChange={(value: string) =>
            dispatch(setFilters({ sector: value === 'all' ? null : value }))
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Sector" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sectors</SelectItem>
            <SelectItem value="A">Sector A</SelectItem>
            <SelectItem value="B">Sector B</SelectItem>
            <SelectItem value="C">Sector C</SelectItem>
          </SelectContent>
        </Select>
      </FilterBar>

      <DataTable
        data={houses}
        columns={columns}
        pagination={{ ...pagination, totalPages: Math.ceil(pagination.total / pagination.limit) }}
        onPageChange={(page) => dispatch(setPagination({ ...pagination, page }))}
        loading={loading}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete House"
        description="Are you sure you want to delete this house? This action cannot be undone."
        onConfirm={handleDelete}
      />
    </div>
  )
}
