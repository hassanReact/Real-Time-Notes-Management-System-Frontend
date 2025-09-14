"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { io, type Socket } from "socket.io-client"
import { toast } from "sonner"
import { useAuth } from "@/hooks/use-auth"

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
  const [onlineUsers, _setOnlineUsers] = useState<OnlineUser[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [socket, setSocket] = useState<Socket | null>(null)
  const { token } = useAuth()

  useEffect(() => {
    if (!token) return

    // Connect to Socket.IO server
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:7200/notifications'
    
    console.log("[RealTime] Connecting to:", wsUrl)
    
    const realSocket = io(wsUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      timeout: 20000,
    })
    
    realSocket.on("connect", () => {
      console.log("[RealTime] Socket.IO connected")
      setSocket(realSocket)
      setIsConnected(true)
    })
    
    realSocket.on("disconnect", (reason) => {
      console.log("[RealTime] Socket.IO disconnected:", reason)
      setIsConnected(false)
    })
    
    realSocket.on("connect_error", (error) => {
      console.error("[RealTime] Socket.IO error:", error)
      setIsConnected(false)
    })

    // Handle real-time events from backend
    realSocket.on("notification", (data) => {
      console.log("[RealTime] Notification received:", data)
      const notification: Notification = {
        id: Date.now().toString(),
        type: "note_updated",
        message: data.message || data.title,
        timestamp: new Date(),
      }
      setNotifications((prev) => [notification, ...prev.slice(0, 9)])
      toast(data.title, {
        description: data.message,
      })
    })

    realSocket.on("note-updated", (data) => {
      console.log("[RealTime] Note updated:", data)
      const notification: Notification = {
        id: Date.now().toString(),
        type: "note_updated",
        message: `Note "${data.title || 'Unknown'}" was updated`,
        timestamp: new Date(),
        noteId: data.id,
      }
      setNotifications((prev) => [notification, ...prev.slice(0, 9)])
    })

    realSocket.on("system-message", (data) => {
      console.log("[RealTime] System message:", data)
      const notification: Notification = {
        id: Date.now().toString(),
        type: "note_updated",
        message: data.message,
        timestamp: new Date(),
      }
      setNotifications((prev) => [notification, ...prev.slice(0, 9)])
      toast.info("System Message", {
        description: data.message,
      })
    })

    return () => {
      if (realSocket) {
        console.log("[RealTime] Cleaning up socket connection")
        realSocket.disconnect()
      }
      setIsConnected(false)
    }
  }, [token])

  const sendMessage = (message: any) => {
    if (socket && isConnected) {
      socket.emit("message", message)
    }
  }

  const joinRoom = (roomId: string) => {
    if (socket && isConnected) {
      console.log("[RealTime] Joining room:", roomId)
      socket.emit("join-room", roomId)
    }
  }

  const leaveRoom = (roomId: string) => {
    if (socket && isConnected) {
      console.log("[RealTime] Leaving room:", roomId)
      socket.emit("leave-room", roomId)
    }
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
