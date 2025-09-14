"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Save, RotateCcw, Shield } from "lucide-react"
import { toast } from "sonner"
import { ChangePasswordForm } from "./change-password-form"

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

            <Tabs defaultValue="security" className="space-y-6">

                <TabsContent value="security" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Security Settings
                            </CardTitle>
                            <CardDescription>Manage your account security settings</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Change Password</h3>
                                <ChangePasswordForm
                                    onSuccess={() => {
                                        toast.success("Password changed", {
                                            description: "Your password has been successfully updated.",
                                        })
                                    }}
                                />
                            </div>

                            <Separator />
                        </CardContent>
                    </Card>
                </TabsContent>

            </Tabs>
        </div>
    )
}
