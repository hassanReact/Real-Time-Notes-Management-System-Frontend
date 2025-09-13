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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for existing token on mount
    const storedToken = localStorage.getItem("access_token")
    const storedUser = localStorage.getItem("user")

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }

    setLoading(false)
  }, [])

  const login = async (data: LoginData) => {
    try {
      const response = await authService.login(data.email, data.password)
      const { access_token, refresh_token, user } = response.data

      setToken(access_token)
      setUser(user)

      // Store tokens and user data
      localStorage.setItem("access_token", access_token)
      localStorage.setItem("refresh_token", refresh_token)
      localStorage.setItem("user", JSON.stringify(user))

      router.push("/dashboard")
    } catch (error) {
      console.error("Login failed:", error)
      throw error
    }
  }

  const register = async (data: RegisterData) => {
    try {
      const response = await authService.register(data)
      const { access_token, refresh_token, user } = response.data

      setToken(access_token)
      setUser(user)

      // Store tokens and user data
      localStorage.setItem("access_token", access_token)
      localStorage.setItem("refresh_token", refresh_token)
      localStorage.setItem("user", JSON.stringify(user))

      router.push("/dashboard")
    } catch (error) {
      console.error("Registration failed:", error)
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)

    // Clear stored data
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("user")

    // Call backend logout
    authService.logout().catch(console.error)

    router.push("/")
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
