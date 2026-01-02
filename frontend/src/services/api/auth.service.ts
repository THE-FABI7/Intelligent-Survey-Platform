import http from './http'
import { LoginResponse, RegisterDto, User } from './types'

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await http.post<LoginResponse>('/auth/login', {
      email,
      password,
    })
    
    if (response.data.accessToken) {
      localStorage.setItem('token', response.data.accessToken)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    
    return response.data
  },

  async register(data: RegisterDto): Promise<User> {
    const response = await http.post<User>('/auth/register', data)
    return response.data
  },

  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token')
  },

  getToken(): string | null {
    return localStorage.getItem('token')
  },
}
