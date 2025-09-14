"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { notesService } from "@/lib/services"
import type { NotesQueryParams, CreateNoteData, UpdateNoteData } from "@/lib/types"

export function useNotes(params: NotesQueryParams = {}) {
  return useQuery({
    queryKey: ["notes", params],
    queryFn: () => notesService.getNotes(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useNote(id: string) {
  return useQuery({
    queryKey: ["note", id],
    queryFn: () => notesService.getNote(id),
    enabled: !!id,
  })
}

export function useCreateNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (noteData: CreateNoteData) => notesService.createNote(noteData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] })
    },
  })
}

export function useUpdateNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNoteData }) => notesService.updateNote(id, data),
    onSuccess: (_: any, { id }: { id: string; data: UpdateNoteData }) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] })
      queryClient.invalidateQueries({ queryKey: ["note", id] })
    },
  })
}

export function useDeleteNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => notesService.deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] })
    },
  })
}

export function useNoteVersions(id: string) {
  return useQuery({
    queryKey: ["note-versions", id],
    queryFn: () => notesService.getVersions(id),
    enabled: !!id,
  })
}

export function useGetUsers(name: string) {
  return useQuery({
    queryKey: ["name", name],
    queryFn: () => notesService.getAllUsers(name),
    enabled: !!name
  })
}

export function shareNotesToUsers(noteId: string, userIds: string[]) {

  const queryClient = useQueryClient()
  return useMutation({

    mutationFn: (file: File) => notesService.shareNote(noteId, userIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "profile"] })
    },
  })
} 