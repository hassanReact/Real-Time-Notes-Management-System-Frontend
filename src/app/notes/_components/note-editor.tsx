"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRealTime } from "@/components/real-time-provider"
import { notesService } from "@/lib/services"
import { getUserInitials } from "@/lib/avatar-utils"
import { useAuth } from "@/hooks/use-auth"
import { useGetUsers } from "@/hooks/use-notes"
import type { Note as APINote, NoteVersion } from "@/lib/types"
import { toast } from "sonner"
import {
  Save,
  Share2,
  MoreHorizontal,
  ArrowLeft,
  Users,
  Lock,
  Globe,
  Edit3,
  Clock,
  Tag,
  StarOff,
  History,
  MessageSquare,
  UserPlus,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ActivityIndicator, CollaborationIndicators, LiveCursors } from "@/components/collaborative-indicator"

interface NoteEditorProps {
  noteId: string
}

interface Comment {
  id: string
  author: string
  description: string
  timestamp: string
  avatar?: string
}

export function NoteEditor({ noteId }: NoteEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const { joinRoom, leaveRoom, onlineUsers } = useRealTime()
  const { user } = useAuth()
  const router = useRouter()

  // Share Modal State
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [userSearch, setUserSearch] = useState("")
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])

  // Fetch note data from API
  const [note, setNote] = useState<APINote | null>(null)
  const [loading, setLoading] = useState(true)

  // When editing, this state holds the editable note data
  const [editedNote, setEditedNote] = useState<APINote | null>(null)

  // API Hook for user search in share modal
  const { data: userRawResults, isLoading: isLoadingUsers } = useGetUsers(userSearch)

  // Extract users function for share modal
  function extractUsers(raw: any) {
    return raw?.data?.data?.data ?? []
  }
  
  const userResults = extractUsers(userRawResults)

  useEffect(() => {
    const fetchNote = async () => {
      if (noteId === "new") {
        const newNote: APINote = {
          id: "new",
          title: "",
          description: "",
          tags: [],
          visibility: "PRIVATE",
          archived: false,
          authorId: user?.id || "",
          author: {
            id: user?.id || "",
            email: user?.email || "",
            name: user?.name || "",
            profilePicture: user?.profilePicture || "",
            role: user?.role || "USER",
            isActive: true,
            emailVerified: false,
            createdAt: "",
            updatedAt: "",
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          versions: [],
          noteUsers: [],
        }
        setNote(newNote)
        setEditedNote(newNote)
        setLoading(false)
      } else {
        try {
          const response = await notesService.getNote(noteId)
          // Handle API response structure: { success: true, data: { ... } }
          const apiNote = response.data.data
          
          const loadedNote: APINote = {
            id: apiNote.id,
            title: apiNote.title || "",
            description: apiNote.description || "",
            tags: Array.isArray(apiNote.tags) ? apiNote.tags : [],
            visibility: apiNote.visibility || "PRIVATE",
            archived: Boolean(apiNote.archived),
            authorId: apiNote.authorId || "",
            author: {
              id: apiNote.author?.id || "",
              email: apiNote.author?.email || "",
              name: apiNote.author?.name || "",
              profilePicture: apiNote.author?.profilePicture || "",
              role: apiNote.author?.role || "USER",
              isActive: apiNote.author?.isActive ?? true,
              emailVerified: apiNote.author?.emailVerified ?? false,
              createdAt: apiNote.author?.createdAt || "",
              updatedAt: apiNote.author?.updatedAt || "",
            },
            createdAt: apiNote.createdAt || new Date().toISOString(),
            updatedAt: apiNote.updatedAt || new Date().toISOString(),
            versions: apiNote.versions || [],
            noteUsers: apiNote.noteUsers || [],
          }
          setNote(loadedNote)
          setEditedNote(loadedNote)
        } catch (error: any) {
          console.error("Failed to fetch note:", error)
          toast.error("Failed to load note", {
            description: error.response?.data?.message || "Please try again later"
          })
        } finally {
          setLoading(false)
        }
      }
    }

    fetchNote()
  }, [noteId, user])

  useEffect(() => {
    if (note) {
      setEditedNote(note)
    }
  }, [note])


  useEffect(() => {
    // Fetch comments for the note
    const fetchComments = async () => {
      if (noteId && noteId !== "new") {
        try {
          // TODO: Add comments API endpoint
          // const response = await notesService.getComments(noteId)
          // setComments(response)
        } catch (error) {
          console.error("Failed to fetch comments:", error)
        }
      }
    }

    fetchComments()
  }, [noteId])

  // Use versions from note, not a separate fetch
  const versions: NoteVersion[] = note?.versions || []

  useEffect(() => {
    // Join the note room for real-time collaboration
    if (noteId && noteId !== "new") {
      joinRoom(`note-${noteId}`)
    }

    return () => {
      if (noteId && noteId !== "new") {
        leaveRoom(`note-${noteId}`)
      }
    }
  }, [noteId, joinRoom, leaveRoom])

  const handleSave = async () => {
    if (!editedNote) return

    setIsSaving(true)
    try {
      if (noteId === "new") {
        // Create new note
        const response = await notesService.createNote({
          title: editedNote.title,
          description: editedNote.description,
          tags: editedNote.tags,
          visibility: editedNote.visibility,
        })
        const createdNote = response.data.data
        
        setNote({
          id: createdNote.id,
          title: createdNote.title || "",
          description: createdNote.description || "",
          tags: Array.isArray(createdNote.tags) ? createdNote.tags : [],
          visibility: createdNote.visibility || "PRIVATE",
          archived: Boolean(createdNote.archived),
          authorId: createdNote.authorId || "",
          author: {
            id: createdNote.author?.id || "",
            email: createdNote.author?.email || "",
            name: createdNote.author?.name || "",
            profilePicture: createdNote.author?.profilePicture || "",
            role: createdNote.author?.role || "USER",
            isActive: createdNote.author?.isActive ?? true,
            emailVerified: createdNote.author?.emailVerified ?? false,
            createdAt: createdNote.author?.createdAt || "",
            updatedAt: createdNote.author?.updatedAt || "",
          },
          createdAt: createdNote.createdAt || new Date().toISOString(),
          updatedAt: createdNote.updatedAt || new Date().toISOString(),
          versions: createdNote.versions || [],
          noteUsers: createdNote.noteUsers || [],
        })
        // Redirect to the new note's URL
        router.push(`/notes/${createdNote.id}`)
      } else {
        // Update existing note
        const response = await notesService.updateNote(noteId, {
          title: editedNote.title,
          description: editedNote.description,
          tags: editedNote.tags,
          visibility: editedNote.visibility,
        })
        const updatedNote = response.data.data
        
        setNote({
          id: updatedNote.id,
          title: updatedNote.title || "",
          description: updatedNote.description || "",
          tags: Array.isArray(updatedNote.tags) ? updatedNote.tags : [],
          visibility: updatedNote.visibility || "PRIVATE",
          archived: Boolean(updatedNote.archived),
          authorId: updatedNote.authorId || "",
          author: {
            id: updatedNote.author?.id || "",
            email: updatedNote.author?.email || "",
            name: updatedNote.author?.name || "",
            profilePicture: updatedNote.author?.profilePicture || "",
            role: updatedNote.author?.role || "USER",
            isActive: updatedNote.author?.isActive ?? true,
            emailVerified: updatedNote.author?.emailVerified ?? false,
            createdAt: updatedNote.author?.createdAt || "",
            updatedAt: updatedNote.author?.updatedAt || "",
          },
          createdAt: updatedNote.createdAt || new Date().toISOString(),
          updatedAt: updatedNote.updatedAt || new Date().toISOString(),
          versions: updatedNote.versions || [],
          noteUsers: updatedNote.noteUsers || [],
        })
      }
      setIsEditing(false)
      setLastSaved(new Date())
      toast.success(noteId === "new" ? "Note created successfully!" : "Note saved successfully!")
    } catch (error: any) {
      console.error("Failed to save note:", error)
      toast.error("Failed to save note", {
        description: error.response?.data?.message || "Please try again"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditedNote(note)
    setIsEditing(false)
  }

  const toggleFavorite = () => {
    // TODO: Implement favorite functionality with backend API
    console.log("Toggle favorite for note:", note?.id)
  }

  // Share Note Function
  const shareNote = async () => {
    if (!note || selectedUsers.length === 0) return
    
    try {
      await notesService.shareNote(note.id, selectedUsers)
      toast.success(`Note shared with ${selectedUsers.length} user(s)!`)
      
      // Close modal and reset state
      setShareModalOpen(false)
      setSelectedUsers([])
      setUserSearch("")
      
      // Optionally refresh the note to get updated collaborators
      // You might want to refetch the note here or update the local state
    } catch (error: any) {
      console.error("Error sharing note:", error)
      toast.error("Failed to share note", {
        description: error.response?.data?.message || "Please try again"
      })
    }
  }

  // Open share modal function
  const openShareModal = () => {
    if (noteId === "new") {
      toast.error("Please save the note first before sharing")
      return
    }
    setShareModalOpen(true)
  }

  const getVisibilityIcon = (visibility: APINote["visibility"]) => {
    switch (visibility) {
      case "PRIVATE":
        return <Lock className="h-4 w-4" />
      case "SHARED":
        return <Users className="h-4 w-4" />
      case "PUBLIC":
        return <Globe className="h-4 w-4" />
      default:
        return <Lock className="h-4 w-4" />
    }
  }

  const viewingUsers = onlineUsers?.slice(0, 2).map((u) => u.name) || []
  const editingUsers = isEditing ? [user?.name || user?.email || "You"] : []

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!note || !editedNote) {
    return (
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Note not found</p>
        </div>
      </div>
    )
  }

  // For compatibility, treat note.noteUsers as sharedWith
  const sharedWith = note.noteUsers || []

  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl">
      <LiveCursors />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/notes">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Notes
            </Button>
          </Link>

          <div className="flex items-center gap-2">
            {getVisibilityIcon(note.visibility)}
            <span className="text-sm text-muted-foreground capitalize">
              {note.visibility.toLowerCase()}
            </span>
          </div>

          <CollaborationIndicators noteId={noteId} />
        </div>

        <div className="flex items-center gap-2">
          {lastSaved && (
            <span className="text-xs text-muted-foreground">
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}

          <Button variant="ghost" size="sm" onClick={toggleFavorite}>
            <StarOff className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={openShareModal}>
                <Share2 className="h-4 w-4 mr-2" />
                Share Note
              </DropdownMenuItem>
              <DropdownMenuItem onClick={openShareModal}>
                <UserPlus className="h-4 w-7 mr-2 p-2" />
                Add Collaborator
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <History className="h-4 w-4 mr-2" />
                View History
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {isEditing ? (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Save className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
            </div>
          ) : (
            <Button size="sm" onClick={() => setIsEditing(true)}>
              <Edit3 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <ActivityIndicator type="viewing" users={viewingUsers} />
        <ActivityIndicator type="editing" users={editingUsers} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              {isEditing ? (
                <Input
                  value={editedNote.title}
                  onChange={(e) => setEditedNote({ ...editedNote, title: e.target.value })}
                  className="text-2xl font-bold border-none p-0 focus-visible:ring-0"
                  placeholder="Note title..."
                />
              ) : (
                <CardTitle className="text-2xl">{note.title || "Untitled Note"}</CardTitle>
              )}

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Updated {new Date(note.updatedAt).toLocaleString()}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {sharedWith.length + 1} collaborator{sharedWith.length !== 0 ? 's' : ''}
                </div>
              </div>

              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {note.tags.map((tag, index) => (
                    <Badge key={`${tag}-${index}`} variant="outline">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardHeader>

            <CardContent>
              {isEditing ? (
                <Textarea
                  value={editedNote.description}
                  onChange={(e) => setEditedNote({ ...editedNote, description: e.target.value })}
                  className="min-h-[500px] font-mono text-sm"
                  placeholder="Start writing your note..."
                />
              ) : (
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                    {note.description || "No content yet..."}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 w-">
          {/* Collaborators */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Collaborators</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={note.author.profilePicture} alt={note.author.name || note.author.email} />
                  <AvatarFallback>
                    {getUserInitials({
                      id: note.author.id,
                      email: note.author.email,
                      name: note.author.name,
                      profilePicture: note.author.profilePicture,
                      role: note.author.role,
                      isActive: note.author.isActive,
                      emailVerified: note.author.emailVerified,
                      createdAt: note.author.createdAt,
                      updatedAt: note.author.updatedAt,
                    })}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{note.author.name || note.author.email}</p>
                  <p className="text-xs text-muted-foreground">Owner</p>
                </div>
              </div>

              {sharedWith.map((shared, index) => (
                <div key={shared.userId || index} className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={shared.user.profilePicture} alt={shared.user.name || shared.user.email} />
                    <AvatarFallback>
                      {getUserInitials({
                        id: shared.user.id,
                        email: shared.user.email,
                        name: shared.user.name,
                        profilePicture: shared.user.profilePicture,
                        role: shared.user.role,
                        isActive: shared.user.isActive,
                        emailVerified: shared.user.emailVerified,
                        createdAt: shared.user.createdAt,
                        updatedAt: shared.user.updatedAt,
                      })}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{shared.user.name || shared.user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {shared.permission === "EDIT" ? "Editor" : "Viewer"}
                    </p>
                  </div>
                </div>
              ))}

              <Button variant="outline" size="sm" className="p-2 w-full bg-transparent" onClick={openShareModal}>
                <UserPlus className="h-4 w-6 mr-1 " />
                Add Collaborator
              </Button>
            </CardContent>
          </Card>

          {/* Activity Tabs */}
          <Card>
            <Tabs defaultValue="comments" className="w-full">
              <CardHeader className="pb-3">
                <TabsList className="grid w-full gap-4 grid-cols-1">

                  <TabsTrigger value="history" className="text-xs">
                    <History className="h-3 w-3 mr-1" />
                    History
                  </TabsTrigger>
                </TabsList>
              </CardHeader>
            </Tabs>
          </Card>
        </div>
      </div>

      {/* Share Modal */}
      <Dialog open={shareModalOpen} onOpenChange={setShareModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Share Note</DialogTitle>
            <DialogDescription>
              Search and select users to share{" "}
              <span className="font-semibold">{note.title || "this note"}</span>
            </DialogDescription>
          </DialogHeader>

          {/* User Search */}
          <Input
            placeholder="Search users..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className="mb-3"
          />

          {/* User Results */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {isLoadingUsers && <p className="text-sm">Loading...</p>}
            {!isLoadingUsers &&
              userResults.map((u: any) => (
                <div
                  key={u.id}
                  className="flex justify-between items-center p-2 border rounded-md"
                >
                  <div>
                    <p className="font-medium">{u.name}</p>
                    <p className="text-sm text-muted-foreground">{u.email}</p>
                  </div>
                  <Button
                    size="sm"
                    variant={
                      selectedUsers.includes(u.id) ? "default" : "secondary"
                    }
                    onClick={() => {
                      if (selectedUsers.includes(u.id)) {
                        setSelectedUsers(selectedUsers.filter((id) => id !== u.id))
                      } else {
                        setSelectedUsers([...selectedUsers, u.id])
                      }
                    }}
                  >
                    {selectedUsers.includes(u.id) ? "Selected" : "Select"}
                  </Button>
                </div>
              ))}

            {!isLoadingUsers && userSearch && userResults.length === 0 && (
              <p className="text-sm text-muted-foreground">No users found.</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShareModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={shareNote}
              disabled={selectedUsers.length === 0}
            >
              Share with {selectedUsers.length} user(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}