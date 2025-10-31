'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { fetchAdminById, deleteAdmin } from '@/lib/redux/slices/adminSlice'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { LoadingState } from '@/components/shared/LoadingState'
import { toast } from 'sonner'
import { useState } from 'react'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'

export default function AdminDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const dispatch = useAppDispatch()
  const { currentAdmin, loading } = useAppSelector((state) => state.admin)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    if (id) {
      dispatch(fetchAdminById(id))
    }
  }, [])

  const handleDelete = async () => {
    try {
      await dispatch(deleteAdmin(id)).unwrap()
      toast.success('Admin deleted successfully')
      router.push('/admins')
    } catch (error) {
      toast.error('Failed to delete admin')
    }
  }

  if (loading || !currentAdmin) {
    return <LoadingState type="card" count={1} />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/admins')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Admin Details</h1>
            <p className="text-gray-500">{currentAdmin.username}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/admins/${id}/edit`)}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admin Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">Username</p>
              <p className="font-semibold">{currentAdmin.username}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-semibold">{currentAdmin.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="font-semibold">{currentAdmin.fullName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Role</p>
              <p className="font-semibold">{currentAdmin.role}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <StatusBadge status={currentAdmin.isActive} />
            </div>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Admin"
        description="Are you sure you want to delete this admin? This action cannot be undone."
        onConfirm={handleDelete}
      />
    </div>
  )
}
