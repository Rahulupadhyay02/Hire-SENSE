import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { Search, Bell, Sun, Moon } from 'lucide-react'
import RecruiterProfileModal from './RecruiterProfileModal'

export default function Topbar({ title = 'Dashboard', subtitle = '', role = 'recruiter' }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { isDark, toggle } = useTheme()
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
      background: 'rgba(11, 15, 23, 0.75)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
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
          color: '#FFFFFF',
          letterSpacing: '-0.01em',
        }}>
          {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: 2 }}>
            {subtitle}
          </div>
        )}
      </div>

      {/* Right: Search + Notifications + Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Search */}
        <div style={{ position: 'relative', width: 280 }}>
          <Search size={14} style={{
            position: 'absolute',
            left: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#64748B',
            pointerEvents: 'none',
          }} />
          <input
            placeholder="Search candidates, jobs..."
            style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.035)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 9999,
              padding: '8px 16px 8px 36px',
              fontSize: '12.5px',
              color: '#FFFFFF',
              outline: 'none',
              transition: 'all 0.2s ease',
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(255, 255, 255, 0.4)'}
            onBlur={e => e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)'}
          />
        </div>

        {/* Notification Bell */}
        <button
          title="Notifications"
          style={{
            position: 'relative',
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94A3B8',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseOver={e => e.currentTarget.style.color = '#FFFFFF'}
          onMouseOut={e => e.currentTarget.style.color = '#94A3B8'}
        >
          <Bell size={16} />
          <span style={{
            position: 'absolute',
            top: 7,
            right: 7,
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#FFFFFF',
            boxShadow: '0 0 6px rgba(255, 255, 255, 0.6)',
          }} />
        </button>

        {/* User Profile Avatar / Candidate / Recruiter Profile Trigger */}
        <div
          id="topbar-profile-button"
          onClick={() => {
            if (isCandidate) {
              navigate('/candidate/profile')
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
              ? 'rgba(255, 255, 255, 0.12)'
              : 'rgba(255, 255, 255, 0.04)',
            border: isCandidate && isProfilePage
              ? '1px solid rgba(255, 255, 255, 0.3)'
              : '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: isCandidate && isProfilePage
              ? '0 0 14px rgba(255, 255, 255, 0.15)'
              : 'none',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          onMouseOver={e => {
            e.currentTarget.style.background = isCandidate && isProfilePage
              ? 'rgba(255, 255, 255, 0.18)'
              : 'rgba(255, 255, 255, 0.08)'
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)'
          }}
          onMouseOut={e => {
            e.currentTarget.style.background = isCandidate && isProfilePage
              ? 'rgba(255, 255, 255, 0.12)'
              : 'rgba(255, 255, 255, 0.04)'
            e.currentTarget.style.borderColor = isCandidate && isProfilePage
              ? 'rgba(255, 255, 255, 0.3)'
              : 'rgba(255, 255, 255, 0.08)'
          }}
        >
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FFFFFF, #CBD5E1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#000000',
            fontSize: '11px',
            fontWeight: 700,
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)'
          }}>
            {user?.name
              ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
              : (isCandidate ? 'AK' : 'PM')
            }
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#FFFFFF', lineHeight: 1.2 }}>
              {user?.name ? user.name.split(' ')[0] : (isCandidate ? 'Arjun' : 'Priya')}
            </span>
            <span style={{ fontSize: '11px', color: isCandidate && isProfilePage ? '#FFFFFF' : '#94A3B8' }}>
              {isCandidate ? (isProfilePage ? '● Profile Active' : 'Candidate Profile') : 'Recruiter & Company'}
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
