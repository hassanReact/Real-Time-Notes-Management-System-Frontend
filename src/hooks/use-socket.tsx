"use client"

import { useEffect, useRef, useState } from "react"
import { io, type Socket } from "socket.io-client"
import { useAuth } from "./use-auth"
import { toast } from "sonner"

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:7200/notifications"

export function useSocket() {
  const socket = useRef<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { token } = useAuth()

  useEffect(() => {
    if (!token) return

    console.log("[Socket] Connecting to:", WS_URL)
    console.log("[Socket] Token:", token ? "Present" : "Missing")
    
    // Initialize socket connection
    socket.current = io(WS_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      timeout: 20000,
    })

    socket.current.on("connect", () => {
      console.log("[Socket] Connected successfully")
      setConnected(true)
      setError(null)
    })

    socket.current.on("disconnect", (reason) => {
      console.log("[Socket] Disconnected:", reason)
      setConnected(false)
    })

    socket.current.on("connect_error", (error) => {
      console.error("[Socket] Connection error:", error)
      setError(error.message)
      setConnected(false)
    })

    // Handle backend events
    socket.current.on("notification", (data) => {
      console.log("[Socket] Notification received:", data)
      toast(data.title, {
        description: data.message,
      })
    })

    socket.current.on("note-updated", (data) => {
      console.log("[Socket] Note updated:", data)
      // Trigger re-fetch of notes data
      window.dispatchEvent(new CustomEvent("note-updated", { detail: data }))
    })

    socket.current.on("system-message", (data) => {
      console.log("[Socket] System message:", data)
      toast.info("System Message", {
        description: data.message,
      })
    })

    socket.current.on("connected", (data) => {
      console.log("[Socket] Backend connection confirmed:", data)
    })

    return () => {
      if (socket.current) {
        console.log("[Socket] Cleaning up connection")
        socket.current.disconnect()
      }
    }
  }, [token])

  const joinRoom = (roomId: string) => {
    if (socket.current && connected) {
      console.log("[Socket] Joining room:", roomId)
      socket.current.emit("join-room", roomId)
    }
  }

  const leaveRoom = (roomId: string) => {
    if (socket.current && connected) {
      console.log("[Socket] Leaving room:", roomId)
      socket.current.emit("leave-room", roomId)
    }
  }

  return {
    socket: socket.current,
    connected,
    error,
    joinRoom,
    leaveRoom,
  }
}
