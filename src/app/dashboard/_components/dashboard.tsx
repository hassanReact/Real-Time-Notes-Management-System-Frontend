"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Plus, Search, Share2, Activity, Clock, Users } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useNotes } from "@/hooks/use-notes"
import { healthService } from "@/lib/services"
import { useRouter } from "next/navigation"

interface ActivityItem {
  id: string
  type: "created" | "updated" | "shared"
  noteTitle: string
  timestamp: string
}

export function Dashboard() {
  const [mounted, setMounted] = useState(false)
  const [healthStatus, setHealthStatus] = useState<"healthy" | "warning" | "error">("healthy")
  const { user } = useAuth()
  const router = useRouter()

  const { data: notesData, isLoading: notesLoading } = useNotes({
    limit: 5,
    sortBy: "updatedAt",
    sortOrder: "desc",
  })


  const recentNotes: any[] = notesData?.data?.data?.data ? (notesData.data.data.data as unknown as any[]) : []

  const stats = {
    totalNotes: notesData?.data?.data?.meta?.total || 0,
    sharedNotes: recentNotes.filter((note: any) => note.visibility === "SHARED").length || 0,
    recentActivity: recentNotes.length || 0,
  }

  // Get activities from backend - for now show empty until backend provides activity endpoint
  const activities: ActivityItem[] = []

  useEffect(() => {
    setMounted(true)
    const checkHealth = async () => {
      try {
        await healthService.checkHealth()
        setHealthStatus("healthy")
      } catch (error) {
        console.error("[v0] Health check failed:", error)
        setHealthStatus("error")
      }
    }

    checkHealth()
    const interval = setInterval(checkHealth, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [])

  if (!mounted) return null

  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "created":
        return <Plus className="h-4 w-4 text-primary" />
      case "updated":
        return <FileText className="h-4 w-4 text-accent" />
      case "shared":
        return <Share2 className="h-4 w-4 text-chart-2" />
    }
  }


  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours} hours ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) return "1 day ago"
    return `${diffInDays} days ago`
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Notes</h1>
            </div>

          </div>
        </div>
      </header> */}

      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Welcome Message */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-balance mb-2">
            Welcome back, {user?.name || "User"}! 👋
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground text-pretty">
            You have {stats.recentActivity} recent activities and {stats.totalNotes} total notes.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-card-foreground">Total Notes</CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:pt-2">
              <div className="text-xl sm:text-2xl font-bold text-card-foreground">{notesLoading ? "..." : stats.totalNotes}</div>
              <p className="text-xs text-muted-foreground">Real-time from backend</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Shared Notes</CardTitle>
              <Users className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">{notesLoading ? "..." : stats.sharedNotes}</div>
              <p className="text-xs text-muted-foreground">Collaborative notes</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Recent Activity</CardTitle>
              <Activity className="h-4 w-4 text-chart-2" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">
                {notesLoading ? "..." : stats.recentActivity}
              </div>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Recent Notes */}
          <div className="lg:col-span-2">
            <Card className="bg-muted/30 border-border">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0">
                  <div>
                    <CardTitle className="text-lg sm:text-xl text-foreground">Recent Notes</CardTitle>
                    <CardDescription className="text-sm">Your latest notes and updates</CardDescription>
                  </div>
                  <Button
                    size="sm"
                    className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => router.push("/notes")}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Note
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {notesLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading notes...</div>
                ) : recentNotes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No notes yet. Create your first note to get started!
                  </div>
                ) : (
                  recentNotes.map((note: any) => (
                    <div
                      key={note.id}
                      className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-card border border-border hover:bg-card/80 transition-colors cursor-pointer"
                      onClick={() => router.push(`/notes/${note.id}`)}
                    >
                      <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                          <h3 className="font-medium text-card-foreground truncate">{note.title}</h3>
                          {note.visibility === "SHARED" && (
                            <Badge variant="secondary" className="text-xs w-fit">
                              <Share2 className="h-3 w-3 mr-1" />
                              Shared
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-2">
                          {note.description.substring(0, 100)}...
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatRelativeTime(note.updatedAt)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Activity Feed */}
          <div>
            <Card className="bg-sidebar border-sidebar-border">
              <CardHeader>
                <CardTitle className="text-sidebar-foreground">Activity Feed</CardTitle>
                <CardDescription className="text-sidebar-foreground/70">Recent changes and updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-sidebar-accent/10 flex items-center justify-center flex-shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-sidebar-foreground">
                        <span className="font-medium">
                          {activity.type === "created" ? "Created" : activity.type === "updated" ? "Updated" : "Shared"}
                        </span>{" "}
                        <span className="text-sidebar-foreground/70">&quot;{activity.noteTitle}&quot;</span>
                      </p>
                      <p className="text-xs text-sidebar-foreground/50">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
                  </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="mt-4 sm:mt-6 bg-card border-border">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg text-card-foreground">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 space-y-2 sm:space-y-3">
                <Button
                  className="w-full justify-start bg-primary text-primary-foreground hover:bg-primary/90 h-auto py-2.5 px-3 sm:py-3 sm:px-4 text-sm"
                  onClick={() => router.push("/notes")}
                >
                  <Plus className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">Create New Note</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent h-auto py-2.5 px-3 sm:py-3 sm:px-4 text-sm"
                  onClick={() => router.push("/notes")}
                >
                  <Search className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">Search Notes</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent h-auto py-2.5 px-3 sm:py-3 sm:px-4 text-sm"
                  onClick={() => router.push("/shared")}
                >
                  <Share2 className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">View Shared Notes</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
