"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CollaborationIndicators } from "@/components/collaboration-indicators"
import { Search, Users, Globe, FileText, Clock, MessageSquare, Star, Eye, Edit3, Share2 } from "lucide-react"

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

export function SharedNotesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("shared-with-me")

  const sharedWithMe: SharedNote[] = [
    {
      id: "1",
      title: "Q4 Product Roadmap",
      content:
        "Comprehensive roadmap for Q4 product development including new features, improvements, and technical debt...",
      author: "Jane Smith",
      authorAvatar: "/placeholder.svg?height=32&width=32",
      collaborators: ["Mike Johnson", "Sarah Wilson"],
      visibility: "shared",
      updatedAt: "2 hours ago",
      comments: 5,
      views: 23,
      isStarred: true,
    },
    {
      id: "2",
      title: "Design System Guidelines",
      content: "Updated design system with new components, color palette, and typography guidelines for the team...",
      author: "Mike Johnson",
      authorAvatar: "/placeholder.svg?height=32&width=32",
      collaborators: ["Jane Smith", "Alex Chen"],
      visibility: "shared",
      updatedAt: "5 hours ago",
      comments: 8,
      views: 45,
      isStarred: false,
    },
    {
      id: "3",
      title: "API Documentation v2.0",
      content: "Complete API documentation for version 2.0 including authentication, endpoints, and examples...",
      author: "Sarah Wilson",
      authorAvatar: "/placeholder.svg?height=32&width=32",
      collaborators: ["Tech Team"],
      visibility: "public",
      updatedAt: "1 day ago",
      comments: 12,
      views: 156,
      isStarred: true,
    },
  ]

  const mySharedNotes: SharedNote[] = [
    {
      id: "4",
      title: "Team Meeting Notes - Weekly Sync",
      content: "Weekly team synchronization meeting notes covering project updates, blockers, and next steps...",
      author: "John Doe",
      collaborators: ["Jane Smith", "Mike Johnson", "Sarah Wilson"],
      visibility: "shared",
      updatedAt: "3 hours ago",
      comments: 3,
      views: 18,
      isStarred: false,
    },
    {
      id: "5",
      title: "Project Requirements Document",
      content:
        "Detailed requirements for the new collaboration features including user stories and acceptance criteria...",
      author: "John Doe",
      collaborators: ["Product Team"],
      visibility: "shared",
      updatedAt: "1 day ago",
      comments: 7,
      views: 34,
      isStarred: false,
    },
  ]

  const publicNotes: SharedNote[] = [
    {
      id: "6",
      title: "Open Source Contribution Guide",
      content:
        "Guidelines for contributing to our open source projects including setup, coding standards, and PR process...",
      author: "Alex Chen",
      authorAvatar: "/placeholder.svg?height=32&width=32",
      collaborators: ["Community"],
      visibility: "public",
      updatedAt: "2 days ago",
      comments: 25,
      views: 342,
      isStarred: true,
    },
    {
      id: "7",
      title: "Best Practices for Remote Work",
      content: "Collection of best practices and tips for effective remote work and team collaboration...",
      author: "Lisa Park",
      authorAvatar: "/placeholder.svg?height=32&width=32",
      collaborators: ["HR Team"],
      visibility: "public",
      updatedAt: "3 days ago",
      comments: 18,
      views: 289,
      isStarred: false,
    },
  ]

  const getCurrentNotes = () => {
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

  const filteredNotes = getCurrentNotes().filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.author.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getVisibilityIcon = (visibility: "shared" | "public") => {
    return visibility === "public" ? (
      <Globe className="h-4 w-4 text-accent" />
    ) : (
      <Users className="h-4 w-4 text-primary" />
    )
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-balance">Shared Notes</h1>
          <p className="text-muted-foreground">Collaborate and discover notes shared with you and the community</p>
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="shared-with-me">Shared with Me</TabsTrigger>
          <TabsTrigger value="my-shared">My Shared Notes</TabsTrigger>
          <TabsTrigger value="public">Public Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="shared-with-me" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{filteredNotes.length} notes shared with you</p>
          </div>

          {filteredNotes.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No shared notes found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? "Try adjusting your search terms" : "Notes shared with you will appear here"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredNotes.map((note) => (
                <Card key={note.id} className="group hover:shadow-md transition-all duration-200 cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                          {note.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={note.authorAvatar || "/placeholder.svg"} />
                            <AvatarFallback className="text-xs">
                              {note.author
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-muted-foreground">{note.author}</span>
                          <div className="flex items-center gap-1">
                            {getVisibilityIcon(note.visibility)}
                            <span className="text-xs text-muted-foreground capitalize">{note.visibility}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {note.isStarred && <Star className="h-4 w-4 fill-current text-yellow-500" />}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{note.content}</p>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {note.updatedAt}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {note.comments}
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {note.views}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {note.collaborators.length} collaborators
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-shared" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{filteredNotes.length} notes you've shared</p>
            <Button size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share New Note
            </Button>
          </div>

          {filteredNotes.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No shared notes yet</h3>
                <p className="text-muted-foreground mb-4">Start collaborating by sharing your notes with others</p>
                <Button>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share a Note
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredNotes.map((note) => (
                <Card key={note.id} className="group hover:shadow-md transition-all duration-200 cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                          {note.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-1">
                            {getVisibilityIcon(note.visibility)}
                            <span className="text-xs text-muted-foreground capitalize">{note.visibility}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            <Users className="h-3 w-3 mr-1" />
                            {note.collaborators.length}
                          </Badge>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{note.content}</p>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {note.updatedAt}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {note.comments}
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {note.views}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="public" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{filteredNotes.length} public notes available</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredNotes.map((note) => (
              <Card key={note.id} className="group hover:shadow-md transition-all duration-200 cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                        {note.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={note.authorAvatar || "/placeholder.svg"} />
                          <AvatarFallback className="text-xs">
                            {note.author
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">{note.author}</span>
                        <Badge variant="secondary" className="text-xs">
                          <Globe className="h-3 w-3 mr-1" />
                          Public
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {note.isStarred && <Star className="h-4 w-4 fill-current text-yellow-500" />}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{note.content}</p>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {note.updatedAt}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {note.comments}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {note.views}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
