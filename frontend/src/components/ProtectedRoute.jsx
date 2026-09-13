import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()

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

  return children
}
