import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Briefcase,
  Users,
  GitPullRequest,
  BarChart2,
  TrendingUp,
  Settings,
  User,
  ClipboardList,
  Mic,
  MessageSquare,
  LogOut,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navItems = {
  recruiter: [
    { label: 'Overview', icon: LayoutDashboard, path: '/recruiter', section: 'MAIN' },
    { label: 'Jobs', icon: Briefcase, path: '/recruiter/jobs', section: 'MAIN' },
    { label: 'Candidates', icon: Users, path: '/recruiter/candidates', section: 'MAIN', badge: 12 },
    { label: 'Pipeline', icon: GitPullRequest, path: '/recruiter/pipeline', section: 'MAIN' },
    { label: 'AI Reports', icon: BarChart2, path: '/recruiter/report', section: 'AI' },
    { label: 'Analytics', icon: TrendingUp, path: '/recruiter/analytics', section: 'AI' },
    { label: 'Settings', icon: Settings, path: '/recruiter/settings', section: 'ACCOUNT' },
  ],
  candidate: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/candidate', section: 'MAIN' },
    { label: 'My Profile', icon: User, path: '/candidate/profile', section: 'MAIN' },
    { label: 'Interview', icon: Mic, path: '/candidate/interview', section: 'MAIN' },
    { label: 'Feedback', icon: MessageSquare, path: '/candidate/feedback', section: 'AI INSIGHTS' },
    { label: 'Progress', icon: TrendingUp, path: '/candidate/progress', section: 'AI INSIGHTS' },
    { label: 'Settings', icon: Settings, path: '/candidate/settings', section: 'ACCOUNT' },
  ],
}

export default function Sidebar({ role = 'recruiter' }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const items = navItems[role]

  const sections = [...new Set(items.map(i => i.section))]

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div
        className="sidebar-logo"
        onClick={() => navigate('/')}
        style={{ cursor: 'pointer' }}
        title="Back to Landing Page"
      >
        <div className="sidebar-logo-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Briefcase size={20} color="#ffffff" />
        </div>
        <div>
          <div className="sidebar-logo-text">HireSense</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '-2px' }}>
            {role === 'recruiter' ? 'Recruiter Portal' : 'Candidate Portal'}
          </div>
        </div>
      </div>

      {/* Nav */}
      {sections.map(section => (
        <div key={section}>
          <div className="nav-section-label">{section}</div>
          {items.filter(i => i.section === section).map(item => {
            const active = location.pathname === item.path ||
              (item.path === '/candidate' && (location.pathname === '/candidate/applications' || location.pathname === '/candidate/dashboard'))
            const Icon = item.icon
            return (
              <div
                key={item.path}
                className={`nav-item ${active ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                <Icon size={17} style={{ flexShrink: 0, opacity: active ? 1 : 0.8 }} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="nav-item-badge">{item.badge}</span>
                )}
              </div>
            )
          })}
        </div>
      ))}

      {/* User card at bottom */}
      <div style={{ marginTop: 'auto', paddingTop: 16 }}>
        <div className="divider" style={{ margin: '16px 0' }} />
        <div className="flex items-center gap-3" style={{ padding: '8px 12px' }}>
          <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
            {user?.name
              ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
              : (role === 'recruiter' ? 'HR' : 'JD')
            }
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }} className="truncate">
              {user?.name || (role === 'recruiter' ? 'Rahul Sharma' : 'Priya Mehta')}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }} className="truncate">
              {user?.email || (role === 'recruiter' ? 'HR Manager' : 'Job Seeker')}
            </div>
          </div>
          <button
            id="sidebar-logout-btn"
            title="Sign out"
            onClick={() => {
              logout()
              navigate('/login')
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: 6,
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.2s',
            }}
            onMouseOver={e => e.currentTarget.style.color = '#f43f5e'}
            onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}
