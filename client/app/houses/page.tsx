'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { fetchHouses, deleteHouse, setFilters, setPagination } from '@/lib/redux/slices/houseSlice'
import { fetchMohallas } from '@/lib/redux/slices/mohallaSlice'
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
import type { House } from '@/lib/redux/slices/houseSlice'

export default function HousesPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { houses, loading, pagination, filters } = useAppSelector((state) => state.house)
  const { mohallas } = useAppSelector((state) => state.mohalla)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    dispatch(fetchHouses({ 
      page: pagination.page, 
      limit: pagination.limit,
      search: filters.search || undefined,
      mohallaId: filters.mohallaId || undefined,
      status: filters.status || undefined
    }))
  }, [dispatch, filters.search, filters.mohallaId, filters.status, pagination.page, pagination.limit])

  useEffect(() => {
    dispatch(fetchMohallas({ page: 1, limit: 100 }))
  }, [dispatch])

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await dispatch(deleteHouse(deleteId)).unwrap()
        toast.success('House deleted successfully')
        setDeleteId(null)
        dispatch(fetchHouses({ 
          page: pagination.page, 
          limit: pagination.limit,
          search: filters.search || undefined,
          mohallaId: filters.mohallaId || undefined,
          status: filters.status || undefined
        }))
      } catch {
        toast.error('Failed to delete house')
      }
    }
  }

  const columns = [
    {
      header: 'Mohalla',
      cell: (row: House) => `${row.mohalla?.name || 'N/A'}`,
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
      cell: (row: House) => <StatusBadge status={row.isActive} />,
    },
    {
      header: 'Actions',
      cell: (row: House) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/houses/${row.id}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/houses/${row.id}/edit`)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteId(row.id)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
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
        onReset={() => dispatch(setFilters({ mohallaId: null, status: true, search: '' }))}
      >
        <Select
          value={filters.mohallaId?.toString() || 'all'}
          onValueChange={(value: string) =>
            dispatch(setFilters({ ...filters, mohallaId: value === 'all' ? null : Number(value) }))
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Mohalla" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Mohallas</SelectItem>
            {mohallas.map((mohalla) => (
              <SelectItem key={mohalla.id} value={mohalla.id.toString()}>
                {mohalla.sectorName} ({mohalla.sectorNumber})
              </SelectItem>
            ))}
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
