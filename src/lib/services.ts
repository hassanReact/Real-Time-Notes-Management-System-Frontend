import { GET, POST, PATCH, DELETE } from "./api"
import type {
  User,
  Note,
  NoteVersion,
  Notification,
  NotesQueryParams,
  RegisterData,
  CreateNoteData,
  UpdateNoteData,
  ShareNoteData,
} from "./types"

// Authentication services
export const authService = {
  login: (email: string, password: string) =>
    POST<{ access_token: string; refresh_token: string; user: User }>("/auth/login", { email, password }),

  register: (userData: RegisterData) =>
    POST<{ access_token: string; refresh_token: string; user: User }>("/auth/register", userData),

  refresh: () => POST<{ access_token: string }>("/auth/refresh"),

  logout: () => POST("/auth/logout"),

  forgotPassword: (email: string) => POST("/auth/forgot-password", { email }),

  resetPassword: (token: string, password: string) => POST("/auth/reset-password", { token, password }),
}

// Notes services
export const notesService = {
  getNotes: (params: NotesQueryParams) =>
    GET<{ notes: Note[]; total: number; page: number; limit: number }>("/notes", { params }),

  getNote: (id: string) => GET<Note>(`/notes/${id}`),

  createNote: (noteData: CreateNoteData) => POST<Note>("/notes", noteData),

  updateNote: (id: string, noteData: UpdateNoteData) => PATCH<Note>(`/notes/${id}`, noteData),

  deleteNote: (id: string) => DELETE(`/notes/${id}`),

  shareNote: (id: string, shareData: ShareNoteData) => POST(`/notes/${id}/share`, shareData),

  getVersions: (id: string) => GET<NoteVersion[]>(`/notes/${id}/versions`),

  restoreVersion: (id: string, version: number) => POST<Note>(`/notes/${id}/versions/${version}/restore`),
}

// User services
export const userService = {
  getProfile: () => GET<User>("/users/profile"),

  updateProfile: (userData: Partial<User>) => PATCH<User>("/users/profile", userData),

  getNotifications: () => GET<Notification[]>("/users/notifications"),

  markNotificationRead: (id: string) => PATCH(`/users/notifications/${id}/read`),
}

// Health check for backend status
export const healthService = {
  checkHealth: () => GET("/health"),

  checkDatabase: () => GET("/health/db"),

  checkRedis: () => GET("/health/redis"),
}
