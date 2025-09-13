"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Palette, Bell, Zap, Users, FileText, Save, RotateCcw, Download, Upload } from "lucide-react"

export function SettingsPage() {
  const [settings, setSettings] = useState({
    // Appearance
    theme: "system" as "light" | "dark" | "system",
    fontSize: "medium" as "small" | "medium" | "large",
    compactMode: false,
    animations: true,

    // Editor
    autoSave: true,
    autoSaveInterval: 30,
    spellCheck: true,
    wordWrap: true,
    lineNumbers: false,

    // Collaboration
    showCursors: true,
    showPresence: true,
    allowComments: true,
    defaultVisibility: "private" as "private" | "shared" | "public",

    // Notifications
    desktopNotifications: true,
    soundEnabled: false,
    emailDigest: "weekly" as "daily" | "weekly" | "monthly" | "never",

    // Privacy
    analyticsEnabled: true,
    crashReporting: true,
    shareUsageData: false,

    // Advanced
    developerMode: false,
    betaFeatures: false,
    apiAccess: false,
  })

  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
  }

  const handleReset = () => {
    // Reset to default settings
    setSettings({
      theme: "system",
      fontSize: "medium",
      compactMode: false,
      animations: true,
      autoSave: true,
      autoSaveInterval: 30,
      spellCheck: true,
      wordWrap: true,
      lineNumbers: false,
      showCursors: true,
      showPresence: true,
      allowComments: true,
      defaultVisibility: "private",
      desktopNotifications: true,
      soundEnabled: false,
      emailDigest: "weekly",
      analyticsEnabled: true,
      crashReporting: true,
      shareUsageData: false,
      developerMode: false,
      betaFeatures: false,
      apiAccess: false,
    })
  }

  const handleExportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = "notes-settings.json"
    link.click()
  }

  const handleImportSettings = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const importedSettings = JSON.parse(e.target?.result as string)
            setSettings({ ...settings, ...importedSettings })
          } catch (error) {
            console.error("[v0] Failed to import settings:", error)
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-balance">Settings</h1>
          <p className="text-muted-foreground">Customize your Notes experience</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
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
      </div>

      <Tabs defaultValue="appearance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance
              </CardTitle>
              <CardDescription>Customize the look and feel of your workspace</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select
                    value={settings.theme}
                    onValueChange={(value: any) => setSettings({ ...settings, theme: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Font Size</Label>
                  <Select
                    value={settings.fontSize}
                    onValueChange={(value: any) => setSettings({ ...settings, fontSize: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Compact Mode</Label>
                  <p className="text-sm text-muted-foreground">Reduce spacing and padding for more content</p>
                </div>
                <Switch
                  checked={settings.compactMode}
                  onCheckedChange={(checked) => setSettings({ ...settings, compactMode: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Animations</Label>
                  <p className="text-sm text-muted-foreground">Enable smooth transitions and animations</p>
                </div>
                <Switch
                  checked={settings.animations}
                  onCheckedChange={(checked) => setSettings({ ...settings, animations: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="editor" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Editor Settings
              </CardTitle>
              <CardDescription>Configure your note editing experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto Save</Label>
                  <p className="text-sm text-muted-foreground">Automatically save changes as you type</p>
                </div>
                <Switch
                  checked={settings.autoSave}
                  onCheckedChange={(checked) => setSettings({ ...settings, autoSave: checked })}
                />
              </div>

              {settings.autoSave && (
                <div className="space-y-2">
                  <Label>Auto Save Interval (seconds)</Label>
                  <Input
                    type="number"
                    min="5"
                    max="300"
                    value={settings.autoSaveInterval}
                    onChange={(e) => setSettings({ ...settings, autoSaveInterval: Number.parseInt(e.target.value) })}
                  />
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Spell Check</Label>
                  <p className="text-sm text-muted-foreground">Check spelling as you type</p>
                </div>
                <Switch
                  checked={settings.spellCheck}
                  onCheckedChange={(checked) => setSettings({ ...settings, spellCheck: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Word Wrap</Label>
                  <p className="text-sm text-muted-foreground">Wrap long lines to fit the editor width</p>
                </div>
                <Switch
                  checked={settings.wordWrap}
                  onCheckedChange={(checked) => setSettings({ ...settings, wordWrap: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Line Numbers</Label>
                  <p className="text-sm text-muted-foreground">Show line numbers in the editor</p>
                </div>
                <Switch
                  checked={settings.lineNumbers}
                  onCheckedChange={(checked) => setSettings({ ...settings, lineNumbers: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collaboration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Collaboration
              </CardTitle>
              <CardDescription>Control how you collaborate with others</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Default Note Visibility</Label>
                <Select
                  value={settings.defaultVisibility}
                  onValueChange={(value: any) => setSettings({ ...settings, defaultVisibility: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="shared">Shared with Team</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Live Cursors</Label>
                  <p className="text-sm text-muted-foreground">Display other users' cursors in real-time</p>
                </div>
                <Switch
                  checked={settings.showCursors}
                  onCheckedChange={(checked) => setSettings({ ...settings, showCursors: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show User Presence</Label>
                  <p className="text-sm text-muted-foreground">Display who's currently viewing notes</p>
                </div>
                <Switch
                  checked={settings.showPresence}
                  onCheckedChange={(checked) => setSettings({ ...settings, showPresence: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Comments</Label>
                  <p className="text-sm text-muted-foreground">Let others comment on your shared notes</p>
                </div>
                <Switch
                  checked={settings.allowComments}
                  onCheckedChange={(checked) => setSettings({ ...settings, allowComments: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>Manage how and when you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Desktop Notifications</Label>
                  <p className="text-sm text-muted-foreground">Show notifications in your browser</p>
                </div>
                <Switch
                  checked={settings.desktopNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, desktopNotifications: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sound Effects</Label>
                  <p className="text-sm text-muted-foreground">Play sounds for notifications</p>
                </div>
                <Switch
                  checked={settings.soundEnabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, soundEnabled: checked })}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Email Digest Frequency</Label>
                <Select
                  value={settings.emailDigest}
                  onValueChange={(value: any) => setSettings({ ...settings, emailDigest: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Advanced Settings
              </CardTitle>
              <CardDescription>Advanced features and developer options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Developer Mode</Label>
                  <p className="text-sm text-muted-foreground">Enable advanced debugging features</p>
                </div>
                <Switch
                  checked={settings.developerMode}
                  onCheckedChange={(checked) => setSettings({ ...settings, developerMode: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Beta Features</Label>
                  <p className="text-sm text-muted-foreground">Access experimental features before they're released</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    Beta
                  </Badge>
                  <Switch
                    checked={settings.betaFeatures}
                    onCheckedChange={(checked) => setSettings({ ...settings, betaFeatures: checked })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>API Access</Label>
                  <p className="text-sm text-muted-foreground">Enable API access for third-party integrations</p>
                </div>
                <Switch
                  checked={settings.apiAccess}
                  onCheckedChange={(checked) => setSettings({ ...settings, apiAccess: checked })}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <Label>Data Management</Label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleExportSettings}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Settings
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleImportSettings}>
                    <Upload className="h-4 w-4 mr-2" />
                    Import Settings
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Analytics</Label>
                  <p className="text-sm text-muted-foreground">Help improve the app by sharing usage analytics</p>
                </div>
                <Switch
                  checked={settings.analyticsEnabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, analyticsEnabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Crash Reporting</Label>
                  <p className="text-sm text-muted-foreground">Automatically report crashes to help us fix bugs</p>
                </div>
                <Switch
                  checked={settings.crashReporting}
                  onCheckedChange={(checked) => setSettings({ ...settings, crashReporting: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
