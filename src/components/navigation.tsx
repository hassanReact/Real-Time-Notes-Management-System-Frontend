"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { ThemeToggle } from "@/components/theme-toggle"
import { RealTimeNotifications } from "@/components/real-time-notifications"
import { CollaborationIndicators } from "@/components/collaboration-indicators"
import { Home, FileText, Users, Settings, Search, Plus, Sparkles, LogOut, User, Command } from "lucide-react"

interface NavigationProps {
  children: React.ReactNode
}

export function Navigation({ children }: NavigationProps) {
  const pathname = usePathname()
  const [commandOpen, setCommandOpen] = useState(false)

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/notes", label: "Notes", icon: FileText },
    { href: "/shared", label: "Shared", icon: Users },
    { href: "/profile", label: "Profile", icon: User },
    { href: "/settings", label: "Settings", icon: Settings },
  ]

  const mockSearchResults = [
    { id: "1", title: "Project Planning Meeting Notes", type: "note" },
    { id: "2", title: "Research Ideas for New Feature", type: "note" },
    { id: "3", title: "Weekly Team Standup", type: "note" },
  ]

  // Handle keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      setCommandOpen(true)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 glass">
        <div className="container flex h-16 items-center justify-between px-4">
          {/* Logo and Brand */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-xl font-bold">NotesAI</span>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search notes... (⌘K)"
                className="pl-10 pr-4"
                onClick={() => setCommandOpen(true)}
                readOnly
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Badge variant="secondary" className="text-xs">
                  <Command className="h-3 w-3 mr-1" />K
                </Badge>
              </div>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            <Button size="sm" className="hidden sm:flex">
              <Plus className="h-4 w-4 mr-2" />
              New Note
            </Button>

            <CollaborationIndicators />

            <RealTimeNotifications />

            <ThemeToggle />

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">John Doe</p>
                    <p className="text-xs leading-none text-muted-foreground">john@example.com</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="w-64 border-r border-border bg-muted/20 hidden md:block">
          <div className="flex h-full flex-col">
            <div className="flex-1 overflow-auto py-6">
              <nav className="grid gap-1 px-4">
                {navItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className={`w-full justify-start ${isActive ? "bg-secondary text-secondary-foreground" : ""}`}
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.label}
                      </Button>
                    </Link>
                  )
                })}
              </nav>
            </div>

            {/* Sidebar Footer */}
            <div className="border-t border-border p-4">
              <CollaborationIndicators />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>

      {/* Command Palette */}
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Quick Actions">
            <CommandItem>
              <Plus className="mr-2 h-4 w-4" />
              <span>Create New Note</span>
            </CommandItem>
            <CommandItem>
              <Users className="mr-2 h-4 w-4" />
              <span>View Shared Notes</span>
            </CommandItem>
            <CommandItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Open Settings</span>
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Recent Notes">
            {mockSearchResults.map((result) => (
              <CommandItem key={result.id}>
                <FileText className="mr-2 h-4 w-4" />
                <span>{result.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  )
}
