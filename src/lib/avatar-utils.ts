import type { User } from "./types"

/**
 * Generate user initials from name or email
 * @param user - User object with name or email
 * @returns String of initials (max 2 characters)
 */
export function getUserInitials(user: User | null | undefined): string {
  if (!user) return "U"
  
  // Use name if available, otherwise use email
  const name = user.name || user.email
  
  if (!name) return "U"
  
  // Split by spaces and take first letter of each word
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) // Limit to 2 characters
  
  return initials || "U"
}

/**
 * Get user display name (name or email)
 * @param user - User object
 * @returns Display name string
 */
export function getUserDisplayName(user: User | null | undefined): string {
  if (!user) return "Unknown User"
  
  return user.name || user.email || "Unknown User"
}

/**
 * Get user email for display
 * @param user - User object
 * @returns Email string
 */
export function getUserEmail(user: User | null | undefined): string {
  if (!user) return ""
  
  return user.email || ""
}
