"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { userService } from "@/lib/services"

export function useUserProfile() {
  return useQuery({
    queryKey: ["user", "profile"],
    queryFn: () => userService.getProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}


export function useUploadAvatar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => userService.uploadAvatar(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "profile"] })
    },
  })
}

export function useSearchUsers(query: string, limit: number = 10) {
  return useQuery({
    queryKey: ["users", "search", query, limit],
    queryFn: () => userService.searchUsers(query, limit),
    enabled: !!query && query.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}
