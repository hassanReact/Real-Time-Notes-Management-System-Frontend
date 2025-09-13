import axios, { type AxiosResponse } from "axios"
import type { AxiosRequestConfig } from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem("refresh_token")
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          })

          const { access_token } = response.data
          localStorage.setItem("access_token", access_token)

          return api(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        window.location.href = "/auth/login"
      }
    }

    return Promise.reject(error)
  },
)

// Generic API methods
export function GET<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
  return api.get(url, config)
}

export function POST<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
  return api.post(url, data, config)
}

export function PATCH<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
  return api.patch(url, data, config)
}

export function DELETE<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
  return api.delete(url, config)
}

export default api
