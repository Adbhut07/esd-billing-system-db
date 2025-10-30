"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CSVUploaderProps {
  onFileUpload: (data: any[]) => void
  accept?: string
}

export function CSVUploader({ onFileUpload, accept = ".csv,.xlsx" }: CSVUploaderProps) {
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const parseCSV = (text: string) => {
    const lines = text.split("\n").filter((line) => line.trim())
    const data: any[] = []
    let currentMohalla = ""

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      // Check if this is a mohalla header (lines without commas or with specific patterns)
      if (
        line &&
        !line.includes(",") &&
        line !== "House Number, Import, Export, MD" &&
        line !== "House Number, Water Reading"
      ) {
        currentMohalla = line
        continue
      }

      // Skip header rows
      if (line.includes("House Number") || line === "" || line.startsWith("+91")) {
        continue
      }

      const parts = line.split(",").map((p) => p.trim())
      if (parts.length > 0 && parts[0]) {
        data.push({
          houseNumber: parts[0],
          mohalla: currentMohalla,
          rawData: parts,
        })
      }
    }

    return data
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)

    try {
      const text = await file.text()
      const data = parseCSV(text)

      if (data.length === 0) {
        setError("No valid data found in the file")
        return
      }

      onFileUpload(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse file")
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-4">
        <input ref={fileInputRef} type="file" accept={accept} onChange={handleFileChange} className="hidden" />
        <Button type="button" onClick={() => fileInputRef.current?.click()} variant="outline">
          Choose File
        </Button>
        <span className="text-sm text-gray-600">{fileInputRef.current?.files?.[0]?.name || "No file selected"}</span>
      </div>
    </div>
  )
}
