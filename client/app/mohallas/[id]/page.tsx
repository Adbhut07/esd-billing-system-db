'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { fetchMohallaById, deleteMohalla } from '@/lib/redux/slices/mohallaSlice'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { LoadingState } from '@/components/shared/LoadingState'
import { toast } from 'sonner'

export default function MohallaDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const dispatch = useAppDispatch()
  const { currentMohalla, loading } = useAppSelector((state) => state.mohalla)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    if (id) {
      dispatch(fetchMohallaById(id))
    }
  }, [dispatch, id])

  const handleDelete = async () => {
    try {
      await dispatch(deleteMohalla(id)).unwrap()
      toast.success('Mohalla deleted successfully')
      router.push('/mohallas')
    } catch (error) {
      toast.error('Failed to delete mohalla')
    }
  }

  if (loading || !currentMohalla) {
    return <LoadingState type="card" count={1} />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/mohallas')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Mohalla Details</h1>
            <p className="text-gray-500">{currentMohalla.sectorName}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/mohallas/${id}/edit`)}>
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
          <CardTitle>Mohalla Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">Sector Number</p>
              <p className="font-semibold">{currentMohalla.sectorNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Sector Name</p>
              <p className="font-semibold">{currentMohalla.sectorName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Houses</p>
              <p className="font-semibold">{currentMohalla.totalHouses}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Houses</p>
              <p className="font-semibold text-green-600">{currentMohalla.activeHouses}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Mohalla"
        description="Are you sure you want to delete this mohalla? This action cannot be undone."
        onConfirm={handleDelete}
      />
    </div>
  )
}
