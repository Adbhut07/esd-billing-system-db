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
import type { Bill } from '@/lib/redux/slices/billSlice'

export default function BillsPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { bills, loading, pagination, filters } = useAppSelector((state) => state.bill)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    dispatch(fetchBills({ 
      page: pagination.page, 
      limit: pagination.limit,
      search: filters.search || undefined,
      status: filters.status || undefined,
      month: filters.month || undefined
    }))
  }, [dispatch, filters.search, filters.status, filters.month, pagination.page, pagination.limit])

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await dispatch(deleteBill(deleteId)).unwrap()
        toast.success('Bill deleted successfully')
        setDeleteId(null)
        dispatch(fetchBills({ 
          page: pagination.page, 
          limit: pagination.limit,
          search: filters.search || undefined,
          status: filters.status || undefined,
          month: filters.month || undefined
        }))
      } catch {
        toast.error('Failed to delete bill')
      }
    }
  }

  const columns = [
    {
      header: 'House Number',
      cell: (row: Bill) => `${row.house?.houseNumber || 'N/A'}`,
    },
    {
      header: 'Mohalla',
      cell: (row: Bill) => `${row.house?.mohalla?.name || row.house?.mohalla?.number || 'N/A'}`,
    },
    {
      header: 'Month/Year',
      cell: (row: Bill) => {
        const date = new Date(row.month);
        return `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
      },
    },
    {
      header: 'Total Amount',
      cell: (row: Bill) => `₹${row.totalBillAfter15 || 0}`,
    },
    {
      header: 'Status',
      cell: (row: Bill) => <StatusBadge status={row.billStatus || 'Not Generated'} />,
    },
    {
      header: 'Actions',
      cell: (row: Bill) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/bills/${row.id}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteId(row.id.toString())}
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
          <h1 className="text-3xl font-bold text-foreground">Bill Management</h1>
          <p className="text-muted-foreground">Manage all bills in the system</p>
        </div>
        <Button onClick={() => router.push('/bills/generate')}>
          <Plus className="h-4 w-4 mr-2" />
          Generate Bill
        </Button>
      </div>

      <FilterBar
        searchValue={filters.search}
        onSearchChange={(value: string) => dispatch(setFilters({ search: value }))}
        searchPlaceholder="Search by house number or mohalla..."
        onReset={() => dispatch(setFilters({ status: null, month: null, dateRange: null, search: '' }))}
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
            <SelectItem value="GENERATED">Generated</SelectItem>
            <SelectItem value="PARTIALLY_PAID">Partially Paid</SelectItem>
            <SelectItem value="PAID">Paid</SelectItem>
            <SelectItem value="OVERDUE">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </FilterBar>

      <DataTable
        data={bills.map(bill => ({ ...bill, _id: bill.id.toString() }))}
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
