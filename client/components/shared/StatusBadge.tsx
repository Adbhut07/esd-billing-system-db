'use client'

import { Badge } from '@/components/ui/badge'

type Status =
  | 'Paid'
  | 'Pending'
  | 'Overdue'
  | 'Generated'
  | 'Partially Paid'
  | 'Active'
  | 'Inactive'

interface StatusBadgeProps {
  status: Status | boolean | string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  // Handle boolean status
  if (typeof status === 'boolean') {
    return (
      <Badge variant={status ? 'default' : 'secondary'}>
        {status ? 'Active' : 'Inactive'}
      </Badge>
    )
  }

  const getVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'active':
        return 'default'
      case 'pending':
      case 'generated':
        return 'secondary'
      case 'overdue':
        return 'destructive'
      case 'partially paid':
        return 'outline'
      case 'inactive':
        return 'secondary'
      default:
        return 'default'
    }
  }

  const getColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800 hover:bg-green-100'
      case 'pending':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-100'
      case 'overdue':
        return 'bg-red-100 text-red-800 hover:bg-red-100'
      case 'generated':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100'
      case 'partially paid':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-100'
      case 'active':
        return 'bg-green-100 text-green-800 hover:bg-green-100'
      case 'inactive':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100'
      default:
        return ''
    }
  }

  return (
    <Badge variant={getVariant(status)} className={getColor(status)}>
      {status}
    </Badge>
  )
}
