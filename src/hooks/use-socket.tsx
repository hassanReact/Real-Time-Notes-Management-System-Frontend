"use client"

import { useEffect, useRef, useState } from "react"
import { io, type Socket } from "socket.io-client"
import { useAuth } from "./use-auth"
import { toast } from "sonner"

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3000"

export function useSocket() {
  const socket = useRef<Socket>()
  const [connected, setConnected] = useState(false)
  const { token } = useAuth()

  useEffect(() => {
    if (!token) return

    // Initialize socket connection
    socket.current = io(WS_URL, {
      auth: { token },
    })

    socket.current.on("connect", () => {
      console.log("[v0] Socket connected")
      setConnected(true)
    })

    socket.current.on("disconnect", () => {
      console.log("[v0] Socket disconnected")
      setConnected(false)
    })

    // Handle backend events
    socket.current.on("notification", (data) => {
      console.log("[v0] Notification received:", data)
      toast(data.title, {
        description: data.message,
      })
    })

    socket.current.on("note-updated", (data) => {
      console.log("[v0] Note updated:", data)
      // Trigger re-fetch of notes data
      window.dispatchEvent(new CustomEvent("note-updated", { detail: data }))
    })

    socket.current.on("system-message", (data) => {
      console.log("[v0] System message:", data)
      toast.info("System Message", {
        description: data.message,
      })
    })

    return () => {
      socket.current?.disconnect()
    }
  }, [token])

  return {
    socket: socket.current,
    connected,
  }
}
