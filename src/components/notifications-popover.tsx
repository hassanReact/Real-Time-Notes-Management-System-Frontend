"use client"

import { useState, useEffect } from "react"
import { Bell, X } from "lucide-react"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRealTime } from "@/components/real-time-provider"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface NotificationItemProps {
  id: string
  type: string
  message: string
  timestamp: Date
  onDismiss: (id: string) => void
}

function NotificationItem({ id, message, timestamp, onDismiss }: NotificationItemProps) {
  return (
    <div className="flex items-start gap-4 p-4 hover:bg-accent/50 relative group">
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium leading-none">{message}</p>
        <p className="text-xs text-muted-foreground">
          {new Date(timestamp).toLocaleTimeString()}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => onDismiss(id)}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function NotificationsPopover() {
  const { notifications } = useRealTime()
  const [unreadCount, setUnreadCount] = useState(0)
  const [localNotifications, setLocalNotifications] = useState(notifications)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setLocalNotifications(notifications)
    if (!isOpen) {
      setUnreadCount((prev) => prev + (notifications.length - localNotifications.length))
    }
  }, [notifications, isOpen])

  const handleOpen = (open: boolean) => {
    setIsOpen(open)
    if (open) {
      setUnreadCount(0)
    }
  }

  const dismissNotification = (id: string) => {
    setLocalNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card>
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <h4 className="text-sm font-medium">Notifications</h4>
            {localNotifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocalNotifications([])}
              >
                Clear all
              </Button>
            )}
          </div>
          <ScrollArea className="h-[300px]">
            {localNotifications.length > 0 ? (
              <div className="divide-y">
                {localNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    {...notification}
                    onDismiss={dismissNotification}
                  />
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-sm text-muted-foreground">
                No notifications
              </div>
            )}
          </ScrollArea>
        </Card>
      </PopoverContent>
    </Popover>
  )
}