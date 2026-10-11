import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()
  const { isDark } = useTheme()

  // Apply dashboard theme ONLY while inside authenticated dashboard routes
  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark-mode')
      document.body.classList.remove('light-mode')
    } else {
      document.body.classList.remove('dark-mode')
      document.body.classList.add('light-mode')
    }
    document.body.classList.add('dashboard-active')

    return () => {
      // Whenever leaving the dashboard (navigating to landing page, login, or public pages),
      // strictly restore body to original dark appearance
      document.body.classList.remove('light-mode')
      document.body.classList.add('dark-mode')
      document.body.classList.remove('dashboard-active')
    }
  }, [isDark])

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-base)'
      }}>
        <div className="spinner" />
      </div>
    )
  }

  // Not logged in -> redirect to login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Check role: Admin is always allowed everywhere
  if (allowedRoles && !allowedRoles.includes(user.role) && user.role !== 'admin') {
    // If a candidate tries to access recruiter routes, redirect to candidate portal
    // If a recruiter tries to access candidate routes, redirect to recruiter portal
    return <Navigate to={user.role === 'candidate' ? '/candidate' : '/recruiter'} replace />
  }

  return (
    <div className={`dashboard-theme-scope ${isDark ? 'dark-mode' : 'light-mode'}`}>
      {children}
    </div>
  )
}
