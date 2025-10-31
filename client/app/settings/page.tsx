'use client'

import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { fetchCharges } from '@/lib/redux/slices/chargesSlice'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingState } from '@/components/shared/LoadingState'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { charges, loading } = useAppSelector((state) => state.charges)

  useEffect(() => {
    dispatch(fetchCharges())
  }, [dispatch])

  if (loading) {
    return <LoadingState type="card" count={3} />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-500">Configure system settings and charges</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>System Charges</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {charges && (
              <>
                <div>
                  <p className="text-sm text-gray-600">Fixed Charge</p>
                  <p className="text-lg font-semibold">₹{charges.fixedCharge}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Electricity Charge</p>
                  <p className="text-lg font-semibold">₹{charges.electricityCharge}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Water Charge</p>
                  <p className="text-lg font-semibold">₹{charges.waterCharge}</p>
                </div>
                <Button className="w-full">Edit Charges</Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">System Name</p>
              <p className="text-lg font-semibold">ESD Billing System</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Financial Year Start</p>
              <p className="text-lg font-semibold">April</p>
            </div>
            <Button className="w-full">Edit Settings</Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Audit Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline"
              className="w-full"
              onClick={() => router.push('/settings/audit-log')}
            >
              View Audit Logs
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
