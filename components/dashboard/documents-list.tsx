"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, Trash2, Eye, Upload } from "lucide-react"

export function DocumentsList() {
  const [documents] = useState([
    {
      id: 1,
      name: "Police Report - Accident Scene",
      type: "PDF",
      date: "2024-01-15",
      size: "2.4 MB",
    },
    {
      id: 2,
      name: "Accident Photos - Front Damage",
      type: "JPEG",
      date: "2024-01-15",
      size: "1.8 MB",
    },
    {
      id: 3,
      name: "Insurance Card Scan",
      type: "PDF",
      date: "2024-01-10",
      size: "0.9 MB",
    },
    {
      id: 4,
      name: "Repair Estimate",
      type: "PDF",
      date: "2024-02-01",
      size: "1.2 MB",
    },
    {
      id: 5,
      name: "Medical Records",
      type: "PDF",
      date: "2024-02-05",
      size: "3.1 MB",
    },
  ])

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="p-6 sm:p-8 border-2 border-dashed border-border hover:border-accent transition-colors">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="w-16 h-16 rounded-lg bg-accent/10 flex items-center justify-center">
            <Upload className="w-8 h-8 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">Drag and drop files here</h3>
            <p className="text-muted-foreground text-sm">or click to browse from your computer</p>
          </div>
          <Button>Select Files</Button>
          <p className="text-xs text-muted-foreground pt-2">Supported formats: PDF, JPEG, PNG, DOCX. Max size: 10MB</p>
        </div>
      </Card>

      {/* Documents List */}
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground text-lg">Uploaded Documents</h3>
        <div className="space-y-3">
          {documents.map((doc) => (
            <Card key={doc.id} className="p-4 sm:p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground truncate">{doc.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {doc.type} • {doc.size} • {doc.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Eye className="w-4 h-4" />
                    <span className="hidden sm:inline">View</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Download</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
