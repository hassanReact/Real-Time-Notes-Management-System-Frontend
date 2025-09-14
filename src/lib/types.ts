// User interface matching backend API
export interface User {
    id: string
    email: string
    name?: string
    phone?: string
    profilePicture?: string
    role: "USER" | "ADMIN"
    isActive: boolean
    emailVerified: boolean
    createdAt: string
    updatedAt: string
  }
  
  // JWT Token Structure (from backend)
  export interface JWTPayload {
    sub: string // user-id
    email: string // john@example.com
    role: "USER" | "ADMIN"
    iat: number
    exp: number
  }
  
  // Note interface matching backend API schema
  export interface Note {
    id: string
    title: string
    description: string
    visibility: "PRIVATE" | "SHARED" | "PUBLIC"
    tags: string[]
    archived: boolean
    authorId: string
    createdAt: string
    updatedAt: string
    author: User
    versions?: NoteVersion[]
    sharedWith?: NoteUser[]
    noteUsers?: NoteUser[]
    _count?: {
      versions: number
      sharedWith?: number
    }
  }
  
  // Note version for version control
  export interface NoteVersion {
    id: string
    noteId: string
    title: string
    content: string
    version: number
    createdAt: string
    createdById: string
    createdBy: User
  }
  
  // Sharing permissions
  export interface NoteUser {
    noteId: string
    userId: string
    user: User
    permission: "VIEW" | "EDIT"
    sharedAt?: string
  }
  
  // Notification interface matching API
  export interface Notification {
    id: string
    userId: string
    type: "NOTE_SHARED" | "NOTE_UPDATED" | "SYSTEM"
    title: string
    message: string
    metadata?: {
      noteId?: string
      sharedByUserId?: string
      [key: string]: unknown
    }
    read: boolean
    createdAt: string
    user?: User
  }
  
  // Query parameters supported by backend
  export interface NotesQueryParams {
    page?: number
    limit?: number
    search?: string // Search in title and description
    tags?: string[] // Filter by tags
    visibility?: "PRIVATE" | "SHARED" | "PUBLIC"
    authorId?: string // Filter by author
    sortBy?: string
    sortOrder?: "asc" | "desc"
  }
  
  // Auth types
  export interface RegisterData {
    email: string
    password: string
    name?: string
  }
  
  export interface LoginData {
    email: string
    password: string
  }
  
  export interface CreateNoteData {
    title: string
    description: string
    tags?: string[]
    visibility?: "PRIVATE" | "SHARED" | "PUBLIC"
  }
  
  export interface UpdateNoteData {
    title?: string
    description?: string
    tags?: string[]
    visibility?: "PRIVATE" | "SHARED" | "PUBLIC"
  }
  
  export interface ShareNoteData {
    userIds: string[]
  }
  
  // API Response types
  export interface ApiResponse<T = any> {
    success: boolean
    data: T
    message?: string
    timestamp?: string
    path?: string
    method?: string
  }

  export interface PaginatedResponse<T> {
    data: T[]
    meta: {
      total: number
      page: number
      limit: number
      totalPages: number
    }
  }

  export interface NotesResponse {
    success: boolean
    data: PaginatedResponse<Note>
    message?: string
  }

  export interface AuthResponse {
    success: boolean
    data: {
      user: User
      accessToken: string
      refreshToken: string
    }
    message: string
  }

  export interface RefreshTokenResponse {
    success: boolean
    data: {
      accessToken: string
    }
    message: string
  }

  export interface NotificationsResponse {
    success: boolean
    data: PaginatedResponse<Notification>
    message?: string
  }

  export interface UnreadCountResponse {
    success: boolean
    data: {
      count: number
    }
  }

  export interface AdminStatsResponse {
    success: boolean
    data: {
      users: {
        total: number
        active: number
        inactive: number
      }
      notes: {
        total: number
        public: number
        shared: number
        private: number
      }
      notifications: {
        total: number
        unread: number
        read: number
      }
    }
  }

  export interface HealthResponse {
    success: boolean
    data: {
      status: string
      timestamp: string
      uptime: number
      environment: string
    }
  }
  