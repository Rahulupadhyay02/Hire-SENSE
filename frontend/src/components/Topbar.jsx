import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { Search, Bell, Sun, Moon } from 'lucide-react'

export default function Topbar({ title = 'Dashboard', subtitle = '', role = 'recruiter' }) {
  const navigate = useNavigate()
  const { isDark, toggle } = useTheme()
  const { user, logout } = useAuth()

  return (
    <div className="topbar">
      {/* Left: Title */}
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
          {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{subtitle}</div>
        )}
      </div>

      {/* Right: Search + Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="topbar-search">
          <Search size={14} color="var(--text-muted)" />
          <input placeholder="Search candidates, jobs..." />
        </div>

        {/* Notification */}
        <button
          className="btn btn-icon btn-secondary"
          style={{ position: 'relative', padding: '9px' }}
          id="notifications-btn"
        >
          <Bell size={16} />
          <span style={{
            position: 'absolute', top: 6, right: 6,
            width: 7, height: 7, borderRadius: '50%',
            background: '#f43f5e',
            border: '1.5px solid var(--bg-base)'
          }} />
        </button>

        {/* Theme Toggle */}
        <button
          id="theme-toggle-btn"
          onClick={toggle}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{
            width: 36, height: 36,
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-glass)',
            border: '1px solid var(--border-default)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all var(--duration-fast)',
            color: isDark ? '#f59e0b' : '#2563eb',
            backdropFilter: 'blur(8px)',
          }}
          onMouseOver={e => {
            e.currentTarget.style.background = 'var(--bg-glass-hover)'
            e.currentTarget.style.borderColor = 'var(--border-strong)'
            e.currentTarget.style.transform = 'scale(1.08) rotate(15deg)'
          }}
          onMouseOut={e => {
            e.currentTarget.style.background = 'var(--bg-glass)'
            e.currentTarget.style.borderColor = 'var(--border-default)'
            e.currentTarget.style.transform = 'scale(1) rotate(0deg)'
          }}
        >
          {isDark
            ? <Sun size={16} style={{ transition: 'all 0.3s' }} />
            : <Moon size={16} style={{ transition: 'all 0.3s' }} />
          }
        </button>

        {/* Profile */}
        <div
          id="topbar-user-profile"
          className="flex items-center gap-2"
          style={{ cursor: 'pointer' }}
          title={`${user?.name || 'User'} (${user?.email || 'Logged in'}) - Click to sign out`}
          onClick={() => {
            if (window.confirm('Do you want to log out?')) {
              logout()
              navigate('/login')
            }
          }}
        >
          <div className="avatar">
            {user?.name
              ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
              : (role === 'recruiter' ? 'HR' : 'JD')
            }
          </div>
        </div>
      </div>
    </div>
  )
}
