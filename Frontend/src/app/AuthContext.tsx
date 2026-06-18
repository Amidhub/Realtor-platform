// Контекст авторизации.
// Хранит текущего пользователя и методы login/register/logout.
// Backend авторизует пользователя через HttpOnly cookies.

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
  } from 'react'
  import {
    getCurrentUser,
    loginUser,
    logoutUser,
    registerUser,
  } from '../api/authApi'
  import type { LoginRequest, RegisterRequest, User } from '../types/user'
  
  type AuthContextValue = {
    user: User | null
    isAuthenticated: boolean
    isAuthLoading: boolean
    login: (data: LoginRequest) => Promise<void>
    register: (data: RegisterRequest) => Promise<void>
    logout: () => Promise<void>
  }
  
  type AuthProviderProps = {
    children: ReactNode
  }
  
  const AuthContext = createContext<AuthContextValue | null>(null)
  
  export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null)
    const [isAuthLoading, setIsAuthLoading] = useState(true)
  
    const loadCurrentUser = useCallback(async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch {
        setUser(null)
      } finally {
        setIsAuthLoading(false)
      }
    }, [])
  
    useEffect(() => {
      loadCurrentUser()
    }, [loadCurrentUser])
  
    const login = async (data: LoginRequest) => {
      await loginUser(data)
  
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    }
  
    const register = async (data: RegisterRequest) => {
      await registerUser(data)
    }
  
    const logout = async () => {
      try {
        await logoutUser()
      } finally {
        setUser(null)
      }
    }
  
    const value = useMemo(
      () => ({
        user,
        isAuthenticated: Boolean(user),
        isAuthLoading,
        login,
        register,
        logout,
      }),
      [user, isAuthLoading],
    )
  
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  }
  
  export function useAuth() {
    const context = useContext(AuthContext)
  
    if (!context) {
      throw new Error('useAuth должен использоваться внутри AuthProvider')
    }
  
    return context
  }