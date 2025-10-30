"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Reading {
  id: string
  houseNumber: string
  mohalla: string
  [key: string]: any
}

interface ReadingsTableProps {
  data: Reading[]
  columns: { key: string; label: string }[]
  onDataChange: (data: Reading[]) => void
}

export function ReadingsTable({ data, columns, onDataChange }: ReadingsTableProps) {
  const [editingCell, setEditingCell] = useState<string | null>(null)

  const handleCellChange = (id: string, key: string, value: string) => {
    const updatedData = data.map((row) => (row.id === id ? { ...row, [key]: value } : row))
    onDataChange(updatedData)
  }

  const handleCellBlur = () => {
    setEditingCell(null)
  }

  const groupedData = data.reduce(
    (acc, row) => {
      if (!acc[row.mohalla]) {
        acc[row.mohalla] = []
      }
      acc[row.mohalla].push(row)
      return acc
    },
    {} as Record<string, Reading[]>,
  )

  return (
    <div className="space-y-6">
      {Object.entries(groupedData).map(([mohalla, rows]) => (
        <div key={mohalla} className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">{mohalla}</h3>
          <div className="overflow-x-auto border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  {columns.map((col) => (
                    <TableHead key={col.key} className="font-semibold">
                      {col.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id} className="hover:bg-gray-50">
                    {columns.map((col) => (
                      <TableCell key={`${row.id}-${col.key}`}>
                        {col.key === "houseNumber" ? (
                          <span className="font-medium">{row[col.key]}</span>
                        ) : (
                          <Input
                            type="text"
                            value={row[col.key] || ""}
                            onChange={(e) => handleCellChange(row.id, col.key, e.target.value)}
                            onFocus={() => setEditingCell(`${row.id}-${col.key}`)}
                            onBlur={handleCellBlur}
                            className="h-8 text-sm"
                          />
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ))}
    </div>
  )
}
