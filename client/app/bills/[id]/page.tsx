'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { fetchBillById } from '@/lib/redux/slices/billSlice'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { LoadingState } from '@/components/shared/LoadingState'

export default function BillDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const dispatch = useAppDispatch()
  const { currentBill, loading } = useAppSelector((state) => state.bill)

  useEffect(() => {
    if (id) {
      dispatch(fetchBillById(id))
    }
  }, [dispatch, id])

  if (loading || !currentBill) {
    return <LoadingState type="card" count={2} />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/bills')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Bill Details</h1>
          <p className="text-gray-500">Bill ID: {id}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Bill Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Bill ID</p>
              <p className="font-semibold">{(currentBill as any)._id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">House ID</p>
              <p className="font-semibold">{currentBill.houseId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Month/Year</p>
              <p className="font-semibold">{currentBill.month}/{currentBill.year}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <StatusBadge status={(currentBill as any).status || 'Pending'} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Amount Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Bill 1 Amount</p>
              <p className="font-semibold">₹{currentBill.bill1Amount || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Bill 2 Amount</p>
              <p className="font-semibold">₹{currentBill.bill2Amount || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="text-lg font-bold">₹{currentBill.totalAmount || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Paid Amount</p>
              <p className="font-semibold text-green-600">₹{currentBill.paidAmount || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
