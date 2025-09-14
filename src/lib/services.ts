import { GET, POST, PATCH, DELETE, PUT } from "./api"
import type {
  User,
  Note,
  NoteVersion,
  Notification,
  NotesQueryParams,
  RegisterData,
  CreateNoteData,
  UpdateNoteData,
  NotesResponse,
  AuthResponse,
  RefreshTokenResponse,
  NotificationsResponse,
  UnreadCountResponse,
  AdminStatsResponse,
  HealthResponse,
  ApiResponse,
  NoteUser,
} from "./types"

// Authentication services
export const authService = {
  login: (email: string, password: string) =>
    POST<AuthResponse>("/auth/login", { email, password }),

  register: (userData: RegisterData) =>
    POST<AuthResponse>("/auth/register", userData),

  refresh: (refreshToken: string) =>
    POST<RefreshTokenResponse>("/auth/refresh", { refreshToken }),

  logout: () => POST<ApiResponse>("/auth/logout"),

  forgotPassword: (email: string) =>
    POST<ApiResponse>("/auth/forgot-password", { email }),

  resetPassword: (token: string, newPassword: string) =>
    POST<ApiResponse>("/auth/reset-password", { token, newPassword }),
}

// Notes services
export const notesService = {
  getNotes: (params: NotesQueryParams) =>
    GET<NotesResponse>("/notes", { params }),

  getNote: (id: string) => GET<ApiResponse<Note>>(`/notes/${id}`),

  createNote: (noteData: CreateNoteData) => POST<ApiResponse<Note>>("/notes", noteData),

  updateNote: (id: string, noteData: UpdateNoteData) => PATCH<ApiResponse<Note>>(`/notes/${id}`, noteData),

  deleteNote: (id: string) => DELETE(`/notes/${id}`),

  shareNote: (id: string, shareData: string[]) => POST<ApiResponse<Note>>(`/notes/${id}/share`, { userIds: shareData }),

  getSharedNotes: (visibility: "SHARED" | "PUBLIC" | "PRIVATE", authorId?: string) => GET<NotesResponse>(`/notes/search/advanced?visibility=${visibility}${authorId ? `&authorId=${authorId}` : ""}`),

  getVersions: (id: string) => GET<ApiResponse<NoteVersion[]>>(`/notes/${id}/versions`),

  getAllUsers: (name: string) => GET<ApiResponse<NoteUser[]>>(`/notes/all/users?name=${name}`),

  restoreVersion: (id: string, version: number) => POST<ApiResponse<Note>>(`/notes/${id}/versions/${version}/restore`),
}

// User services
export const userService = {
  getProfile: () => GET<ApiResponse<User>>("/users/profile"),

  updateProfile: (userData: { phone: string, name: string, email: string }) => PATCH<ApiResponse<User>>("/users/profile", userData),

  uploadAvatar: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return POST<ApiResponse<{ profilePicture: string }>>("/users/upload-avatar", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  changePassword: (data: {
    currentPassword: string,
    newPassword: string,
    confirmPassword?: string
  }) => PUT<ApiResponse<User[]>>('/users/change/password', {
    currentPassword: data.currentPassword, newPassword: data.newPassword
  }),

  searchUsers: (query: string, limit: number = 10) =>
    GET<ApiResponse<User[]>>(`/users/search?query=${encodeURIComponent(query)}&limit=${limit}`),
}

// Notifications services
export const notificationService = {
  getNotifications: (params?: {
    page?: number
    limit?: number
    type?: "NOTE_SHARED" | "NOTE_UPDATED" | "SYSTEM"
    isRead?: boolean
    sortBy?: string
    sortOrder?: "asc" | "desc"
  }) => GET<NotificationsResponse>("/notifications", { params }),

  markAsRead: (id: string) => POST<ApiResponse<Notification>>(`/notifications/${id}/read`),

  markAllAsRead: () => POST<ApiResponse<{ count: number }>>("/notifications/read-all"),

  getUnreadCount: () => GET<UnreadCountResponse>("/notifications/unread-count"),

  deleteNotification: (id: string) => DELETE(`/notifications/${id}`),
}

// Admin services
export const adminService = {
  // System statistics
  getStats: () => GET<AdminStatsResponse>("/admin/stats"),

  // User management
  getAllUsers: (params?: { page?: number; limit?: number; search?: string; role?: string }) =>
    GET<ApiResponse<{ data: User[]; meta: { total: number; page: number; limit: number; totalPages: number } }>>("/admin/users", { params }),

  toggleUserStatus: (userId: string) => POST<ApiResponse<User>>(`/admin/users/${userId}/toggle-status`),

  changeUserRole: (userId: string, role: "USER" | "ADMIN") =>
    POST<ApiResponse<User>>(`/admin/users/${userId}/change-role`, { role }),

  deleteUser: (userId: string) => DELETE(`/admin/users/${userId}`),

  // Notes management
  getAllNotes: (params?: { page?: number; limit?: number; search?: string }) =>
    GET<ApiResponse<{ data: Note[]; meta: { total: number; page: number; limit: number; totalPages: number } }>>("/admin/notes", { params }),

  deleteNote: (noteId: string) => DELETE(`/admin/notes/${noteId}`),

  // Activity monitoring
  getRecentActivity: (limit: number = 10) =>
    GET<ApiResponse<{
      recentNotes: Array<{
        id: string
        title: string
        description: string
        createdAt: string
        author: { name: string }
      }>
      recentUsers: Array<{
        id: string
        name: string
        email: string
        createdAt: string
      }>
    }>>(`/admin/activity?limit=${limit}`),

  updateNote: (userId: string, data: { description?: string, tags?: string[], title?: string }) => PUT(`/admin/update/notes/${userId}`, data),

  changePassword: (data: {
    currentPassword: string,
    newPassword: string,
    confirmPassword?: string
  }) => PUT<ApiResponse<User[]>>('/admin/change/password', {
    currentPassword: data.currentPassword, newPassword: data.newPassword
  }),
}

// Health check for backend status
export const healthService = {
  checkHealth: () => GET<HealthResponse>("/health"),
}
