'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { fetchMohallaById, updateMohalla } from '@/lib/redux/slices/mohallaSlice'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingState } from '@/components/shared/LoadingState'
import { toast } from 'sonner'

export default function EditMohallaPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const dispatch = useAppDispatch()
  const { currentMohalla, loading } = useAppSelector((state) => state.mohalla)
  const [formData, setFormData] = useState<any>({})

  useEffect(() => {
    if (id) {
      dispatch(fetchMohallaById(id))
    }
  }, [])

  useEffect(() => {
    if (currentMohalla) {
      setFormData(currentMohalla)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await dispatch(updateMohalla({ id, data: formData })).unwrap()
      toast.success('Mohalla updated successfully')
      router.push(`/mohallas/${id}`)
    } catch (error) {
      toast.error('Failed to update mohalla')
    }
  }

  if (loading || !currentMohalla) {
    return <LoadingState type="card" count={1} />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push(`/mohallas/${id}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Mohalla</h1>
          <p className="text-gray-500">Update mohalla information</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mohalla Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Sector Number</Label>
                <Input
                  value={formData.sectorNumber || ''}
                  onChange={(e) => setFormData({ ...formData, sectorNumber: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Sector Name</Label>
                <Input
                  value={formData.sectorName || ''}
                  onChange={(e) => setFormData({ ...formData, sectorName: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.push(`/mohallas/${id}`)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
