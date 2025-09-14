"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { notesService, notificationService } from "@/lib/services"

export function useNotifications(params?: {
  page?: number
  limit?: number
  type?: "NOTE_SHARED" | "NOTE_UPDATED" | "SYSTEM"
  isRead?: boolean
  sortBy?: string
  sortOrder?: "asc" | "desc"
}) {
  return useQuery({
    queryKey: ["notifications", params],
    queryFn: () => notificationService.getNotifications(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => notificationService.getUnreadCount(),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })
}

export function useDeleteNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => notificationService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })
}

export function useSharedNotes(
  visibility: "SHARED" | "PUBLIC" | "PRIVATE",
  authorId?: string
) {
  return useQuery({
    queryKey: ["visibility", visibility, ...(authorId ? ["authorId", authorId] : [])],
    queryFn: () => notesService.getSharedNotes(visibility, authorId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

