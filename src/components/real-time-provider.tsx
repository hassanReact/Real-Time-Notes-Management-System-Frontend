"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useToast } from "@/hooks/use-toast"

interface RealTimeContextType {
  isConnected: boolean
  onlineUsers: OnlineUser[]
  notifications: Notification[]
  sendMessage: (message: any) => void
  joinRoom: (roomId: string) => void
  leaveRoom: (roomId: string) => void
}

interface OnlineUser {
  id: string
  name: string
  avatar?: string
  cursor?: { x: number; y: number }
  selection?: { start: number; end: number }
}

interface Notification {
  id: string
  type: "user_joined" | "user_left" | "note_updated" | "comment_added"
  message: string
  timestamp: Date
  userId?: string
  noteId?: string
}

const RealTimeContext = createContext<RealTimeContextType | null>(null)

export function useRealTime() {
  const context = useContext(RealTimeContext)
  if (!context) {
    throw new Error("useRealTime must be used within a RealTimeProvider")
  }
  return context
}

interface RealTimeProviderProps {
  children: ReactNode
}

export function RealTimeProvider({ children }: RealTimeProviderProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Simulate WebSocket connection
    const mockSocket = {
      send: (data: string) => {
        console.log("[v0] Mock WebSocket send:", data)
      },
      close: () => {
        console.log("[v0] Mock WebSocket closed")
      },
    } as WebSocket

    setSocket(mockSocket)
    setIsConnected(true)

    // Simulate initial online users
    setOnlineUsers([
      {
        id: "1",
        name: "Jane Smith",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      {
        id: "2",
        name: "Mike Johnson",
        avatar: "/placeholder.svg?height=32&width=32",
      },
    ])

    // Simulate real-time events
    const interval = setInterval(() => {
      const events = [
        {
          type: "user_joined" as const,
          user: { id: "3", name: "Sarah Wilson" },
        },
        {
          type: "note_updated" as const,
          noteId: "1",
          user: "Jane Smith",
        },
        {
          type: "comment_added" as const,
          noteId: "1",
          user: "Mike Johnson",
        },
      ]

      const randomEvent = events[Math.floor(Math.random() * events.length)]

      if (randomEvent.type === "user_joined") {
        setOnlineUsers((prev) => {
          if (prev.find((u) => u.id === randomEvent.user.id)) return prev
          return [...prev, randomEvent.user]
        })

        const notification: Notification = {
          id: Date.now().toString(),
          type: "user_joined",
          message: `${randomEvent.user.name} joined the workspace`,
          timestamp: new Date(),
        }

        setNotifications((prev) => [notification, ...prev.slice(0, 9)])

        toast({
          title: "User joined",
          description: `${randomEvent.user.name} is now online`,
        })
      } else if (randomEvent.type === "note_updated") {
        const notification: Notification = {
          id: Date.now().toString(),
          type: "note_updated",
          message: `${randomEvent.user} updated a note`,
          timestamp: new Date(),
          noteId: randomEvent.noteId,
        }

        setNotifications((prev) => [notification, ...prev.slice(0, 9)])
      } else if (randomEvent.type === "comment_added") {
        const notification: Notification = {
          id: Date.now().toString(),
          type: "comment_added",
          message: `${randomEvent.user} added a comment`,
          timestamp: new Date(),
          noteId: randomEvent.noteId,
        }

        setNotifications((prev) => [notification, ...prev.slice(0, 9)])
      }
    }, 15000) // Every 15 seconds

    return () => {
      clearInterval(interval)
      mockSocket.close()
      setIsConnected(false)
    }
  }, [toast])

  const sendMessage = (message: any) => {
    if (socket && isConnected) {
      socket.send(JSON.stringify(message))
    }
  }

  const joinRoom = (roomId: string) => {
    sendMessage({ type: "join_room", roomId })
  }

  const leaveRoom = (roomId: string) => {
    sendMessage({ type: "leave_room", roomId })
  }

  return (
    <RealTimeContext.Provider
      value={{
        isConnected,
        onlineUsers,
        notifications,
        sendMessage,
        joinRoom,
        leaveRoom,
      }}
    >
      {children}
    </RealTimeContext.Provider>
  )
}
