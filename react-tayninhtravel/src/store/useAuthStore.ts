import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  name: string
  email: string
  role: 'user' | 'Admin' | 'Blogger'
  avatar?: string
  phone?: string
  address?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  token: string | null
  login: (user: User, token: string) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
}

// Lấy thông tin user từ localStorage nếu có
const getStoredUser = (): User | null => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      const user = JSON.parse(userStr);

      // Đảm bảo role luôn đúng định dạng
      if (user && user.role) {
        // Chuẩn hóa role
        if (user.role.toLowerCase() === 'admin' || user.role === 'Admin') {
          user.role = 'Admin';
        } else {
          user.role = 'user';
        }
      }

      return user;
    } catch (e) {
      console.error('Error parsing stored user:', e)
      return null
    }
  }
  return null
}

// Lấy token từ localStorage nếu có
const getStoredToken = (): string | null => {
  return localStorage.getItem('token')
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: getStoredUser(),
      isAuthenticated: !!getStoredToken(),
      token: getStoredToken(),
      login: (user, token) => {
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        set({ user, isAuthenticated: true, token })
      },
      logout: () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        set({ user: null, isAuthenticated: false, token: null })
      },
      updateUser: (userData) =>
        set((state) => {
          if (state.user) {
            const updatedUser = { ...state.user, ...userData }
            localStorage.setItem('user', JSON.stringify(updatedUser))
            return { user: updatedUser }
          }
          return state
        }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
