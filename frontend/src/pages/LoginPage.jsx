import { useState, useLayoutEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowLeft, AlertCircle, Briefcase, User, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, register } = useAuth()
  const { setDark } = useTheme()

  const [tab, setTab] = useState('login')
  const [role, setRole] = useState('recruiter')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  useLayoutEffect(() => {
    setDark(false)
  }, [setDark])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.email || !form.password) {
      setError('Please fill in all required fields.')
      return
    }

    if (tab === 'register' && !form.name.trim()) {
      setError('Please enter your full name.')
      return
    }

    if (tab === 'register' && form.password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    setLoading(true)
    try {
      let loggedUser
      if (tab === 'login') {
        loggedUser = await login(form.email, form.password, role)
      } else {
        loggedUser = await register(form.name, form.email, form.password, role)
      }

      if (loggedUser.role !== 'admin' && loggedUser.role !== role) {
        logout()
        const actualRoleName = loggedUser.role.charAt(0).toUpperCase() + loggedUser.role.slice(1)
        setError(`Access denied: This account is registered as a ${actualRoleName}. Please switch to the ${actualRoleName} portal to sign in.`)
        return
      }

      const dest = (loggedUser.role === 'recruiter' || loggedUser.role === 'admin') ? '/recruiter' : '/candidate'
      navigate(dest)
    } catch (err) {
      const msg = err.response?.data?.detail || 'Authentication failed. Please check your credentials.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (demoRole) => {
    setRole(demoRole === 'admin' ? 'recruiter' : demoRole)
    setTab('login')
    setError('')
    if (demoRole === 'admin') {
      setForm({ name: '', email: 'admin@hiresense.com', password: 'AdminPassword123!' })
    } else if (demoRole === 'recruiter') {
      setForm({ name: '', email: 'priya.recruiter@example.com', password: 'SecurePassword123!' })
    } else {
      setForm({ name: '', email: 'arjun.candidate@example.com', password: 'CandidatePass123!' })
    }
  }

  return (
    <div className="auth-page">
      {/* Left panel */}
      <div className="auth-left">
        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Logo */}
          <div className="flex items-center gap-3" style={{ marginBottom: 64 }}>
            <div style={{
              width: 40, height: 40, background: '#2563eb',
              borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(37,99,235,0.25)', color: '#ffffff'
            }}>
              <Briefcase size={20} />
            </div>
            <span style={{
              fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.35rem',
              color: '#0f172a', letterSpacing: '-0.03em'
            }}>HireSense</span>
          </div>

          <h2 style={{ marginBottom: 16, fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>
            AI-assisted<br />hiring intelligence
          </h2>
          <p style={{ color: '#475569', marginBottom: 48, lineHeight: 1.7, maxWidth: 360, fontSize: '0.92rem' }}>
            Explainable candidate insights for recruiters. Actionable interview feedback for job seekers. Human decisions, always.
          </p>

          {/* Testimonials */}
          {[
            { text: '"Resume AI saved us 4 hours per role. The match explanations are genuinely useful."', name: 'Priya S.', role: 'HR Manager' },
            { text: '"Finally got feedback on exactly what to improve. Filler rate down from 9% to 4%."', name: 'Arjun K.', role: 'Job Seeker' },
          ].map((t, i) => (
            <div key={i} style={{
              padding: '20px 24px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              marginBottom: 12
            }}>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 12, fontStyle: 'italic' }}>{t.text}</p>
              <div className="flex items-center gap-2">
                <div className="avatar" style={{ width: 28, height: 28, fontSize: '0.7rem' }}>{t.name.charAt(0)}</div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{t.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-right">
        <div className="auth-form-card">
          {/* Back */}
          <button className="btn btn-ghost btn-sm" style={{ marginBottom: 28, paddingLeft: 0 }} onClick={() => navigate('/')}>
            <ArrowLeft size={14} /> Back to home
          </button>

          <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 6 }}>
            {tab === 'login' ? 'Welcome back' : 'Create account'}
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 28 }}>
            {tab === 'login' ? 'Sign in to your HireSense account' : 'Join HireSense and get started'}
          </p>

          {/* Tabs */}
          <div className="auth-tabs" id="auth-tabs">
            <div id="tab-login" className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>Sign In</div>
            <div id="tab-register" className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => setTab('register')}>Register</div>
          </div>

          {/* Role selector */}
          <div style={{
            display: 'flex', gap: 10, marginBottom: 24,
            padding: '12px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 'var(--radius-lg)'
          }}>
            {['recruiter', 'candidate'].map(r => (
              <button
                key={r}
                id={`role-${r}`}
                onClick={() => setRole(r)}
                style={{
                  flex: 1, padding: '10px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: role === r ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                  background: role === r ? '#eff6ff' : '#ffffff',
                  color: role === r ? '#2563eb' : '#64748b',
                  fontWeight: 600, fontSize: '0.85rem',
                  cursor: 'pointer', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                }}
              >
                {r === 'recruiter' ? <Briefcase size={16} /> : <User size={16} />}
                <span>{r.charAt(0).toUpperCase() + r.slice(1)}</span>
              </button>
            ))}
          </div>

          {/* Error Banner */}
          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 16px', marginBottom: 20,
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: '#fb7185', fontSize: '0.85rem'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <div>{error}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {tab === 'register' && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  id="input-name"
                  className="form-input"
                  type="text"
                  placeholder="Rahul Sharma"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                id="input-email"
                className="form-input"
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="input-password"
                  className="form-input"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  id="toggle-password"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)'
                  }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {tab === 'login' && (
              <div style={{ textAlign: 'right' }}>
                <a href="#" style={{ fontSize: '0.82rem', color: 'var(--brand-400)' }}>Forgot password?</a>
              </div>
            )}

            <button
              type="submit"
              id="btn-submit"
              className="btn btn-primary"
              style={{ marginTop: 8, width: '100%', justifyContent: 'center' }}
              disabled={loading}
            >
              {loading ? (
                <><div className="spinner" style={{ borderTopColor: 'white' }} /> Processing...</>
              ) : (
                tab === 'login' ? `Sign in as ${role}` : `Create ${role} account`
              )}
            </button>
          </form>

          {/* Demo shortcuts */}
          <div style={{
            marginTop: 24, padding: '12px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 'var(--radius-md)'
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 10, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={14} color="var(--brand-400)" />
              <span>PRE-FILL DEMO ACCOUNT</span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                id="demo-admin"
                className="btn btn-secondary btn-sm"
                style={{ flex: 1 }}
                onClick={() => fillDemo('admin')}
              >
                Admin
              </button>
              <button
                type="button"
                id="demo-recruiter"
                className="btn btn-secondary btn-sm"
                style={{ flex: 1 }}
                onClick={() => fillDemo('recruiter')}
              >
                Priya (Recruiter)
              </button>
              <button
                type="button"
                id="demo-candidate"
                className="btn btn-secondary btn-sm"
                style={{ flex: 1 }}
                onClick={() => fillDemo('candidate')}
              >
                Arjun (Candidate)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
