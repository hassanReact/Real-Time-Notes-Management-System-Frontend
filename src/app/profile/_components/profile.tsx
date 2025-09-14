"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { userService } from "@/lib/services"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, Save, Upload, Settings } from "lucide-react"

interface UserProfile {
  id: string
  name: string
  email: string
  phone: string | null
  profilePicture: string | null
  role: 'USER' | 'ADMIN'
  isActive: boolean
  emailVerified: boolean
  createdAt: string
  updatedAt: string
}

interface User extends UserProfile {
  bio?: string
  location?: string
  website?: string
}

export function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile>({
    id: user?.id || "",
    name: user?.name || "",
    email: user?.email || "",
    phone: null,
    profilePicture: null,
    role: user?.role || "USER",
    isActive: true,
    emailVerified: false,
    createdAt: user?.createdAt || new Date().toISOString(),
    updatedAt: user?.updatedAt || new Date().toISOString()
  })

  const [editedProfile, setEditedProfile] = useState(profile)

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await userService.getProfile()
        console.log("Profile response:", response)
        if (response.data.success) {
          const userData = response.data.data
          console.log("Fetched user data:", userData)
          const updatedProfile = {
            id: userData.id,
            name: userData.name || "",
            email: userData.email,
            phone: userData.phone || null,
            profilePicture: userData.profilePicture || null,
            role: userData.role as 'USER' | 'ADMIN',
            isActive: Boolean(userData.isActive),
            emailVerified: Boolean(userData.emailVerified),
            createdAt: userData.createdAt,
            updatedAt: userData.updatedAt
          }
          setProfile(updatedProfile)
          setEditedProfile(updatedProfile)
        }
      } catch (error: any) {
        console.error("Failed to fetch user profile:", error)
        toast.error("Failed to load profile", {
          description: error.response?.data?.message || "Please try again later"
        })
      }
    }

    fetchUserProfile()
  }, [])


  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await userService.updateProfile({
        name: editedProfile.name,
        email: editedProfile.email,
        phone: editedProfile.phone || ""
      })

      if (response.data.success) {
        setProfile(prevProfile => ({
          ...prevProfile,
          ...response.data.data
        }))
        toast.success("Profile updated successfully!")
      }
      setIsEditing(false)
    } catch (error: any) {
      toast.error("Failed to update profile", {
        description: error.response?.data?.message || "Please try again later"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditedProfile(profile)
    setIsEditing(false)
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await userService.uploadAvatar(file)
      
      if (response.data.success) {
        setProfile(prev => ({
          ...prev,
          profilePicture: response.data.data.profilePicture
        }))
        toast.success("Profile picture updated successfully!")
      }
    } catch (error: any) {
      toast.error("Failed to upload profile picture", {
        description: error.response?.data?.message || "Please try again later"
      })
    }
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-balance">Profile</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        {isEditing ? (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Save className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        ) : (
          <Button onClick={() => setIsEditing(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Info */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your personal details and public profile information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={profile.profilePicture || "/placeholder.svg"} alt={profile.name} />
                        <AvatarFallback className="text-lg">
                          {profile.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      {isEditing && (
                        <>
                          <input
                            type="file"
                            id="avatar-upload"
                            className="hidden"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-transparent"
                            onClick={() => document.getElementById('avatar-upload')?.click()}
                          >
                            <Upload className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{profile.name}</h3>
                      <p className="text-sm text-muted-foreground">{profile.email}</p>
                      <p className="text-sm text-muted-foreground">Member since {profile.createdAt}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      {isEditing ? (
                        <Input
                          id="name"
                          value={editedProfile.name}
                          onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                        />
                      ) : (
                        <div className="flex items-center gap-2 p-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{profile.name}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      {isEditing ? (
                        <Input
                          id="email"
                          type="email"
                          value={editedProfile.email}
                          onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                        />
                      ) : (
                        <div className="flex items-center gap-2 p-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{profile.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>


          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
