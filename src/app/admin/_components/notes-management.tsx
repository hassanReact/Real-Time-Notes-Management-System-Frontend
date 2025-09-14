"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { adminService } from "@/lib/services"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Search, Filter, Eye, Trash2, FileText, Calendar, User } from "lucide-react"
import { useAdminNotes, useDeleteNote } from "@/hooks/use-admin"

// Notes interfaces
interface Note {
  id: string
  title: string
  description: string
  content?: string
  createdAt: string
  updatedAt: string
  author: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  isPublic?: boolean
  tags?: string[]
}

export function NotesManagement() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState<{
    tags: string[]
    title: string
    description : string
  }>({
    tags: [], 
    title: "", description: ""
  });
  const queryClient = useQueryClient()

  // Fetch all notes
  const { data: notesData, isLoading } = useQuery({
    queryKey: ["admin-notes", { page, search }],
    queryFn: () => adminService.getAllNotes({
      page,
      limit: 10,
      search: search || undefined
    }),
  })

  // Delete note mutation
  const deleteNoteMutation = useDeleteNote()

  // Update note mutation (using updateUser API structure)
  const updateNoteMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { description?: string; tags?: string[]; title?: string } }) =>
      adminService.updateNote(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notes"] })
      toast.success("Note updated successfully")
      setIsEditDialogOpen(false)
      setSelectedNote(null)
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update note")
    },
  })

  const handleViewNote = (note: Note) => {
    setSelectedNote(note)
    setIsViewDialogOpen(true)
  }

  const handleEditNote = (note: any) => {
    setSelectedNote(note)
    setEditForm({
      title: note.title || "",
      description: note.description || "",
      tags: note.tags || []
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateNote = () => {
    if (!selectedNote) return
    updateNoteMutation.mutate({ id: selectedNote.id, data: editForm })
  }

  const handleDeleteNote = (note: Note) => {
    if (window.confirm(`Are you sure you want to delete "${note.title}"? This action cannot be undone.`)) {
      deleteNoteMutation.mutate(note.id)
    }
  }

  const getVisibilityColor = (isPublic: boolean) => {
    return isPublic
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
  }

  // Extract data from API response
  const notes = notesData?.data?.data.data || []
  const totalNotes = notesData?.data.data.meta?.total || 0
  const totalPages = notesData?.data.data.meta?.totalPages || 1
  const currentPage = notesData?.data.data.meta?.page || 1

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notes Management</h1>
          <p className="text-muted-foreground">View, edit, and manage all user notes</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            <FileText className="w-3 h-3 mr-1" />
            {totalNotes} Total Notes
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalNotes}</div>
            <p className="text-xs text-muted-foreground">All notes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Public Notes</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {notes.filter((note: any) => note.isPublic).length}
            </div>
            <p className="text-xs text-muted-foreground">Publicly visible</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Private Notes</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {notes.filter((note: any) => !note.isPublic).length}
            </div>
            <p className="text-xs text-muted-foreground">Private only</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Notes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {notes.filter((note: any) => {
                const createdDate = new Date(note.createdAt)
                const weekAgo = new Date()
                weekAgo.setDate(weekAgo.getDate() - 7)
                return createdDate > weekAgo
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search notes by title or content..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline" onClick={() => setPage(1)}>
              <Filter className="w-4 h-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notes Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Notes ({totalNotes})</CardTitle>
          <CardDescription>Manage and moderate user-created notes</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No notes found</p>
              {search && (
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your search query
                </p>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Note</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Visibility</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notes.map((note: any) => (
                      <TableRow key={note.id}>
                        <TableCell>
                          <div className="max-w-xs">
                            <div className="font-medium truncate">{note.title}</div>
                            <div className="text-sm text-muted-foreground truncate mt-1">
                              {note.description}
                            </div>
                            {note.tags && note.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {note.tags.slice(0, 2).map((tag: string) => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {note.tags.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{note.tags.length - 2}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={note.author?.avatar || "/placeholder.svg"} />
                              <AvatarFallback>
                                {note.author?.name?.charAt(0)?.toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-sm">{note.author?.name}</div>
                              <div className="text-xs text-muted-foreground">{note.author?.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getVisibilityColor(note.isPublic)} variant="secondary">
                            {note.isPublic ? "PUBLIC" : "PRIVATE"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(note.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(note.updatedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewNote(note)}
                              className="h-8 w-8 p-0"
                              title="View note"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditNote(note)}
                              className="h-8 w-8 p-0"
                              title="Edit note"
                            >
                              <FileText className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteNote(note)}
                              disabled={deleteNoteMutation.isPending}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                              title="Delete note"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {notes.map((note: any) => (
                  <Card key={note.id}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-sm truncate">{note.title}</h3>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {note.description}
                            </p>
                          </div>
                          <Badge className={getVisibilityColor(note.isPublic)} variant="secondary">
                            {note.isPublic ? "PUBLIC" : "PRIVATE"}
                          </Badge>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={note.author?.avatar || "/placeholder.svg"} />
                            <AvatarFallback>
                              {note.author?.name?.charAt(0)?.toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="text-xs font-medium">{note.author?.name}</div>
                            <div className="text-xs text-muted-foreground">
                              Created {new Date(note.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        {note.tags && note.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {note.tags.slice(0, 3).map((tag: string) => (
                              <Badge key={tag} variant="outline" className="text-xs">
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

                        <div className="flex items-center justify-end space-x-1 pt-2 border-t">
                          <Button variant="ghost" size="sm" onClick={() => handleViewNote(note)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEditNote(note)}>
                            <FileText className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteNote(note)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-6 border-t">
                  <p className="text-sm text-muted-foreground">
                    Showing page {currentPage} of {totalPages} ({totalNotes} total notes)
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setPage(currentPage - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setPage(currentPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* View Note Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>View Note</DialogTitle>
            <DialogDescription>
              Note details and content
            </DialogDescription>
          </DialogHeader>
          {selectedNote && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Title</Label>
                <p className="text-sm mt-1">{selectedNote.title}</p>
              </div>

              <div>
                <Label className="text-sm font-medium">Description</Label>
                <div className="mt-1 p-3 bg-muted rounded-lg">
                  <p className="text-sm">{selectedNote.description}</p>
                </div>
              </div>

              {selectedNote.content && (
                <div>
                  <Label className="text-sm font-medium">Content</Label>
                  <div className="mt-1 p-3 bg-muted rounded-lg max-h-40 overflow-y-auto">
                    <p className="text-sm whitespace-pre-wrap">{selectedNote.content}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Author</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={selectedNote.author?.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {selectedNote.author?.name?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{selectedNote.author?.name}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Visibility</Label>
                  <div className="mt-1">
                    <Badge className={getVisibilityColor(selectedNote.isPublic || false)}>
                      {selectedNote.isPublic ? "PUBLIC" : "PRIVATE"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(selectedNote.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Last Updated</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(selectedNote.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {selectedNote.tags && selectedNote.tags.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Tags</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedNote.tags.map((tag: string) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setIsViewDialogOpen(false)
              if (selectedNote) handleEditNote(selectedNote)
            }}>
              Edit Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Note Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
            <DialogDescription>
              Update note information
            </DialogDescription>
          </DialogHeader>
          {selectedNote && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  placeholder="Note title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Note description"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={editForm.tags.join(", ")}
                  onChange={(e) => setEditForm({
                    ...editForm,
                    tags: e.target.value.split(",").map(tag => tag.trim()).filter(Boolean)
                  })}
                  placeholder="Separate tags with commas"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateNote}
              disabled={updateNoteMutation.isPending}
            >
              {updateNoteMutation.isPending ? "Updating..." : "Update Note"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}