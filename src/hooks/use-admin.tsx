"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { adminService } from "@/lib/services"
import { toast } from "sonner"

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => adminService.getStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useAdminUsers(params?: {
  page?: number
  limit?: number
  search?: string
  role?: string
}) {
  return useQuery({
    queryKey: ["admin", "users", params],
    queryFn: () => adminService.getAllUsers(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}


export function useAdminNotes(params?: {
  page?: number
  limit?: number
  search?: string
}) {
  return useQuery({
    queryKey: ["admin", "notes", params],
    queryFn: () => adminService.getAllNotes(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useAdminRecentActivity(limit: number = 10) {
  return useQuery({
    queryKey: ["admin", "activity", limit],
    queryFn: () => adminService.getRecentActivity(limit),
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

export function useToggleUserStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => adminService.toggleUserStatus(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
    },
  })
}

export function useChangeUserRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: "USER" | "ADMIN" }) =>
      adminService.changeUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  useMutation({
    mutationFn: (id: string) => adminService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
      toast.success("User deleted successfully")
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete user")
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (noteId: string) => adminService.deleteNote(noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notes"] })
      toast.success("Note deleted successfully")
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete note")
    },
  })
}
export function useUpdateNote() {

  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { description?: string; tags?: string[]; title?: string } }) =>
      adminService.updateNote(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notes"] })
      toast.success("Note updated successfully")
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update note")
    },
  })
}