'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-500">Configure system settings</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
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

        <Card>
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
