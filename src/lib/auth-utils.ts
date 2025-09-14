import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function getServerAuth() {
  const cookieStore = cookies()
  const token = (await cookieStore).get("access_token")?.value
  const userRole = (await cookieStore).get("user_role")?.value

  return {
    token,
    userRole,
    isAuthenticated: !!token,
    isAdmin: userRole === "ADMIN",
  }
}

export async function requireAuth() {
  const auth = await getServerAuth()

  if (!auth.isAuthenticated) {
    redirect("/")
  }

  return auth
}

export async function requireAdmin() {
  const auth = await getServerAuth()

  if (!auth.isAuthenticated) {
    redirect("/")
  }

  if (!auth.isAdmin) {
    redirect("/dashboard")
  }

  return auth
}
