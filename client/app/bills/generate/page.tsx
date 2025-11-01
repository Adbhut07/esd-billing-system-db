'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useAppDispatch } from '@/lib/redux/hooks'
import { generateBulkBills } from '@/lib/redux/slices/billSlice'
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

export default function GenerateBillPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    month: '',
    year: new Date().getFullYear().toString(),
    mohallaId: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.month || !formData.mohallaId) {
      toast.error("Please select a month and mohalla")
      return
    }

    setLoading(true)
    try {
      // Format month as YYYY-MM-DD (using first day of month)
      const monthDate = new Date(parseInt(formData.year), parseInt(formData.month) - 1, 1);
      const formattedMonth = monthDate.toISOString().split('T')[0]; // YYYY-MM-DD format

      const payload = {
        mohallaId: Number(formData.mohallaId),
        month: formattedMonth,
      }

      await dispatch(generateBulkBills(payload)).unwrap()
      toast.success('Bills generated successfully')
      router.push('/bills')
    } catch {
      toast.error('Failed to generate bills')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/bills')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Generate Bills</h1>
          <p className="text-gray-500">Generate bills for selected period and mohalla</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bill Generation</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="month">Month *</Label>
                <Select value={formData.month} onValueChange={(value: string) => setFormData({ ...formData, month: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {new Date(2024, i).toLocaleString('default', { month: 'long' })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Year *</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mohallaId">Mohalla *</Label>
                <Select value={formData.mohallaId} onValueChange={(value: string) => setFormData({ ...formData, mohallaId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select mohalla" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Vidyut Nagar</SelectItem>
                    <SelectItem value="2">Swet Nagar</SelectItem>
                    <SelectItem value="3">Prem Nagar</SelectItem>
                    <SelectItem value="4">Soami Nagar</SelectItem>
                    <SelectItem value="5">Karyavir Nagar</SelectItem>
                    <SelectItem value="6">Saran Ashram Nagar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.push('/bills')}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !formData.month || !formData.mohallaId}>
                {loading ? 'Generating...' : 'Generate Bills'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
