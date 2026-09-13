import { createContext, useContext, useState, useEffect } from 'react'
import client from '../api/client'

export const AuthContext = createContext({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('hiresense_user')
      return savedUser ? JSON.parse(savedUser) : null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState(() => localStorage.getItem('hiresense_token') || null)
  const [loading, setLoading] = useState(true)

  // Verify token and hydrate user on initial load
  useEffect(() => {
    async function verifyAuth() {
      const savedToken = localStorage.getItem('hiresense_token')
      if (!savedToken) {
        setLoading(false)
        return
      }

      try {
        const response = await client.get('/auth/me')
        setUser(response.data)
        localStorage.setItem('hiresense_user', JSON.stringify(response.data))
      } catch (err) {
        console.warn('Session expired or invalid:', err)
        logout()
      } finally {
        setLoading(false)
      }
    }

    verifyAuth()
  }, [])

  const login = async (email, password, expectedRole = null) => {
    const payload = { email, password }
    if (expectedRole) {
      payload.expected_role = expectedRole
    }
    const response = await client.post('/auth/login', payload)
    const { access_token, user: userData } = response.data

    setToken(access_token)
    setUser(userData)
    localStorage.setItem('hiresense_token', access_token)
    localStorage.setItem('hiresense_user', JSON.stringify(userData))
    return userData
  }

  const register = async (name, email, password, role) => {
    const response = await client.post('/auth/register', { name, email, password, role })
    const { access_token, user: userData } = response.data

    setToken(access_token)
    setUser(userData)
    localStorage.setItem('hiresense_token', access_token)
    localStorage.setItem('hiresense_user', JSON.stringify(userData))
    return userData
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('hiresense_token')
    localStorage.removeItem('hiresense_user')
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
