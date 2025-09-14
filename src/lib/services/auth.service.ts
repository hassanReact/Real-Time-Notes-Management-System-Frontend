import api from '@/lib/api'

interface RegisterData {
  email: string
  password: string
  name: string
}

interface LoginData {
  email: string
  password: string
}

export const authService = {
  register: async (data: RegisterData) => {
    const response = await api.post('/auth/register', data)
    return response.data
  },

  login: async (data: LoginData) => {
    const response = await api.post('/auth/login', data)
    return response.data
  },

  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email })
    return response.data
  },

  resetPassword: async (token: string, newPassword: string) => {
    const response = await api.post('/auth/reset-password', { token, newPassword })
    return response.data
  },

  logout: async () => {
    const response = await api.post('/auth/logout')
    return response.data
  },
}