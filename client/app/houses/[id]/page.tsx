'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { fetchHouseById, deleteHouse } from '@/lib/redux/slices/houseSlice'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { LoadingState } from '@/components/shared/LoadingState'
import { toast } from 'sonner'

export default function HouseDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const dispatch = useAppDispatch()
  const { currentHouse, loading } = useAppSelector((state) => state.house)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    if (id) {
      dispatch(fetchHouseById(id))
    }
  }, [dispatch, id])

  const handleDelete = async () => {
    try {
      await dispatch(deleteHouse(id)).unwrap()
      toast.success('House deleted successfully')
      router.push('/houses')
    } catch (error) {
      toast.error('Failed to delete house')
    }
  }

  if (loading || !currentHouse) {
    return <LoadingState type="card" count={3} />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/houses')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">House Details</h1>
            <p className="text-gray-500">{(currentHouse as any).sector} - {currentHouse.houseNumber}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/houses/${id}/edit`)}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Sector</p>
              <p className="font-semibold">{(currentHouse as any).sector}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">House Number</p>
              <p className="font-semibold">{currentHouse.houseNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Consumer Code</p>
              <p className="font-semibold">{currentHouse.consumerCode}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Licensee Name</p>
              <p className="font-semibold">{currentHouse.licenseeName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <StatusBadge status={currentHouse.isActive} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Department</p>
              <p className="font-semibold">{currentHouse.department || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Mobile</p>
              <p className="font-semibold">{currentHouse.mobileNumber || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-semibold">{currentHouse.email || 'N/A'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Meter Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Electricity Meter</p>
              <p className="font-semibold">{currentHouse.electricityMeterNumber || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Water Meter</p>
              <p className="font-semibold">{currentHouse.waterMeterNumber || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">License Fee</p>
              <p className="font-semibold">₹{currentHouse.licenseFee || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Residence Fee</p>
              <p className="font-semibold">₹{currentHouse.residenceFee || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete House"
        description="Are you sure you want to delete this house? This action cannot be undone."
        onConfirm={handleDelete}
      />
    </div>
  )
}
