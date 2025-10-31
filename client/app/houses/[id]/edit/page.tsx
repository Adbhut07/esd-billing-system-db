'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { fetchHouseById, updateHouse } from '@/lib/redux/slices/houseSlice'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LoadingState } from '@/components/shared/LoadingState'
import { toast } from 'sonner'

export default function EditHousePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const dispatch = useAppDispatch()
  const { currentHouse, loading } = useAppSelector((state) => state.house)
  const [formData, setFormData] = useState<any>({})

  useEffect(() => {
    if (id) {
      dispatch(fetchHouseById(id))
    }
  }, [])

  useEffect(() => {
    if (currentHouse) {
      setFormData(currentHouse)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await dispatch(updateHouse({ id, data: formData })).unwrap()
      toast.success('House updated successfully')
      router.push(`/houses/${id}`)
    } catch (error) {
      toast.error('Failed to update house')
    }
  }

  if (loading || !currentHouse) {
    return <LoadingState type="card" count={1} />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push(`/houses/${id}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit House</h1>
          <p className="text-gray-500">Update house information</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>House Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Sector</Label>
                <Select value={formData.sector || ''} onValueChange={(value: string) => setFormData({ ...formData, sector: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Sector A</SelectItem>
                    <SelectItem value="B">Sector B</SelectItem>
                    <SelectItem value="C">Sector C</SelectItem>
                    <SelectItem value="D">Sector D</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>House Number</Label>
                <Input
                  value={formData.houseNumber || ''}
                  onChange={(e) => setFormData({ ...formData, houseNumber: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Consumer Code</Label>
                <Input
                  value={formData.consumerCode || ''}
                  onChange={(e) => setFormData({ ...formData, consumerCode: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Licensee Name</Label>
                <Input
                  value={formData.licenseeName || ''}
                  onChange={(e) => setFormData({ ...formData, licenseeName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Department</Label>
                <Input
                  value={formData.department || ''}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Mobile Number</Label>
                <Input
                  value={formData.mobileNumber || ''}
                  onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Electricity Meter</Label>
                <Input
                  value={formData.electricityMeterNumber || ''}
                  onChange={(e) => setFormData({ ...formData, electricityMeterNumber: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Water Meter</Label>
                <Input
                  value={formData.waterMeterNumber || ''}
                  onChange={(e) => setFormData({ ...formData, waterMeterNumber: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>License Fee</Label>
                <Input
                  type="number"
                  value={formData.licenseFee || ''}
                  onChange={(e) => setFormData({ ...formData, licenseFee: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Residence Fee</Label>
                <Input
                  type="number"
                  value={formData.residenceFee || ''}
                  onChange={(e) => setFormData({ ...formData, residenceFee: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.push(`/houses/${id}`)}>
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
