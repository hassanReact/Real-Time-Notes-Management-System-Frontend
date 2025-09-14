"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, FileText, Activity, AlertTriangle, CheckCircle, Clock, BarChart3 } from "lucide-react"
import { useAdminStats, useAdminRecentActivity } from "@/hooks/use-admin"


const quickActions = [
  { name: "Manage Users", href: "/admin/users", icon: Users, color: "bg-blue-500" },
  { name: "Review Content", href: "/admin/content", icon: FileText, color: "bg-orange-500" },
  { name: "View Analytics", href: "/admin/analytics", icon: BarChart3, color: "bg-green-500" },
  { name: "System Settings", href: "/admin/settings", icon: Activity, color: "bg-purple-500" },
]

export function AdminDashboard() {
  const { data: statsData, isLoading: statsLoading } = useAdminStats()
  const { data: activityData, isLoading: activityLoading } = useAdminRecentActivity()

  console.log("Stats Data:", statsData)
  console.log("Activity Data:", activityData)

  const stats = statsData?.data?.data || {
    users: { total: 0, active: 0, inactive: 0 },
    notes: { total: 0, public: 0, shared: 0, private: 0 },
    notifications: { total: 0, unread: 0, read: 0 }
  }

  const recentActivity = activityData?.data.data || { recentNotes: [], recentUsers: [] }
  console.log(recentActivity.recentNotes)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage your Notes Management System</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-green-600 border-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            System Healthy
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsLoading ? "..." : stats.users.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsLoading ? "..." : stats.users.active.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8%</span> from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsLoading ? "..." : stats.notes.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+23%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged Content</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{statsLoading ? "..." : stats.notifications.unread}</div>
            <p className="text-xs text-muted-foreground">Unread notifications</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            {quickActions.map((action) => (
              <Button key={action.name} variant="outline" className="h-20 flex-col space-y-2 bg-transparent" asChild>
                <a href={action.href}>
                  <div className={`p-2 rounded-lg ${action.color}`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm font-medium">{action.name}</span>
                </a>
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system events and actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activityLoading ? (
              <div className="text-center py-4 text-muted-foreground">Loading activity...</div>
            ) : (
              <>
                {/* Recent Notes */}
                {recentActivity.recentNotes?.map((note: any) => (
                  <div key={note.id} className="flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full mt-2 bg-blue-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        New note: &quot;{note.title}&quot; by {note.author.name}
                      </p>

                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Recent Users */}
                {recentActivity.recentUsers?.map((user: any) => (
                  <div key={user.id} className="flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full mt-2 bg-green-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        New user: {user.name} ({user.email})
                      </p>
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {(!recentActivity.recentNotes?.length && !recentActivity.recentUsers?.length) && (
                  <div className="text-center py-4 text-muted-foreground">No recent activity</div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>Current system health and performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{statsLoading ? "..." : "99.9%"}</div>
              <p className="text-sm text-muted-foreground">Uptime</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">2.3s</div>
              <p className="text-sm text-muted-foreground">Avg Response Time</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">45GB</div>
              <p className="text-sm text-muted-foreground">Storage Used</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
