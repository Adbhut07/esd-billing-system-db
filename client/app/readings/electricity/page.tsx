"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import type { RootState } from "@/lib/redux/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CSVUploader } from "@/components/readings/csv-uploader"
import { MonthSelector } from "@/components/readings/month-selector"
import { ReadingsTable } from "@/components/readings/readings-table"
import Link from "next/link"

interface ElectricityReading {
  id: string
  houseNumber: string
  mohalla: string
  importReading: string
  exportReading: string
  maxDemand: string
}

export default function ElectricityReadingsPage() {
  const router = useRouter()
  const { isAuthenticated, accessToken } = useSelector((state: RootState) => state.auth)
  const [month, setMonth] = useState("")
  const [readings, setReadings] = useState<ElectricityReading[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
    }
    const currentDate = new Date()
    const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`
    setMonth(currentMonth)
  }, [isAuthenticated, router])

  const handleFileUpload = (data: any[]) => {
    const formattedReadings: ElectricityReading[] = data.map((row, index) => ({
      id: `${row.houseNumber}-${index}`,
      houseNumber: row.houseNumber,
      mohalla: row.mohalla,
      importReading: row.rawData[1] || "",
      exportReading: row.rawData[2] || "",
      maxDemand: row.rawData[3] || "",
    }))
    setReadings(formattedReadings)
    setError(null)
  }

  const handleSave = async () => {
    if (!month || readings.length === 0) {
      setError("Please select a month and upload readings")
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Map mohalla names to numbers
      const mohallaMap: Record<string, string> = {
        "Prem Nagar": "3",
        "Vidyut Nagar": "1",
        "Swet Nagar": "2",
        "Soami Nagar": "4",
        "Karyavir Nagar": "5",
        "Saran Ashram Nagar": "6",
      }

      const payload = {
        month,
        readings: readings
          .filter((r) => r.importReading || r.exportReading || r.maxDemand)
          .map((r) => ({
            houseNumber: r.houseNumber,
            mohallaNumber: mohallaMap[r.mohalla] || "0",
            importReading: r.importReading ? Number.parseInt(r.importReading) : null,
            exportReading: r.exportReading ? Number.parseInt(r.exportReading) : null,
            maxDemand: r.maxDemand ? Number.parseFloat(r.maxDemand) : null,
          })),
      }

      const response = await fetch("http://localhost:3000/api/electricity/bulk-upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Upload failed")
      }

      setSuccess("Electricity readings uploaded successfully!")
      setReadings([])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Electricity Readings</h1>
            <p className="text-sm text-gray-600">Upload and manage electricity meter readings</p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Upload Electricity Readings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MonthSelector onMonthChange={setMonth} defaultMonth={month} />
              <CSVUploader onFileUpload={handleFileUpload} />
            </div>

            {readings.length > 0 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Readings ({readings.length})</h2>
                  <Button onClick={handleSave} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                    {loading ? "Uploading..." : "Save & Upload"}
                  </Button>
                </div>

                <ReadingsTable
                  data={readings}
                  columns={[
                    { key: "houseNumber", label: "House Number" },
                    { key: "importReading", label: "Import" },
                    { key: "exportReading", label: "Export" },
                    { key: "maxDemand", label: "Max Demand" },
                  ]}
                  onDataChange={(data) => setReadings(data as ElectricityReading[])}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
