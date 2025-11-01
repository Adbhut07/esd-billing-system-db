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

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      // Skip header rows and empty lines
      if (
        line.includes("Mohalla Number") ||
        line.includes("House Number") ||
        line === "" ||
        line.startsWith("+91")
      ) {
        continue
      }

      const parts = line.split(",").map((p) => p.trim())
      
      // Ensure we have at least mohalla number and house number
      if (parts.length >= 2 && parts[0] && parts[1]) {
        data.push({
          mohallaNumber: parts[0], // First column is Mohalla Number
          houseNumber: parts[1],   // Second column is House Number
          rawData: parts,          // Keep all columns for further processing
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
