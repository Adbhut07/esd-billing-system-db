'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { createHouse } from '@/lib/redux/slices/houseSlice'
import { fetchMohallas } from '@/lib/redux/slices/mohallaSlice'
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
import { toast } from 'sonner'
import { useEffect, useState } from 'react'

export default function CreateHousePage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { loading } = useAppSelector((state) => state.house)
  const { mohallas } = useAppSelector((state) => state.mohalla)
  const [formData, setFormData] = useState({
    mohallaId: '',
    houseNumber: '',
    consumerCode: '',
    licenseeName: '',
    department: '',
    mobileNumber: '',
    email: '',
    electricityMeterNumber: '',
    waterMeterNumber: '',
    licenseFee: '',
    residenceFee: '',
  })

  useEffect(() => {
    dispatch(fetchMohallas({ page: 1, limit: 100 }))
  }, [dispatch])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const submitData = {
        ...formData,
        mohallaId: Number(formData.mohallaId),
        licenseFee: Number(formData.licenseFee) || 0,
        residenceFee: Number(formData.residenceFee) || 0,
      }
      await dispatch(createHouse(submitData)).unwrap()
      toast.success('House created successfully')
      router.push('/houses')
    } catch (error) {
      console.error('Create house error:', error)
      toast.error('Failed to create house')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/houses')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New House</h1>
          <p className="text-gray-500">Add a new house to the system</p>
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
                <Label htmlFor="mohallaId">Mohalla *</Label>
                <Select value={formData.mohallaId} onValueChange={(value: string) => setFormData({ ...formData, mohallaId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select mohalla" />
                  </SelectTrigger>
                  <SelectContent>
                    {mohallas.map((mohalla) => (
                      <SelectItem key={mohalla.id} value={mohalla.id.toString()}>
                        {mohalla.sectorName} ({mohalla.sectorNumber})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="houseNumber">House Number *</Label>
                <Input
                  id="houseNumber"
                  value={formData.houseNumber}
                  onChange={(e) => setFormData({ ...formData, houseNumber: e.target.value })}
                  placeholder="Enter house number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="consumerCode">Consumer Code *</Label>
                <Input
                  id="consumerCode"
                  value={formData.consumerCode}
                  onChange={(e) => setFormData({ ...formData, consumerCode: e.target.value })}
                  placeholder="Enter consumer code"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="licenseeName">Licensee Name *</Label>
                <Input
                  id="licenseeName"
                  value={formData.licenseeName}
                  onChange={(e) => setFormData({ ...formData, licenseeName: e.target.value })}
                  placeholder="Enter licensee name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="Enter department"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobileNumber">Mobile Number</Label>
                <Input
                  id="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                  placeholder="Enter mobile number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="electricityMeterNumber">Electricity Meter</Label>
                <Input
                  id="electricityMeterNumber"
                  value={formData.electricityMeterNumber}
                  onChange={(e) => setFormData({ ...formData, electricityMeterNumber: e.target.value })}
                  placeholder="Enter meter number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="waterMeterNumber">Water Meter</Label>
                <Input
                  id="waterMeterNumber"
                  value={formData.waterMeterNumber}
                  onChange={(e) => setFormData({ ...formData, waterMeterNumber: e.target.value })}
                  placeholder="Enter meter number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="licenseFee">License Fee</Label>
                <Input
                  id="licenseFee"
                  type="number"
                  value={formData.licenseFee}
                  onChange={(e) => setFormData({ ...formData, licenseFee: e.target.value })}
                  placeholder="Enter license fee"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="residenceFee">Residence Fee</Label>
                <Input
                  id="residenceFee"
                  type="number"
                  value={formData.residenceFee}
                  onChange={(e) => setFormData({ ...formData, residenceFee: e.target.value })}
                  placeholder="Enter residence fee"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.push('/houses')}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save House'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
