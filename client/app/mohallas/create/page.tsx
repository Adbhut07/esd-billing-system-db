'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useAppDispatch } from '@/lib/redux/hooks'
import { createMohalla } from '@/lib/redux/slices/mohallaSlice'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function CreateMohallaPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    sectorNumber: '',
    sectorName: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await dispatch(createMohalla(formData)).unwrap()
      toast.success('Mohalla created successfully')
      router.push('/mohallas')
    } catch (error) {
      toast.error('Failed to create mohalla')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/mohallas')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New Mohalla</h1>
          <p className="text-gray-500">Add a new sector/mohalla</p>
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
                <Label htmlFor="sectorNumber">Sector Number *</Label>
                <Input
                  id="sectorNumber"
                  value={formData.sectorNumber}
                  onChange={(e) => setFormData({ ...formData, sectorNumber: e.target.value })}
                  placeholder="e.g., A, B, C"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sectorName">Sector Name *</Label>
                <Input
                  id="sectorName"
                  value={formData.sectorName}
                  onChange={(e) => setFormData({ ...formData, sectorName: e.target.value })}
                  placeholder="e.g., Sector A"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.push('/mohallas')}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Mohalla'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
