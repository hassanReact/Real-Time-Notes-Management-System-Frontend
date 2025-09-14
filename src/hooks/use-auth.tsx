"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { authService } from "@/lib/services"
import type { User, LoginData, RegisterData } from "@/lib/types"

interface AuthContextType {
  user: User | null
  token: string | null
  login: (data: LoginData) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  loading: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const setCookies = (access_token: string, user: User) => {
    // Set cookies that middleware can read
    document.cookie = `access_token=${access_token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`
    document.cookie = `user_role=${user.role}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`
  }

  const clearCookies = () => {
    document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"
    document.cookie = "user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"
  }

  useEffect(() => {
    // Check for existing token on mount
    const storedToken = localStorage.getItem("access_token")
    const storedUser = localStorage.getItem("user")

    if (storedToken && storedUser) {
      const parsedUser = JSON.parse(storedUser)
      setToken(storedToken)
      setUser(parsedUser)
      setCookies(storedToken, parsedUser)
    }

    setLoading(false)
  }, [])

  const isAdmin = user?.role === "ADMIN"

  const login = async (data: LoginData) => {
    try {
      const response = await authService.login(data.email, data.password)
      console.log("Full login response:", response.data) // Debug log
      
      // Handle API response structure: { success: true, data: { user, accessToken, refreshToken }, message }
      const responseData = response.data.data
      console.log("Extracted response data:", responseData) // Debug log
      
      const { accessToken, refreshToken, user } = responseData
      console.log("Tokens extracted:", { accessToken: !!accessToken, refreshToken: !!refreshToken, user: !!user }) // Debug log

      if (!accessToken || !refreshToken || !user) {
        throw new Error("Missing required data in login response")
      }

      setToken(accessToken)
      setUser(user)

      // Store tokens and user data
      localStorage.setItem("access_token", accessToken)
      localStorage.setItem("refresh_token", refreshToken)
      localStorage.setItem("user", JSON.stringify(user))
      
      console.log("Tokens stored in localStorage:", {
        access_token: localStorage.getItem("access_token"),
        refresh_token: localStorage.getItem("refresh_token"),
        user: localStorage.getItem("user")
      }) // Debug log

      setCookies(accessToken, user)

      if (user.role === "ADMIN") {
        router.push("/admin")
      } else {
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Login failed:", error)
      throw error
    }
  }

  const register = async (data: RegisterData) => {
    try {
      const response = await authService.register(data)
      console.log("Full register response:", response.data) // Debug log
      
      // Handle API response structure: { success: true, data: { user, accessToken, refreshToken }, message }
      const responseData = response.data.data
      console.log("Extracted response data:", responseData) // Debug log
      
      const { accessToken, refreshToken, user } = responseData
      console.log("Tokens extracted:", { accessToken: !!accessToken, refreshToken: !!refreshToken, user: !!user }) // Debug log

      if (!accessToken || !refreshToken || !user) {
        throw new Error("Missing required data in register response")
      }

      setToken(accessToken)
      setUser(user)

      // Store tokens and user data
      localStorage.setItem("access_token", accessToken)
      localStorage.setItem("refresh_token", refreshToken)
      localStorage.setItem("user", JSON.stringify(user))
      
      console.log("Tokens stored in localStorage:", {
        access_token: localStorage.getItem("access_token"),
        refresh_token: localStorage.getItem("refresh_token"),
        user: localStorage.getItem("user")
      }) // Debug log

      setCookies(accessToken, user)

      router.push("/dashboard")
    } catch (error) {
      console.error("Registration failed:", error)
      throw error
    }
  }

  const logout = async () => {
    try {
      console.log("[Auth] Logging out user...")
      
      // Clear state immediately
      setUser(null)
      setToken(null)

      // Clear stored data
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
      localStorage.removeItem("user")

      // Clear cookies
      clearCookies()

      // Call backend logout (don't wait for it)
      authService.logout()
        .then(() => {
          console.log("[Auth] Backend logout successful")
        })
        .catch((error) => {
          console.error("[Auth] Backend logout failed:", error)
          // Continue with logout even if backend call fails
        })

      // Force redirect to home page
      try {
        router.push("/")
        console.log("[Auth] Router redirect initiated")
      } catch (routerError) {
        console.error("[Auth] Router redirect failed:", routerError)
        // Fallback: use window.location
        window.location.href = "/"
      }
      
      console.log("[Auth] Logout completed")
    } catch (error) {
      console.error("[Auth] Logout error:", error)
      // Force redirect even if there's an error
      try {
        router.push("/")
      } catch {
        window.location.href = "/"
      }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        loading,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
