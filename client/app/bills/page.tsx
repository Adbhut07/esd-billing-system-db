'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Eye, Trash2 } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { fetchBills, deleteBill, setFilters, setPagination } from '@/lib/redux/slices/billSlice'
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

export default function BillsPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { bills, loading, pagination, filters } = useAppSelector((state) => state.bill)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    dispatch(fetchBills({ ...filters, page: pagination.page, limit: pagination.limit }))
  }, [])

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await dispatch(deleteBill(deleteId)).unwrap()
        toast.success('Bill deleted successfully')
        setDeleteId(null)
        dispatch(fetchBills({ ...filters, page: pagination.page, limit: pagination.limit }))
      } catch (error) {
        toast.error('Failed to delete bill')
      }
    }
  }

  const columns = [
    {
      header: 'Bill ID',
      accessor: '_id' as const,
    },
    {
      header: 'House ID',
      accessor: 'houseId' as const,
    },
    {
      header: 'Month/Year',
      cell: (row: any) => `${row.month}/${row.year}`,
    },
    {
      header: 'Total Amount',
      cell: (row: any) => `₹${row.totalAmount}`,
    },
    {
      header: 'Status',
      cell: (row: any) => <StatusBadge status={row.status || 'Pending'} />,
    },
    {
      header: 'Actions',
      cell: (row: any) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/bills/${row._id}`)}
          >
            <Eye className="h-4 w-4" />
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
          <h1 className="text-3xl font-bold">Bill Management</h1>
          <p className="text-gray-500">Manage all bills in the system</p>
        </div>
        <Button onClick={() => router.push('/bills/generate')}>
          <Plus className="h-4 w-4 mr-2" />
          Generate Bill
        </Button>
      </div>

      <FilterBar
        searchValue={filters.search}
        onSearchChange={(value: string) => dispatch(setFilters({ search: value }))}
        searchPlaceholder="Search by bill ID or house ID..."
        onReset={() => dispatch(setFilters({ sector: null, status: null, month: null, dateRange: null, search: '' }))}
      >
        <Select
          value={filters.status || 'all'}
          onValueChange={(value: string) =>
            dispatch(setFilters({ status: value === 'all' ? null : value }))
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Paid">Paid</SelectItem>
            <SelectItem value="Overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </FilterBar>

      <DataTable
        data={bills}
        columns={columns}
        pagination={{ ...pagination, totalPages: Math.ceil(pagination.total / pagination.limit) }}
        onPageChange={(page) => dispatch(setPagination({ ...pagination, page }))}
        loading={loading}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Bill"
        description="Are you sure you want to delete this bill? This action cannot be undone."
        onConfirm={handleDelete}
      />
    </div>
  )
}
