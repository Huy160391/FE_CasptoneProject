import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, AuthState as GlobalAuthState } from '../types'

interface AuthState extends GlobalAuthState {
  login: (user: User, token: string) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
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
        } else if (user.role.toLowerCase() === 'blogger' || user.role === 'Blogger') {
          user.role = 'Blogger';
        } else if (user.role.toLowerCase() === 'tour company' || user.role === 'Tour Company') {
          user.role = 'Tour Company';
        } else if (user.role.toLowerCase() === 'specialty shop' ||
          user.role === 'Specialty Shop' ||
          user.role.toLowerCase() === 'speciality shop' ||
          user.role === 'Speciality shop' ||
          user.role.toLowerCase() === 'specialityshop') {
          user.role = 'Specialty Shop';
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
      isLoading: false,
      error: null,
      login: (user, token) => {
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        set({ user, isAuthenticated: true, token, error: null })
      },
      logout: () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        set({ user: null, isAuthenticated: false, token: null, error: null })
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
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
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
