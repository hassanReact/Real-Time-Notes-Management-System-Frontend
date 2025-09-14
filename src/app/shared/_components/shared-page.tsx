"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Share2, MessageSquare, Eye, Clock } from "lucide-react"
import { format } from "date-fns"
import { CollaborationIndicators } from "@/components/collaborative-indicator"
import { useSharedNotes } from "@/hooks/use-notifications"
import { useAuth } from "@/hooks/use-auth"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { useGetUsers } from "@/hooks/use-notes"
import { notesService } from "@/lib/services"

// ---- Interfaces ----
interface SharedNote {
  id: string
  title: string
  content: string
  author: string
  authorAvatar?: string
  collaborators: string[]
  visibility: "shared" | "public"
  updatedAt: string
  comments: number
  views: number
  isStarred: boolean
}


// ---- Mapping Function for Notes ----
function mapNoteToSharedNote(apiNote: any): SharedNote {
  return {
    id: apiNote.id,
    title: apiNote.title,
    content: apiNote.description,
    author: apiNote.author?.name || "Unknown",
    authorAvatar: apiNote.author?.profilePicture || "/placeholder.svg",
    collaborators: apiNote.noteUsers?.map((nu: any) => nu.user?.name) || [],
    visibility: apiNote.visibility?.toLowerCase() as "shared" | "public",
    updatedAt: apiNote.updatedAt,
    comments: apiNote._count?.comments ?? 0,
    views: apiNote._count?.views ?? 0,
    isStarred: false,
  }
}

function NoteCard({ note, onShare }: { note: SharedNote; onShare: (note: SharedNote) => void }) {
  return (
    <Card className="h-full flex flex-col transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="line-clamp-1">{note.title}</CardTitle>
          <div className="flex items-center space-x-1">
            <Avatar className="h-5 w-5">
              <AvatarImage src={note.authorAvatar} />
              <AvatarFallback>{note.author[0]}</AvatarFallback>
            </Avatar>
            <CardDescription className="font-medium">
              {note.author}
            </CardDescription>
          </div>
        </div>
        <Badge variant={note.visibility === "public" ? "secondary" : "outline"} className="capitalize">
          {note.visibility}
        </Badge>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">{note.content}</p>
      </CardContent>
      <CardFooter className="mt-auto pt-6 flex justify-between items-center">
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center">
            <MessageSquare className="h-4 w-4 mr-1" />
            {note.comments}
          </div>
          <div className="flex items-center">
            <Eye className="h-4 w-4 mr-1" />
            {note.views}
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {format(new Date(note.updatedAt), "MMM d")}
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => onShare(note)}>
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </CardFooter>
    </Card>
  )
}

function EmptyState({ type }: { type: "shared-with-me" | "my-shared" | "public" }) {
  const messages = {
    "shared-with-me": {
      title: "No shared notes yet",
      description: "Notes shared with you will appear here"
    },
    "my-shared": {
      title: "You haven't shared any notes",
      description: "Share your notes with others to collaborate"
    },
    "public": {
      title: "No public notes available",
      description: "Be the first to share a public note"
    }
  }

  return (
    <div className="text-center py-10">
      <Share2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold">{messages[type].title}</h3>
      <p className="text-sm text-muted-foreground">{messages[type].description}</p>
    </div>
  )
}

export function SharedNotesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("shared-with-me")

  // modal state
  const [open, setOpen] = useState(false)
  const [selectedNote, setSelectedNote] = useState<SharedNote | null>(null)
  const [userSearch, setUserSearch] = useState("")
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]) // ✅ track selected users

  const { user } = useAuth()
  const { data: sharedWithMeRaw, isLoading: isLoadingShared } = useSharedNotes("SHARED")
  const { data: mySharedNotesRaw, isLoading: isLoadingMyShared } = useSharedNotes("SHARED", user?.id)
  const { data: publicNotesRaw, isLoading: isLoadingPublic } = useSharedNotes("PUBLIC")

  const isLoadingNotes = {
    "shared-with-me": isLoadingShared,
    "my-shared": isLoadingMyShared,
    "public": isLoadingPublic
  }[activeTab]

  // ✅ Query users from API
  const { data: userRawResults, isLoading: isLoadingUsers } = useGetUsers(userSearch)
  const userResults = extractUsers(userRawResults)

  // ---- Extract Notes ----
  function extractNotes(raw: any) {
    const notes = raw?.data?.data?.data?.data
    return Array.isArray(notes) ? notes.map(mapNoteToSharedNote) : []
  }

  function extractSharedWithMe(raw: any, userId?: string) {
    const notes = raw?.data?.data?.data?.data
    if (!Array.isArray(notes)) return []
    return notes
      .filter((note: any) =>
        note.noteUsers?.some((nu: any) => nu.userId === userId)
      )
      .map(mapNoteToSharedNote)
  }

  function extractUsers(raw: any) {
    return raw?.data?.data?.data ?? []
  }

  const sharedWithMe = extractSharedWithMe(sharedWithMeRaw, user?.id)
  const mySharedNotes = extractNotes(mySharedNotesRaw)
  const publicNotes = extractNotes(publicNotesRaw)

  const getCurrentNotes = (): SharedNote[] => {
    switch (activeTab) {
      case "shared-with-me":
        return sharedWithMe
      case "my-shared":
        return mySharedNotes
      case "public":
        return publicNotes
      default:
        return []
    }
  }

  // ✅ Final share function
  const shareNotes = async () => {
    if (!selectedNote) return
    try {
      await notesService.shareNote(selectedNote.id, selectedUsers) // <-- implement API in service
      console.log("Shared successfully")
      setOpen(false)
      setSelectedUsers([])
      setUserSearch("")
    } catch (err) {
      console.error("Error sharing note", err)
    }
  }

  const filteredNotes = getCurrentNotes().filter((note) =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Shared Notes</h1>
          <p className="text-muted-foreground">
            Collaborate and discover notes shared with you and the community
          </p>
        </div>
        <CollaborationIndicators />
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search shared notes..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="shared-with-me">Shared with Me</TabsTrigger>
          <TabsTrigger value="my-shared">My Shared Notes</TabsTrigger>
          <TabsTrigger value="public">Public Notes</TabsTrigger>
        </TabsList>

        {["shared-with-me", "my-shared", "public"].map((tab) => (
          <TabsContent key={tab} value={tab}>
            {isLoadingNotes ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((n) => (
                  <Card key={n} className="h-[250px] animate-pulse">
                    <CardHeader className="space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-2 bg-muted rounded"></div>
                        <div className="h-2 bg-muted rounded"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredNotes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onShare={(note) => {
                      setSelectedNote(note)
                      setOpen(true)
                    }}
                  />
                ))}
              </div>
            ) : (
              <EmptyState type={tab as "shared-with-me" | "my-shared" | "public"} />
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Share Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Share Note</DialogTitle>
            <DialogDescription>
              Search and select users to share{" "}
              <span className="font-semibold">{selectedNote?.title}</span>
            </DialogDescription>
          </DialogHeader>

          {/* User Search */}
          <Input
            placeholder="Search users..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className="mb-3"
          />

          <div className="space-y-4">
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {isLoadingUsers && <p className="text-sm text-muted-foreground text-center py-4">Loading users...</p>}
              {!isLoadingUsers &&
                userResults.map((u: any) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={u.profilePicture || "/placeholder.svg"} />
                        <AvatarFallback>{u.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{u.name}</p>
                        <p className="text-sm text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={selectedUsers.includes(u.id) ? "default" : "secondary"}
                      onClick={() => {
                        setSelectedUsers(
                          selectedUsers.includes(u.id)
                            ? selectedUsers.filter((id) => id !== u.id)
                            : [...selectedUsers, u.id]
                        )
                      }}
                    >
                      {selectedUsers.includes(u.id) ? "Selected" : "Select"}
                    </Button>
                  </div>
                ))}

              {!isLoadingUsers && userSearch && userResults.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No users found matching &quot;{userSearch}&quot;
                </p>
              )}

            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={shareNotes}
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
