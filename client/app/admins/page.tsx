'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { fetchAdmins, deleteAdmin } from '@/lib/redux/slices/adminSlice'
import { DataTable } from '@/components/shared/DataTable'
import { FilterBar } from '@/components/shared/FilterBar'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function AdminsPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { admins, loading } = useAppSelector((state) => state.admin)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    dispatch(fetchAdmins({}))
  }, [dispatch])

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await dispatch(deleteAdmin(deleteId)).unwrap()
        toast.success('Admin deleted successfully')
        setDeleteId(null)
        dispatch(fetchAdmins({}))
      } catch (error) {
        toast.error('Failed to delete admin')
      }
    }
  }

  const columns = [
    {
      header: 'Username',
      accessor: 'username' as const,
    },
    {
      header: 'Email',
      accessor: 'email' as const,
    },
    {
      header: 'Full Name',
      accessor: 'fullName' as const,
    },
    {
      header: 'Role',
      accessor: 'role' as const,
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
            onClick={() => router.push(`/admins/${row._id}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/admins/${row._id}/edit`)}
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
          <h1 className="text-3xl font-bold">Admin Management</h1>
          <p className="text-gray-500">Manage system administrators</p>
        </div>
        <Button onClick={() => router.push('/admins/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Admin
        </Button>
      </div>

      <FilterBar
        searchValue=""
        onSearchChange={() => {}}
        searchPlaceholder="Search by username or email..."
      />

      <DataTable
        data={admins}
        columns={columns}
        loading={loading}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Admin"
        description="Are you sure you want to delete this admin? This action cannot be undone."
        onConfirm={handleDelete}
      />
    </div>
  )
}
