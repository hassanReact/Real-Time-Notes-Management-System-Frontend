"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { adminService } from "@/lib/services"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Search, UserPlus, Trash2, UserCheck, Filter } from "lucide-react"
import type { User } from "@/lib/types"
import { useAdminUsers } from "@/hooks/use-admin"

export function UserManagement() {
    const [search, setSearch] = useState("")
    const [roleFilter, setRoleFilter] = useState<string>("all")
    const [_page, setPage] = useState(1)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
    const [newRole, setNewRole] = useState<"USER" | "ADMIN">("USER")

    const queryClient = useQueryClient()

    // Fetch users with filters
    const { data: usersData, isLoading } = useAdminUsers()

    // Toggle user status mutation (activate/deactivate)
    const toggleStatusMutation = useMutation({
        mutationFn: (userId: string) => adminService.toggleUserStatus(userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-users"] })
            toast.success("User status updated successfully")
        },
        onError: (error: any) => {
            toast.error(error?.message || "Failed to update user status")
        },
    })

    // Change user role mutation
    const changeRoleMutation = useMutation({
        mutationFn: ({ userId, role }: { userId: string; role: "USER" | "ADMIN" }) => 
            adminService.changeUserRole(userId, role),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-users"] })
            toast.success("User role updated successfully")
            setIsRoleDialogOpen(false)
            setSelectedUser(null)
        },
        onError: (error: any) => {
            toast.error(error?.message || "Failed to update user role")
        },
    })


    // Delete user mutation
    const deleteUserMutation = useMutation({
        mutationFn: (id: string) => adminService.deleteUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-users"] })
            toast.success("User deleted successfully")
        },
        onError: (error: any) => {
            toast.error(error?.message || "Failed to delete user")
        },
    });

    // Handle change role - opens role change dialog
    const handleChangeRole = (user: User) => {
        setSelectedUser(user)
        setNewRole(user.role === "ADMIN" ? "USER" : "ADMIN")
        setIsRoleDialogOpen(true)
    }

    // Submit role change
    const handleRoleChange = () => {
        if (!selectedUser) return
        changeRoleMutation.mutate({ userId: selectedUser.id, role: newRole })
    }

    // Handle delete user with confirmation
    const handleDeleteUser = (user: User) => {
        if (window.confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
            deleteUserMutation.mutate(user.id)
        }
    }

    // Get role badge color
    const getRoleColor = (role: string) => {
        switch (role) {
            case "ADMIN":
                return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            case "USER":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
        }
    }

    // Get status badge color
    const getStatusColor = (isActive: boolean) => {
        return isActive 
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    }

    // Extract data from API response
    const users = usersData?.data?.data?.data || []
    const totalUsers = usersData?.data.data.meta?.total || 0
    const totalPages = usersData?.data.data.meta?.totalPages || 1
    const currentPage = usersData?.data.data.meta?.page || 1

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">User Management</h1>
                    <p className="text-muted-foreground">Manage users, roles, and permissions</p>
                </div>
                <Button>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add User
                </Button>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                <Input
                                    placeholder="Search users by name or email..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger className="w-[180px]">
                                <Filter className="w-4 h-4 mr-2" />
                                <SelectValue placeholder="Filter by role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                <SelectItem value="USER">Users</SelectItem>
                                <SelectItem value="ADMIN">Admins</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Users ({totalUsers})</CardTitle>
                    <CardDescription>Manage user accounts and permissions</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground text-lg">No users found</p>
                            {search && (
                                <p className="text-sm text-muted-foreground mt-2">
                                    Try adjusting your search or filters
                                </p>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table View */}
                            <div className="hidden md:block overflow-x-auto">
                                <div className="min-w-full">
                                    {/* Table Header */}
                                    <div className="grid grid-cols-7 gap-4 p-4 bg-muted/50 rounded-t-lg border-b font-medium text-sm">
                                        <div>User</div>
                                        <div>Role</div>
                                        <div>Status</div>
                                        <div>Notes</div>
                                        <div>Joined</div>
                                        <div>Last Updated</div>
                                        <div className="text-right">Actions</div>
                                    </div>
                                    
                                    {/* Table Body */}
                                    <div className="divide-y">
                                        {users.map((user: any) => (
                                            <div key={user.id} className="grid grid-cols-7 gap-4 p-4 hover:bg-muted/30 transition-colors">
                                                {/* User Info */}
                                                <div className="flex items-center space-x-3">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarImage src={user.avatar || "/placeholder.svg"} />
                                                        <AvatarFallback className="bg-primary/10">
                                                            {user.name?.charAt(0)?.toUpperCase() || "U"}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium text-sm">{user.name}</div>
                                                        <div className="text-xs text-muted-foreground">{user.email}</div>
                                                        {user.title && (
                                                            <div className="text-xs text-muted-foreground italic">{user.title}</div>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                {/* Role */}
                                                <div className="flex items-center">
                                                    <Badge className={getRoleColor(user.role)} variant="secondary">
                                                        {user.role}
                                                    </Badge>
                                                </div>
                                                
                                                {/* Status */}
                                                <div className="flex items-center">
                                                    <Badge className={getStatusColor(user.isActive)} variant="secondary">
                                                        {user.isActive ? "ACTIVE" : "INACTIVE"}
                                                    </Badge>
                                                </div>
                                                
                                                {/* Notes Count */}
                                                <div className="flex items-center">
                                                    <span className="text-sm text-muted-foreground">
                                                        {user._count?.notes || 0} notes
                                                    </span>
                                                </div>
                                                
                                                {/* Join Date */}
                                                <div className="flex items-center text-sm">
                                                    {new Date(user.createdAt).toLocaleDateString()}
                                                </div>
                                                
                                                {/* Last Updated */}
                                                <div className="flex items-center text-sm">
                                                    {new Date(user.updatedAt).toLocaleDateString()}
                                                </div>
                                                
                                                {/* Actions */}
                                                <div className="flex items-center justify-end space-x-1">
                                                    
                                                    {/* Change Role */}
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        onClick={() => handleChangeRole(user)}
                                                        className="h-8 w-8 p-0"
                                                        title="Change role"
                                                    >
                                                        <UserCheck className="w-4 h-4" />
                                                    </Button>
                                                    
                                                    {/* Toggle Status */}
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        onClick={() => toggleStatusMutation.mutate(user.id)}
                                                        disabled={toggleStatusMutation.isPending}
                                                        className={`h-8 px-2 text-xs ${
                                                            user.isActive 
                                                                ? "text-orange-600 hover:text-orange-700 hover:bg-orange-50" 
                                                                : "text-green-600 hover:text-green-700 hover:bg-green-50"
                                                        }`}
                                                        title={user.isActive ? "Deactivate user" : "Activate user"}
                                                    >
                                                        {user.isActive ? "Deactivate" : "Activate"}
                                                    </Button>
                                                    
                                                    {/* Delete User */}
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        onClick={() => handleDeleteUser(user)}
                                                        disabled={deleteUserMutation.isPending}
                                                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        title="Delete user"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Mobile Card View */}
                            <div className="md:hidden space-y-4">
                                {users.map((user: any) => (
                                    <Card key={user.id}>
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <Avatar className="h-12 w-12">
                                                        <AvatarImage src={user.avatar || "/placeholder.svg"} />
                                                        <AvatarFallback className="bg-primary/10">
                                                            {user.name?.charAt(0)?.toUpperCase() || "U"}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium">{user.name}</div>
                                                        <div className="text-sm text-muted-foreground">{user.email}</div>
                                                        {user.title && (
                                                            <div className="text-sm text-muted-foreground italic">{user.title}</div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end space-y-2">
                                                    <Badge className={getRoleColor(user.role)} variant="secondary">
                                                        {user.role}
                                                    </Badge>
                                                    <Badge className={getStatusColor(user.isActive)} variant="secondary">
                                                        {user.isActive ? "ACTIVE" : "INACTIVE"}
                                                    </Badge>
                                                </div>
                                            </div>
                                            
                                            <div className="mt-4 flex items-center justify-between">
                                                <div className="text-sm text-muted-foreground">
                                                    {user._count?.notes || 0} notes • Joined {new Date(user.createdAt).toLocaleDateString()}
                                                </div>
                                                <div className="flex space-x-1">
                                                    <Button variant="ghost" size="sm" onClick={() => handleChangeRole(user)}>
                                                        <UserCheck className="w-4 h-4" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        onClick={() => toggleStatusMutation.mutate(user.id)}
                                                        className={user.isActive ? "text-orange-600" : "text-green-600"}
                                                    >
                                                        {user.isActive ? "Deactivate" : "Activate"}
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        onClick={() => handleDeleteUser(user)}
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
                                        Showing page {currentPage} of {totalPages} ({totalUsers} total users)
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

            {/* Change Role Dialog */}
            <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Change User Role</DialogTitle>
                        <DialogDescription>
                            Update the role for {selectedUser?.name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Current Role</Label>
                            <div className="flex items-center space-x-2">
                                <Badge className={getRoleColor(selectedUser?.role || "")}>
                                    {selectedUser?.role}
                                </Badge>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="newRole">New Role</Label>
                            <Select value={newRole} onValueChange={(value: "USER" | "ADMIN") => setNewRole(value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="USER">User</SelectItem>
                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsRoleDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleRoleChange} 
                            disabled={changeRoleMutation.isPending}
                        >
                            {changeRoleMutation.isPending ? "Changing Role..." : "Change Role"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}