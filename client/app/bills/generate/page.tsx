'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
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
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

interface GenerateResults {
  success: number
  failed: number
  skipped: number
  errors: Array<{
    houseNumber: string
    error: string
  }>
  generated: Array<{
    houseNumber: string
    readingId: number
    totalBill: number
  }>
}

export default function GenerateBillPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<GenerateResults | null>(null)
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
    setResults(null)
    
    try {
      // Format month as YYYY-MM-01 (first day of month)
      const year = parseInt(formData.year)
      const month = parseInt(formData.month)
      
      // Pad month with leading zero if needed
      const monthStr = month.toString().padStart(2, '0')
      const formattedMonth = `${year}-${monthStr}-01`

      const payload = {
        mohallaId: Number(formData.mohallaId),
        month: formattedMonth,
      }

      const response = await dispatch(generateBulkBills(payload)).unwrap()
      
      // Handle response structure
      const data = response.data || response
      setResults(data)
      
      if (data.success > 0) {
        toast.success(`Bills generated successfully: ${data.success} bills created`)
      }
      
      if (data.failed > 0) {
        toast.warning(`${data.failed} bills failed to generate`)
      }
      
      if (data.skipped > 0) {
        toast.info(`${data.skipped} bills were skipped`)
      }
    } catch (error) {
      console.error('Bill generation error:', error)
      toast.error('Failed to generate bills')
    } finally {
      setLoading(false)
    }
  }

  const mohallaOptions = [
    { value: '3', label: 'Vidyut Nagar' },
    { value: '2', label: 'Swet Nagar' },
    { value: '1', label: 'Prem Nagar' },
    { value: '4', label: 'Soami Nagar' },
    { value: '5', label: 'Karyavir Nagar' },
    { value: '6', label: 'Saran Ashram Nagar' },
  ]

  const getSelectedMohallaName = () => {
    const selected = mohallaOptions.find(m => m.value === formData.mohallaId)
    return selected ? selected.label : 'Unknown'
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
                <Select 
                  value={formData.month} 
                  onValueChange={(value: string) => setFormData({ ...formData, month: value })}
                  disabled={loading}
                >
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
                  disabled={loading}
                  min="2020"
                  max="2030"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mohallaId">Mohalla *</Label>
                <Select 
                  value={formData.mohallaId} 
                  onValueChange={(value: string) => setFormData({ ...formData, mohallaId: value })}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select mohalla" />
                  </SelectTrigger>
                  <SelectContent>
                    {mohallaOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push('/bills')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading || !formData.month || !formData.mohallaId}
              >
                {loading ? 'Generating...' : 'Generate Bills'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results Summary */}
      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Generation Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Successful</p>
                  <p className="text-2xl font-bold text-green-700">{results.success}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
                <XCircle className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Failed</p>
                  <p className="text-2xl font-bold text-red-700">{results.failed}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg">
                <AlertCircle className="h-8 w-8 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Skipped</p>
                  <p className="text-2xl font-bold text-yellow-700">{results.skipped || 0}</p>
                </div>
              </div>
            </div>

            {/* Generated Bills */}
            {results.generated && results.generated.length > 0 && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Successfully Generated Bills</AlertTitle>
                <AlertDescription className="text-green-700">
                  <div className="mt-2 space-y-1">
                    {results.generated.slice(0, 10).map((item, idx) => (
                      <div key={idx} className="text-sm">
                        House {item.houseNumber} - ₹{item.totalBill.toFixed(2)}
                      </div>
                    ))}
                    {results.generated.length > 10 && (
                      <p className="text-sm italic">
                        ... and {results.generated.length - 10} more
                      </p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Errors */}
            {results.errors && results.errors.length > 0 && (
              <Alert className="border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800">Failed Bills</AlertTitle>
                <AlertDescription className="text-red-700">
                  <div className="mt-2 space-y-1 max-h-60 overflow-y-auto">
                    {results.errors.map((error, idx) => (
                      <div key={idx} className="text-sm">
                        <span className="font-semibold">House {error.houseNumber}:</span> {error.error}
                      </div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setResults(null)}
              >
                Clear Results
              </Button>
              <Button 
                onClick={() => router.push('/bills')}
              >
                View All Bills
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}