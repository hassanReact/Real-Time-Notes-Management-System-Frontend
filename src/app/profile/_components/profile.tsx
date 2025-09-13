"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { User, Mail, MapPin, LinkIcon, Save, Upload, FileText, Users, Star, Activity, Settings } from "lucide-react"

interface UserProfile {
  id: string
  name: string
  email: string
  avatar?: string
  bio: string
  location: string
  website: string
  joinedDate: string
  stats: {
    totalNotes: number
    sharedNotes: number
    collaborations: number
    favorites: number
  }
}

export function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [profile, setProfile] = useState<UserProfile>({
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    avatar: "/placeholder.svg?height=128&width=128",
    bio: "Product Manager passionate about building tools that help teams collaborate better. Love exploring new technologies and sharing knowledge.",
    location: "San Francisco, CA",
    website: "https://johndoe.dev",
    joinedDate: "January 2024",
    stats: {
      totalNotes: 42,
      sharedNotes: 8,
      collaborations: 15,
      favorites: 12,
    },
  })

  const [editedProfile, setEditedProfile] = useState(profile)

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: false,
    collaborationAlerts: true,
    weeklyDigest: true,
    publicProfile: false,
    showActivity: true,
    theme: "system" as "light" | "dark" | "system",
  })

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setProfile(editedProfile)
    setIsEditing(false)
    setIsSaving(false)
  }

  const handleCancel = () => {
    setEditedProfile(profile)
    setIsEditing(false)
  }

  const handleAvatarUpload = () => {
    // Simulate file upload
    console.log("[v0] Avatar upload triggered")
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                        <AvatarImage src={profile.avatar || "/placeholder.svg"} alt={profile.name} />
                        <AvatarFallback className="text-lg">
                          {profile.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      {isEditing && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-transparent"
                          onClick={handleAvatarUpload}
                        >
                          <Upload className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{profile.name}</h3>
                      <p className="text-sm text-muted-foreground">{profile.email}</p>
                      <p className="text-sm text-muted-foreground">Member since {profile.joinedDate}</p>
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

                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      {isEditing ? (
                        <Input
                          id="location"
                          value={editedProfile.location}
                          onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })}
                          placeholder="City, Country"
                        />
                      ) : (
                        <div className="flex items-center gap-2 p-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{profile.location}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      {isEditing ? (
                        <Input
                          id="website"
                          value={editedProfile.website}
                          onChange={(e) => setEditedProfile({ ...editedProfile, website: e.target.value })}
                          placeholder="https://yourwebsite.com"
                        />
                      ) : (
                        <div className="flex items-center gap-2 p-2">
                          <LinkIcon className="h-4 w-4 text-muted-foreground" />
                          <a
                            href={profile.website}
                            className="text-primary hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {profile.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    {isEditing ? (
                      <Textarea
                        id="bio"
                        value={editedProfile.bio}
                        onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                        placeholder="Tell us about yourself..."
                        rows={4}
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground p-2 bg-muted/50 rounded-md">{profile.bio}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Stats */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Statistics</CardTitle>
                  <CardDescription>Your activity overview</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="text-sm">Total Notes</span>
                    </div>
                    <Badge variant="secondary">{profile.stats.totalNotes}</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-accent" />
                      <span className="text-sm">Shared Notes</span>
                    </div>
                    <Badge variant="secondary">{profile.stats.sharedNotes}</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-chart-2" />
                      <span className="text-sm">Collaborations</span>
                    </div>
                    <Badge variant="secondary">{profile.stats.collaborations}</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">Favorites</span>
                    </div>
                    <Badge variant="secondary">{profile.stats.favorites}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how you want to be notified about activity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email updates about your notes and collaborations
                  </p>
                </div>
                <Switch
                  checked={preferences.emailNotifications}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, emailNotifications: checked })}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Get instant notifications in your browser</p>
                </div>
                <Switch
                  checked={preferences.pushNotifications}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, pushNotifications: checked })}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Collaboration Alerts</Label>
                  <p className="text-sm text-muted-foreground">Notify when someone edits your shared notes</p>
                </div>
                <Switch
                  checked={preferences.collaborationAlerts}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, collaborationAlerts: checked })}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Weekly Digest</Label>
                  <p className="text-sm text-muted-foreground">Get a summary of your weekly activity</p>
                </div>
                <Switch
                  checked={preferences.weeklyDigest}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, weeklyDigest: checked })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Control your profile visibility and data sharing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Public Profile</Label>
                  <p className="text-sm text-muted-foreground">Make your profile visible to other users</p>
                </div>
                <Switch
                  checked={preferences.publicProfile}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, publicProfile: checked })}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Activity</Label>
                  <p className="text-sm text-muted-foreground">Display your recent activity to collaborators</p>
                </div>
                <Switch
                  checked={preferences.showActivity}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, showActivity: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your recent actions and collaborations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: "Created note", item: "Project Planning Meeting Notes", time: "2 hours ago" },
                  { action: "Shared note", item: "Research Ideas for New Feature", time: "5 hours ago" },
                  { action: "Commented on", item: "Weekly Team Standup", time: "1 day ago" },
                  { action: "Updated note", item: "API Documentation Draft", time: "2 days ago" },
                  { action: "Favorited note", item: "Personal Learning Goals", time: "3 days ago" },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Activity className="h-4 w-4 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium">{activity.action}</span>{" "}
                        <span className="text-muted-foreground">"{activity.item}"</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security and authentication</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label>Password</Label>
                    <p className="text-sm text-muted-foreground">Last changed 3 months ago</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Change Password
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Enable 2FA
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label>Active Sessions</Label>
                    <p className="text-sm text-muted-foreground">Manage devices that are signed in to your account</p>
                  </div>
                  <Button variant="outline" size="sm">
                    View Sessions
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label>Download Data</Label>
                    <p className="text-sm text-muted-foreground">Export all your notes and account data</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Export Data
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg border-destructive/50">
                  <div className="space-y-1">
                    <Label className="text-destructive">Delete Account</Label>
                    <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                  </div>
                  <Button variant="destructive" size="sm">
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
