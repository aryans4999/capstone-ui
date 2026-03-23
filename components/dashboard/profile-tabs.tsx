"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, Bell, CheckCheck } from "lucide-react"

export function ProfileTabs() {
  const [activeTab, setActiveTab] = useState("claims")

  const claims = [
    {
      id: "CLM-2024-0001",
      summary: "Rear-end collision on Highway 101",
      status: "Approved",
      statusColor: "bg-green-100 text-green-800",
      date: "2024-01-15",
    },
    {
      id: "CLM-2024-0002",
      summary: "Parking lot damage - hit and run",
      status: "In Review",
      statusColor: "bg-blue-100 text-blue-800",
      date: "2024-02-20",
    },
    {
      id: "CLM-2024-0003",
      summary: "Hail damage to windshield",
      status: "Pending",
      statusColor: "bg-yellow-100 text-yellow-800",
      date: "2024-03-10",
    },
  ]

  const notifications = [
    {
      id: 1,
      title: "Claim CLM-2024-0001 Approved",
      description: "Your rear-end collision claim has been approved. Payment will be processed within 24 hours.",
      icon: CheckCheck,
      timestamp: "2 hours ago",
      read: false,
    },
    {
      id: 2,
      title: "Document Request for CLM-2024-0002",
      description: "Please upload the police report for your hit and run claim.",
      icon: Bell,
      timestamp: "1 day ago",
      read: false,
    },
    {
      id: 3,
      title: "CLM-2024-0003 Status Update",
      description: "Your hail damage claim is now being reviewed by our adjusters.",
      icon: Clock,
      timestamp: "3 days ago",
      read: true,
    },
    {
      id: 4,
      title: "Welcome to Aeviox AI",
      description: "Your account has been successfully created. Start filing claims today!",
      icon: CheckCircle,
      timestamp: "1 week ago",
      read: true,
    },
  ]

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="claims">Past Claims</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>

      <TabsContent value="claims" className="space-y-4">
        {claims.map((claim) => (
          <Card key={claim.id} className="p-4 sm:p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-foreground">{claim.id}</h3>
                  <Badge className={claim.statusColor}>{claim.status}</Badge>
                </div>
                <p className="text-muted-foreground">{claim.summary}</p>
                <p className="text-sm text-muted-foreground">Filed: {claim.date}</p>
              </div>
            </div>
          </Card>
        ))}
      </TabsContent>

      <TabsContent value="notifications" className="space-y-4">
        {notifications.map((notification) => {
          const Icon = notification.icon
          return (
            <Card
              key={notification.id}
              className={`p-4 sm:p-6 border-l-4 transition-all ${
                notification.read ? "border-l-muted" : "border-l-accent"
              }`}
            >
              <div className="flex gap-4">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${notification.read ? "bg-muted" : "bg-accent/10"}`}
                >
                  <Icon className={`w-4 h-4 ${notification.read ? "text-muted-foreground" : "text-accent"}`} />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <h3 className="font-semibold text-foreground">{notification.title}</h3>
                    <span className="text-xs text-muted-foreground">{notification.timestamp}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{notification.description}</p>
                </div>
              </div>
            </Card>
          )
        })}
      </TabsContent>
    </Tabs>
  )
}
