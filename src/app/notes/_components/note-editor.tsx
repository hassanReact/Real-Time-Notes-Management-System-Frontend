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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CollaborationIndicators, LiveCursors, ActivityIndicator } from "@/components/collaboration-indicators"
import { useRealTime } from "@/components/real-time-provider"
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
  Star,
  StarOff,
  History,
  MessageSquare,
  UserPlus,
} from "lucide-react"
import Link from "next/link"

interface NoteEditorProps {
  noteId: string
}

interface Note {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
  tags: string[]
  isShared: boolean
  isFavorite: boolean
  author: string
  collaborators: string[]
  visibility: "private" | "shared" | "public"
}

interface Comment {
  id: string
  author: string
  content: string
  timestamp: string
  avatar?: string
}

interface Version {
  id: string
  timestamp: string
  author: string
  changes: string
}

export function NoteEditor({ noteId }: NoteEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const { joinRoom, leaveRoom, onlineUsers } = useRealTime()

  // Mock note data - in real app this would come from API
  const [note, setNote] = useState<Note>({
    id: noteId,
    title: "Project Planning Meeting Notes",
    content: `# Project Planning Meeting Notes

## Attendees
- John Doe (Product Manager)
- Jane Smith (Tech Lead)
- Mike Johnson (Designer)
- Sarah Wilson (Developer)

## Agenda Items

### 1. Q4 Roadmap Review
- Discussed upcoming features for Q4 release
- Prioritized user-requested enhancements
- Reviewed technical debt items

### 2. Resource Allocation
- Team capacity planning for next quarter
- New hire requirements and timeline
- Budget considerations for external tools

### 3. Key Decisions Made
1. **Feature Priority**: Real-time collaboration will be the main focus
2. **Timeline**: Target release date set for December 15th
3. **Team Structure**: Adding 2 new developers to the team
4. **Technology Stack**: Approved use of WebSocket for real-time features

## Action Items
- [ ] Create detailed technical specifications (Jane)
- [ ] Design mockups for collaboration features (Mike)
- [ ] Set up hiring pipeline for new developers (John)
- [ ] Research WebSocket implementation options (Sarah)

## Next Steps
- Weekly check-ins every Tuesday at 2 PM
- Technical design review scheduled for next Friday
- User testing sessions to begin in 2 weeks

---
*Meeting concluded at 3:30 PM*`,
    createdAt: "2024-01-15",
    updatedAt: "2 hours ago",
    tags: ["meeting", "planning", "q4", "roadmap"],
    isShared: true,
    isFavorite: true,
    author: "John Doe",
    collaborators: ["Jane Smith", "Mike Johnson", "Sarah Wilson"],
    visibility: "shared",
  })

  const [editedNote, setEditedNote] = useState(note)

  const [comments] = useState<Comment[]>([
    {
      id: "1",
      author: "Jane Smith",
      content: "Great meeting notes! I'll start working on the technical specifications this week.",
      timestamp: "1 hour ago",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: "2",
      author: "Mike Johnson",
      content: "The mockups should be ready by Thursday. I'll share them in our design channel.",
      timestamp: "45 minutes ago",
      avatar: "/placeholder.svg?height=32&width=32",
    },
  ])

  const [versions] = useState<Version[]>([
    {
      id: "1",
      timestamp: "2 hours ago",
      author: "John Doe",
      changes: "Added action items and next steps section",
    },
    {
      id: "2",
      timestamp: "3 hours ago",
      author: "John Doe",
      changes: "Updated attendees list and key decisions",
    },
    {
      id: "3",
      timestamp: "4 hours ago",
      author: "John Doe",
      changes: "Initial note creation",
    },
  ])

  useEffect(() => {
    // Join the note room for real-time collaboration
    joinRoom(`note-${noteId}`)

    return () => {
      leaveRoom(`note-${noteId}`)
    }
  }, [noteId, joinRoom, leaveRoom])

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setNote(editedNote)
    setIsEditing(false)
    setIsSaving(false)
    setLastSaved(new Date())
  }

  const handleCancel = () => {
    setEditedNote(note)
    setIsEditing(false)
  }

  const toggleFavorite = () => {
    const updated = { ...note, isFavorite: !note.isFavorite }
    setNote(updated)
    setEditedNote(updated)
  }

  const getVisibilityIcon = (visibility: Note["visibility"]) => {
    switch (visibility) {
      case "private":
        return <Lock className="h-4 w-4" />
      case "shared":
        return <Users className="h-4 w-4" />
      case "public":
        return <Globe className="h-4 w-4" />
    }
  }

  const viewingUsers = onlineUsers.slice(0, 2).map((u) => u.name)
  const editingUsers = isEditing ? ["John Doe"] : []

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      <LiveCursors noteId={noteId} />

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
            <span className="text-sm text-muted-foreground capitalize">{note.visibility}</span>
          </div>

          <CollaborationIndicators noteId={noteId} />
        </div>

        <div className="flex items-center gap-2">
          {lastSaved && <span className="text-xs text-muted-foreground">Saved {lastSaved.toLocaleTimeString()}</span>}

          <Button variant="ghost" size="sm" onClick={toggleFavorite}>
            {note.isFavorite ? (
              <Star className="h-4 w-4 fill-current text-yellow-500" />
            ) : (
              <StarOff className="h-4 w-4" />
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Share2 className="h-4 w-4 mr-2" />
                Share Note
              </DropdownMenuItem>
              <DropdownMenuItem>
                <UserPlus className="h-4 w-4 mr-2" />
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
                <CardTitle className="text-2xl">{note.title}</CardTitle>
              )}

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Updated {note.updatedAt}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {note.collaborators.length + 1} collaborators
                </div>
              </div>

              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {note.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
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
                  value={editedNote.content}
                  onChange={(e) => setEditedNote({ ...editedNote, content: e.target.value })}
                  className="min-h-[500px] font-mono text-sm"
                  placeholder="Start writing your note..."
                />
              ) : (
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{note.content}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Collaborators */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Collaborators</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{note.author}</p>
                  <p className="text-xs text-muted-foreground">Owner</p>
                </div>
              </div>

              {note.collaborators.map((collaborator, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {collaborator
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{collaborator}</p>
                    <p className="text-xs text-muted-foreground">Editor</p>
                  </div>
                </div>
              ))}

              <Button variant="outline" size="sm" className="w-full bg-transparent">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Collaborator
              </Button>
            </CardContent>
          </Card>

          {/* Activity Tabs */}
          <Card>
            <Tabs defaultValue="comments" className="w-full">
              <CardHeader className="pb-3">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="comments" className="text-xs">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Comments
                  </TabsTrigger>
                  <TabsTrigger value="history" className="text-xs">
                    <History className="h-3 w-3 mr-1" />
                    History
                  </TabsTrigger>
                </TabsList>
              </CardHeader>

              <CardContent className="pt-0">
                <TabsContent value="comments" className="space-y-4 mt-0">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={comment.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="text-xs">
                          {comment.author
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="bg-muted rounded-lg p-2">
                          <p className="text-xs font-medium">{comment.author}</p>
                          <p className="text-xs text-muted-foreground mt-1">{comment.content}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{comment.timestamp}</p>
                      </div>
                    </div>
                  ))}

                  <div className="flex gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">JD</AvatarFallback>
                    </Avatar>
                    <Input placeholder="Add a comment..." className="text-xs" />
                  </div>
                </TabsContent>

                <TabsContent value="history" className="space-y-3 mt-0">
                  {versions.map((version) => (
                    <div key={version.id} className="border-l-2 border-muted pl-3">
                      <p className="text-xs font-medium">{version.author}</p>
                      <p className="text-xs text-muted-foreground">{version.changes}</p>
                      <p className="text-xs text-muted-foreground">{version.timestamp}</p>
                    </div>
                  ))}
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  )
}
