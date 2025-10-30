"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface MonthSelectorProps {
  onMonthChange: (month: string) => void
  defaultMonth?: string
}

export function MonthSelector({ onMonthChange, defaultMonth }: MonthSelectorProps) {
  const currentDate = new Date()
  const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`

  const [selectedMonth, setSelectedMonth] = useState(defaultMonth || currentMonth)

  const handleChange = (value: string) => {
    setSelectedMonth(value)
    onMonthChange(value)
  }

  // Generate last 12 months
  const months = []
  for (let i = 0; i < 12; i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
    const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    const label = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    })
    months.push({ value: monthStr, label })
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Select Month</label>
      <Select value={selectedMonth} onValueChange={handleChange}>
        <SelectTrigger className="w-full md:w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {months.map((month) => (
            <SelectItem key={month.value} value={month.value}>
              {month.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
