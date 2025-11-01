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
  | 'Not Generated'

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
      case 'not generated':
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
        return 'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-200'
      case 'pending':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-100 dark:bg-orange-900 dark:text-orange-200'
      case 'overdue':
        return 'bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-200'
      case 'generated':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-200'
      case 'partially paid':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-900 dark:text-purple-200'
      case 'not generated':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200'
      case 'active':
        return 'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-200'
      case 'inactive':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200'
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
