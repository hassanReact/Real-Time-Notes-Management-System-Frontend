"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useRealTime } from "@/components/real-time-provider"
import { Wifi, WifiOff, Eye, Edit3 } from "lucide-react"

interface CollaborationIndicatorsProps {
  noteId?: string
}

export function CollaborationIndicators({ noteId }: CollaborationIndicatorsProps) {
  const { isConnected, onlineUsers } = useRealTime()
  const [activeUsers, setActiveUsers] = useState<typeof onlineUsers>([])

  useEffect(() => {
    // Filter users who are actively viewing/editing this note
    if (noteId) {
      setActiveUsers(onlineUsers.slice(0, 3)) // Simulate active users
    } else {
      setActiveUsers(onlineUsers)
    }
  }, [onlineUsers, noteId])

  return (
    <div className="flex items-center gap-2">
      {/* Connection Status */}
      <div className="flex items-center gap-1">
        {isConnected ? <Wifi className="h-4 w-4 text-primary" /> : <WifiOff className="h-4 w-4 text-destructive" />}
        <span className="text-xs text-muted-foreground">{isConnected ? "Connected" : "Offline"}</span>
      </div>

      {/* Active Users */}
      {activeUsers.length > 0 && (
        <div className="flex items-center gap-1">
          <div className="flex -space-x-2">
            {activeUsers.slice(0, 3).map((user) => (
              <Avatar key={user.id} className="h-6 w-6 border-2 border-background">
                <AvatarImage src={user.avatar || "/placeholder.svg"} />
                <AvatarFallback className="text-xs">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>

          {activeUsers.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{activeUsers.length - 3}
            </Badge>
          )}

          <span className="text-xs text-muted-foreground">{activeUsers.length} online</span>
        </div>
      )}
    </div>
  )
}


export function LiveCursors() {
  const { onlineUsers } = useRealTime()
  const [cursors, setCursors] = useState<Array<{ userId: string; x: number; y: number; name: string }>>([])

  useEffect(() => {
    // Simulate cursor movements
    const interval = setInterval(() => {
      const newCursors = onlineUsers.slice(0, 2).map((user) => ({
        userId: user.id,
        x: Math.random() * 800,
        y: Math.random() * 600,
        name: user.name,
      }))
      setCursors(newCursors)
    }, 3000)

    return () => clearInterval(interval)
  }, [onlineUsers])

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {cursors.map((cursor) => (
        <div
          key={cursor.userId}
          className="absolute transition-all duration-300 ease-out"
          style={{ left: cursor.x, top: cursor.y }}
        >
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-primary rounded-full border-2 border-white shadow-lg" />
            <Badge variant="default" className="text-xs whitespace-nowrap">
              {cursor.name}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  )
}

interface ActivityIndicatorProps {
  type: "viewing" | "editing"
  users: string[]
}

export function ActivityIndicator({ type, users }: ActivityIndicatorProps) {
  if (users.length === 0) return null

  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      {type === "editing" ? <Edit3 className="h-3 w-3 text-primary" /> : <Eye className="h-3 w-3" />}
      <span>{users.length === 1 ? `${users[0]} is ${type}` : `${users.length} users ${type}`}</span>
    </div>
  )
}
