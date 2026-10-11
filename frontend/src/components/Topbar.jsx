import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { Search, Bell, Sun, Moon, Laptop } from 'lucide-react'
import RecruiterProfileModal from './RecruiterProfileModal'

export default function Topbar({
  title = 'Dashboard',
  subtitle = '',
  role = 'recruiter',
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search candidates, jobs...',
  onProfileClick,
  recruiterProfile,
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const { isDark, themeMode, setMode } = useTheme()
  const { user, logout } = useAuth()
  const [isRecruiterModalOpen, setIsRecruiterModalOpen] = useState(false)

  const isCandidate = role === 'candidate' || user?.role === 'candidate' || location.pathname.startsWith('/candidate')
  const isProfilePage = location.pathname === '/candidate/profile'

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 36px',
      background: isDark ? 'var(--bg-base)' : 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.07)' : 'var(--border-default)'}`,
      position: 'sticky',
      top: 0,
      zIndex: 30,
    }}>
      {/* Left: Title & Subtitle */}
      <div>
        <div style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 700,
          fontSize: '1.1rem',
          color: 'var(--text-primary)',
          letterSpacing: '-0.01em',
        }}>
          {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
            {subtitle}
          </div>
        )}
      </div>

      {/* Right: Search + Accessible Theme Selector + Notifications + Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Search */}
        <div style={{ position: 'relative', width: 280 }}>
          <Search size={14} style={{
            position: 'absolute',
            left: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
            pointerEvents: 'none',
          }} />
          <input
            className="topbar-search-input"
            value={searchValue !== undefined ? searchValue : undefined}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
            style={{
              width: '100%',
              background: isDark ? 'rgba(255, 255, 255, 0.035)' : '#F8FAFC',
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'var(--border-default)'}`,
              borderRadius: 9999,
              padding: '8px 16px 8px 36px',
              fontSize: '12.5px',
              color: 'var(--text-primary)',
              outline: 'none',
              transition: 'all 0.2s ease',
            }}
            onFocus={e => e.target.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.4)' : '#4F46E5'}
            onBlur={e => e.target.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'var(--border-default)'}
          />
        </div>

        {/* ── Accessible 3-Way Segmented Theme Switcher ── */}
        <div
          role="group"
          aria-label="Theme mode selector"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F1F5F9',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.09)' : 'var(--border-default)'}`,
            borderRadius: 10,
            padding: 3,
            gap: 2,
          }}
        >
          {/* Day Mode (Light) */}
          <button
            type="button"
            title="Day Mode — Premium colorful light theme"
            onClick={() => setMode('light')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '5px 10px',
              borderRadius: 7,
              fontSize: '11.5px',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              background: themeMode === 'light'
                ? (isDark ? 'rgba(255, 255, 255, 0.15)' : '#FFFFFF')
                : 'transparent',
              color: themeMode === 'light'
                ? (isDark ? '#FFFFFF' : '#0F172A')
                : (isDark ? '#94A3B8' : '#64748B'),
              boxShadow: themeMode === 'light' && !isDark ? '0 1px 3px rgba(15, 23, 42, 0.08)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Sun size={13} style={{ color: themeMode === 'light' && !isDark ? '#F59E0B' : 'inherit' }} />
            <span>Day</span>
          </button>

          {/* Night Mode (Dark) */}
          <button
            type="button"
            title="Night Mode — Cinematic premium dark theme"
            onClick={() => setMode('dark')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '5px 10px',
              borderRadius: 7,
              fontSize: '11.5px',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              background: themeMode === 'dark'
                ? (isDark ? 'rgba(255, 255, 255, 0.15)' : '#FFFFFF')
                : 'transparent',
              color: themeMode === 'dark'
                ? (isDark ? '#FFFFFF' : '#0F172A')
                : (isDark ? '#94A3B8' : '#64748B'),
              boxShadow: themeMode === 'dark' && !isDark ? '0 1px 3px rgba(15, 23, 42, 0.08)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Moon size={13} style={{ color: themeMode === 'dark' ? '#818CF8' : 'inherit' }} />
            <span>Night</span>
          </button>

          {/* System Mode (Follow OS) */}
          <button
            type="button"
            title="System Mode — Automatically follow OS appearance"
            onClick={() => setMode('system')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '5px 10px',
              borderRadius: 7,
              fontSize: '11.5px',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              background: themeMode === 'system'
                ? (isDark ? 'rgba(255, 255, 255, 0.15)' : '#FFFFFF')
                : 'transparent',
              color: themeMode === 'system'
                ? (isDark ? '#FFFFFF' : '#0F172A')
                : (isDark ? '#94A3B8' : '#64748B'),
              boxShadow: themeMode === 'system' && !isDark ? '0 1px 3px rgba(15, 23, 42, 0.08)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Laptop size={13} style={{ color: themeMode === 'system' ? '#3B82F6' : 'inherit' }} />
            <span>System</span>
          </button>
        </div>

        {/* Notification Bell */}
        <button
          title="Notifications"
          style={{
            position: 'relative',
            width: 36,
            height: 36,
            borderRadius: 10,
            background: isDark ? 'var(--bg-glass)' : '#F8FAFC',
            border: `1px solid ${isDark ? 'var(--border-default)' : 'var(--border-default)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <Bell size={16} />
          <span style={{
            position: 'absolute',
            top: 7,
            right: 7,
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#3B82F6',
            boxShadow: '0 0 6px rgba(59, 130, 246, 0.6)',
          }} />
        </button>

        {/* User Profile Avatar / Candidate / Recruiter Profile Trigger */}
        <div
          id="topbar-profile-button"
          onClick={() => {
            if (isCandidate) {
              navigate('/candidate/profile')
            } else if (onProfileClick) {
              onProfileClick()
            } else {
              setIsRecruiterModalOpen(true)
            }
          }}
          title={isCandidate ? 'My Profile & Resume — Click to open' : 'Recruiter & Company Profile — Click to manage'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            cursor: 'pointer',
            padding: '6px 12px',
            borderRadius: 12,
            background: isCandidate && isProfilePage
              ? (isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(79, 70, 229, 0.1)')
              : (isDark ? 'rgba(255, 255, 255, 0.04)' : '#F8FAFC'),
            border: isCandidate && isProfilePage
              ? (isDark ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(79, 70, 229, 0.3)')
              : `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'var(--border-default)'}`,
            boxShadow: isCandidate && isProfilePage
              ? (isDark ? '0 0 14px rgba(255, 255, 255, 0.15)' : '0 2px 8px rgba(79, 70, 229, 0.12)')
              : (isDark ? 'none' : 'var(--shadow-sm)'),
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          onMouseOver={e => {
            e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.4)' : '#CBD5E1'
          }}
          onMouseOut={e => {
            e.currentTarget.style.borderColor = isCandidate && isProfilePage
              ? (isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(79, 70, 229, 0.3)')
              : (isDark ? 'rgba(255, 255, 255, 0.08)' : 'var(--border-default)')
          }}
        >
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1E293B, #0F172A)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontSize: '11px',
            fontWeight: 700,
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)'
          }}>
            {(recruiterProfile?.name || user?.name)
              ? (recruiterProfile?.name || user?.name).split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
              : (isCandidate ? 'AK' : 'PM')
            }
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {recruiterProfile?.name ? recruiterProfile.name.split(' ')[0] : (user?.name ? user.name.split(' ')[0] : (isCandidate ? 'Arjun' : 'Priya'))}
            </span>
            <span style={{ fontSize: '11px', color: isCandidate && isProfilePage ? (isDark ? '#FFFFFF' : '#4F46E5') : 'var(--text-muted)' }}>
              {isCandidate
                ? (isProfilePage ? '● Profile Active' : 'Candidate Profile')
                : (recruiterProfile?.company_name ? `${recruiterProfile.company_name} · Recruiter` : (user?.company_name ? `${user.company_name} · Recruiter` : 'NeuralStack AI · Recruiter'))
              }
            </span>
          </div>
        </div>
      </div>

      {/* Recruiter Profile Modal */}
      {!isCandidate && (
        <RecruiterProfileModal
          isOpen={isRecruiterModalOpen}
          onClose={() => setIsRecruiterModalOpen(false)}
        />
      )}
    </header>
  )
}
