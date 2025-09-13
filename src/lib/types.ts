// User interface matching backend
export interface User {
    id: string
    email: string
    username: string
    name?: string
    role: "USER" | "ADMIN"
    avatar?: string
    createdAt: string
    updatedAt: string
  }
  
  // JWT Token Structure (from backend)
  export interface JWTPayload {
    sub: string // user-id
    username: string // john_doe
    email: string // john@example.com
    role: "USER" | "ADMIN"
    iat: number
    exp: number
  }
  
  // Note interface matching backend schema
  export interface Note {
    id: string
    title: string
    content: string
    tags: string[]
    visibility: "PRIVATE" | "SHARED" | "PUBLIC"
    authorId: string
    author: User
    createdAt: string
    updatedAt: string
    versions?: NoteVersion[]
    sharedWith?: NoteUser[]
  }
  
  // Note version for version control
  export interface NoteVersion {
    id: string
    noteId: string
    version: number
    title: string
    content: string
    createdBy: string
    createdAt: string
  }
  
  // Sharing permissions
  export interface NoteUser {
    noteId: string
    userId: string
    user: User
    permission: "READ" | "WRITE"
    sharedAt: string
  }
  
  // Notification interface
  export interface Notification {
    id: string
    userId: string
    type: string
    title: string
    message: string
    read: boolean
    createdAt: string
  }
  
  // Query parameters supported by backend
  export interface NotesQueryParams {
    page?: number
    limit?: number
    search?: string // Search in title and content
    tags?: string[] // Filter by tags
    visibility?: "PRIVATE" | "SHARED" | "PUBLIC"
    authorId?: string // Filter by author
    sortBy?: string
    sortOrder?: "asc" | "desc"
  }
  
  // Auth types
  export interface RegisterData {
    email: string
    username: string
    password: string
    name?: string
  }
  
  export interface LoginData {
    email: string
    password: string
  }
  
  export interface CreateNoteData {
    title: string
    content: string
    tags?: string[]
    visibility?: "PRIVATE" | "SHARED" | "PUBLIC"
  }
  
  export interface UpdateNoteData {
    title?: string
    content?: string
    tags?: string[]
    visibility?: "PRIVATE" | "SHARED" | "PUBLIC"
  }
  
  export interface ShareNoteData {
    userIds: string[]
    permission: "READ" | "WRITE"
  }
  