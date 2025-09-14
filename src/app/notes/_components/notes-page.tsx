"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  FileText,
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  MoreHorizontal,
  Edit,
  Share2,
  Trash2,
  Clock,
  Tag,
  User,
  Users,
  Lock,
  Globe,
} from "lucide-react"
import { useNotes, useCreateNote, useUpdateNote, useDeleteNote } from "@/hooks/use-notes"
import { useSocket } from "@/hooks/use-socket"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useEffect } from "react"
import type { Note } from "@/lib/types"

export function NotesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newNote, setNewNote] = useState({ title: "", description: "", tags: "" })

  const { connected, error: socketError } = useSocket()
  const router = useRouter()

  // Build query parameters based on filters
  const queryParams = {
    search: searchQuery || undefined,
    visibility:
      selectedFilter === "shared"
        ? ("SHARED" as const)
        : selectedFilter === "private"
          ? ("PRIVATE" as const)
          : undefined,
    sortBy: "updatedAt",
    sortOrder: "desc" as const,
  }

  const { data: notesData, isLoading, error } = useNotes(queryParams)
  const createNoteMutation = useCreateNote()
  const deleteNoteMutation = useDeleteNote()

  // Access notes from the correct API response structure
  const notes: any[] = notesData?.data?.data?.data ? (notesData.data.data.data as unknown as any[]) : []
  // Listen for real-time note updates
  useEffect(() => {
    const handleNoteUpdate = () => {
      // Refetch notes when a note is updated
      window.location.reload() // Simple refresh for now
    }

    window.addEventListener("note-updated", handleNoteUpdate)
    return () => window.removeEventListener("note-updated", handleNoteUpdate)
  }, [])

  const filteredNotes = notes.filter(() => {
    if (selectedFilter === "favorites") {
      // For now, we'll use a client-side favorite check since backend doesn't have favorites
      // In a real app, you'd add a favorites field to the backend
      return false // No favorites for now
    }
    return true
  })

  const handleCreateNote = async () => {
    if (!newNote.title.trim()) {
      toast.error("Please enter a note title")
      return
    }

    try {
      await createNoteMutation.mutateAsync({
        title: newNote.title,
        description: newNote.description,
        tags: newNote.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        visibility: "PRIVATE",
      })

      setNewNote({ title: "", description: "", tags: "" })
      setIsCreateDialogOpen(false)
      toast.success("Note created successfully!")
    } catch (error: any) {
      console.error("[v0] Create note error:", error)
      toast.error("Failed to create note", {
        description: error.response?.data?.message || "Please try again",
      })
    }
  }


  const deleteNote = async (noteId: string) => {
    try {
      await deleteNoteMutation.mutateAsync(noteId)
      toast.success("Note deleted successfully!")
    } catch (error: any) {
      console.error("[v0] Delete note error:", error)
      toast.error("Failed to delete note", {
        description: error.response?.data?.message || "Please try again",
      })
    }
  }

  const getVisibilityIcon = (visibility: Note["visibility"]) => {
    switch (visibility) {
      case "PRIVATE":
        return <Lock className="h-3 w-3" />
      case "SHARED":
        return <Users className="h-3 w-3" />
      case "PUBLIC":
        return <Globe className="h-3 w-3" />
    }
  }

  const getVisibilityColor = (visibility: Note["visibility"]) => {
    switch (visibility) {
      case "PRIVATE":
        return "text-muted-foreground"
      case "SHARED":
        return "text-primary"
      case "PUBLIC":
        return "text-accent"
    }
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours} hours ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) return "1 day ago"
    return `${diffInDays} days ago`
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 py-8">
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to load notes</h3>
            <p className="text-muted-foreground mb-4">
              There was an error connecting to the backend. Please try again.
            </p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-balance">My Notes</h1>
            {/* Real-time status indicator */}
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  connected ? "bg-green-500" : socketError ? "bg-red-500" : "bg-yellow-500"
                }`}
              />
              <span className="text-xs text-muted-foreground">
                {connected ? "Live" : socketError ? "Offline" : "Connecting..."}
              </span>
            </div>
          </div>
          <p className="text-muted-foreground">
            {isLoading ? "Loading..." : `${filteredNotes.length} of ${notes.length} notes`}
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Note
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Note</DialogTitle>
              <DialogDescription>Add a new note to your collection.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter note title..."
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Start writing your note..."
                  rows={4}
                  value={newNote.description}
                  onChange={(e) => setNewNote({ ...newNote, description: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  placeholder="tag1, tag2, tag3"
                  value={newNote.tags}
                  onChange={(e) => setNewNote({ ...newNote, tags: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateNote} disabled={createNoteMutation.isPending}>
                {createNoteMutation.isPending ? "Creating..." : "Create Note"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search notes, tags, or content..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSelectedFilter("all")}>All Notes</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedFilter("favorites")}>Favorites</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedFilter("shared")}>Shared</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedFilter("private")}>Private</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your notes...</p>
        </div>
      )}

      {/* Notes Grid/List */}
      {!isLoading && filteredNotes.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No notes found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? "Try adjusting your search terms" : "Create your first note to get started"}
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Note
            </Button>
          </CardContent>
        </Card>
      ) : !isLoading ? (
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {filteredNotes.map((note: any) => (
            <Card
              key={note.id}
              className={`group hover:shadow-md transition-all duration-200 cursor-pointer ${
                viewMode === "list" ? "flex-row" : ""
              }`}
              onClick={() => router.push(`/notes/${note.id}`)}
            >
              <CardHeader className={viewMode === "list" ? "pb-2" : ""}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                      {note.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <div className={`flex items-center gap-1 text-xs ${getVisibilityColor(note.visibility)}`}>
                        {getVisibilityIcon(note.visibility)}
                        <span className="capitalize">{note.visibility?.toLowerCase()}</span>
                      </div>
                      {/* The new API does not have sharedWith, so skip this */}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/notes/${note.id}`)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNote(note.id)
                          }}
                          disabled={deleteNoteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {deleteNoteMutation.isPending ? "Deleting..." : "Delete"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>

              <CardContent className={viewMode === "list" ? "pt-0" : ""}>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                  {note.description ? note.description.substring(0, 150) + "..." : ""}
                </p>

                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {note.tags.slice(0, 3).map((tag: string) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                    {note.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{note.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatRelativeTime(note.updatedAt)}
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {note.author?.name || "Unknown"}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  )
}
