import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Briefcase,
  Users,
  GitPullRequest,
  BarChart2,
  TrendingUp,
  Settings,
  Mic,
  MessageSquare,
  LogOut,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const navItems = {
  recruiter: [
    { label: 'Overview', icon: LayoutDashboard, path: '/recruiter' },
    { label: 'Jobs', icon: Briefcase, path: '/recruiter/jobs' },
    { label: 'Candidates', icon: Users, path: '/recruiter/candidates' },
    { label: 'Pipeline', icon: GitPullRequest, path: '/recruiter/pipeline' },
    { label: 'AI Reports', icon: BarChart2, path: '/recruiter/report' },
    { label: 'Settings', icon: Settings, path: '/recruiter/settings' },
  ],
  candidate: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/candidate' },
    { label: 'Find Jobs', icon: Briefcase, path: '/candidate/jobs' },
    { label: 'Interview', icon: Mic, path: '/candidate/interview' },
    { label: 'Feedback', icon: MessageSquare, path: '/candidate/feedback' },
    { label: 'Progress', icon: TrendingUp, path: '/candidate/progress' },
    { label: 'Settings', icon: Settings, path: '/candidate/settings' },
  ],
}

export default function Sidebar({ role = 'recruiter' }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const { isDark } = useTheme()
  const items = navItems[role] || navItems.recruiter

  return (
    <aside style={{
      width: 68,
      background: isDark ? 'var(--bg-base)' : '#FFFFFF',
      borderRight: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.07)' : 'var(--border-default)'}`,
      boxShadow: isDark ? 'none' : '1px 0 4px rgba(15, 23, 42, 0.03)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px 0',
      position: 'fixed',
      top: 0,
      bottom: 0,
      left: 0,
      zIndex: 50,
      transition: 'background-color 0.2s ease, border-color 0.2s ease',
    }}>
      {/* Top Logo Squircle */}
      <button
        onClick={() => navigate('/')}
        title="HireSense Home"
        className="sidebar-logo-squircle"
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          background: isDark
            ? 'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.02))'
            : 'linear-gradient(135deg, #1E293B, #0F172A)',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid #334155',
          boxShadow: isDark ? 'none' : '0 2px 8px rgba(15, 23, 42, 0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 32,
          cursor: 'pointer',
          padding: 0,
          transition: 'all 0.2s ease',
        }}
        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <img
          src="/hiresense_logo_white.webp"
          alt="HireSense"
          style={{ width: 26, height: 26, objectFit: 'contain' }}
          onError={e => { e.currentTarget.style.display = 'none' }}
        />
      </button>

      {/* Navigation Stack */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', flex: 1 }}>
        {items.map(item => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/recruiter' && item.path !== '/candidate' && location.pathname.startsWith(item.path))
          const Icon = item.icon

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              title={item.label}
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: isActive
                  ? (isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(79, 70, 229, 0.12)')
                  : 'transparent',
                border: isActive
                  ? (isDark ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(79, 70, 229, 0.25)')
                  : '1px solid transparent',
                color: isActive
                  ? (isDark ? '#FFFFFF' : '#4F46E5')
                  : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: isActive
                  ? (isDark ? '0 0 16px rgba(255, 255, 255, 0.15)' : '0 2px 10px rgba(79, 70, 229, 0.15)')
                  : 'none',
                transition: 'all 0.2s ease',
                position: 'relative',
              }}
              onMouseOver={e => {
                if (!isActive) e.currentTarget.style.color = isDark ? '#CBD5E1' : '#0F172A'
              }}
              onMouseOut={e => {
                if (!isActive) e.currentTarget.style.color = 'var(--text-muted)'
              }}
            >
              <Icon size={20} />
            </button>
          )
        })}
      </div>

      {/* Bottom LogOut */}
      <button
        onClick={() => {
          logout()
          navigate('/login')
        }}
        title="Sign Out"
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: 'transparent',
          border: 'none',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onMouseOver={e => {
          e.currentTarget.style.color = '#EF4444'
        }}
        onMouseOut={e => {
          e.currentTarget.style.color = 'var(--text-muted)'
        }}
      >
        <LogOut size={18} />
      </button>
    </aside>
  )
}
