import { useState, useLayoutEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowLeft, AlertCircle, Briefcase, User, Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, register, logout } = useAuth()
  const { setDark } = useTheme()

  const [tab, setTab] = useState('login')
  const [role, setRole] = useState('recruiter')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  useLayoutEffect(() => {
    setDark(true)
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
        if (logout) logout()
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
      {/* ── Vintage Technical Gray & White Grid Background with Low Fade / Vignette ── */}
      <div className="vintage-grid-bg" aria-hidden="true">
        <div className="vintage-grid-lines" />
        <div className="vintage-vignette-overlay" />
      </div>

      {/* ── Left Showcase Panel ── */}
      <div className="auth-left">
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 560 }}>
          {/* Logo & Brand Header */}
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32, cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            <img
              src="/hiresense_logo_white.webp"
              alt="HireSense"
              style={{ height: 34, width: 'auto', display: 'block' }}
            />
            <div style={{ height: 20, width: 1, background: 'rgba(255, 255, 255, 0.15)' }} />
            <div style={{ fontSize: '0.74rem', color: '#94A3B8', fontWeight: 500, letterSpacing: '0.01em' }}>
              Explainable Talent Intelligence
            </div>
          </div>

          {/* Heading */}
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2.4rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.18,
            color: '#FFFFFF',
            marginBottom: 12
          }}>
            Next-Gen Hiring, <br />
            <span style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #CBD5E1 50%, #94A3B8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Powered by Explainable AI.
            </span>
          </h1>

          <p style={{ color: '#94A3B8', marginBottom: 24, lineHeight: 1.6, maxWidth: 480, fontSize: '0.92rem' }}>
            Audit-proof candidate evaluation, real-time speech acoustic metrics, and unbiased scoring designed for modern high-velocity talent teams.
          </p>

          {/* ── Left Hero Image Graphic with Ambient Glow & Floating Chips ── */}
          <div style={{ position: 'relative', margin: '20px 0 28px' }}>
            {/* Ambient Radial Under-Glow */}
            <div
              style={{
                position: 'absolute',
                inset: '-12px',
                background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.08) 0%, transparent 70%)',
                filter: 'blur(32px)',
                pointerEvents: 'none'
              }}
            />

            {/* Floating Top Badge */}
            <div
              style={{
                position: 'absolute',
                top: 14,
                left: 14,
                zIndex: 10,
                background: 'rgba(11, 13, 19, 0.85)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: 10,
                padding: '6px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: '0.78rem',
                color: '#FFFFFF',
                fontWeight: 600,
                boxShadow: '0 10px 25px rgba(0,0,0,0.6)'
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FFFFFF', boxShadow: '0 0 8px rgba(255, 255, 255, 0.6)' }} />
              94% AI Talent Match Precision
            </div>

            {/* Floating Bottom Badge */}
            <div
              style={{
                position: 'absolute',
                bottom: 14,
                right: 14,
                zIndex: 10,
                background: 'rgba(11, 13, 19, 0.85)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: 10,
                padding: '6px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: '0.78rem',
                color: '#10B981',
                fontWeight: 600,
                boxShadow: '0 10px 25px rgba(0,0,0,0.6)'
              }}
            >
              <ShieldCheck size={15} color="#10B981" />
              NYC Local Law 144 Audited
            </div>

            {/* Image Frame */}
            <div
              style={{
                borderRadius: 18,
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 25px 60px rgba(0,0,0,0.75), 0 0 30px rgba(37,99,235,0.18)'
              }}
            >
              <img
                src="/hiresense_login_hero.jpg"
                alt="HireSense Talent Intelligence Showcase"
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: 250,
                  display: 'block',
                  objectFit: 'cover'
                }}
              />
            </div>
          </div>

          {/* Testimonial Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { text: '"Resume AI saved us 4 hours per role. The match explanations are genuinely useful."', name: 'Priya S.', role: 'HR Manager' },
              { text: '"Finally got feedback on exactly what to improve. Filler rate down from 9% to 4%."', name: 'Arjun K.', role: 'Job Seeker' },
            ].map((t, i) => (
              <div
                key={i}
                style={{
                  padding: '14px 16px',
                  background: 'rgba(21, 24, 35, 0.75)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.07)',
                  borderRadius: 14,
                  boxShadow: '0 10px 20px rgba(0,0,0,0.35)'
                }}
              >
                <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: 10, fontStyle: 'italic', lineHeight: 1.4 }}>
                  {t.text}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      background: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: '#000000'
                    }}
                  >
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#FFFFFF' }}>{t.name}</div>
                    <div style={{ fontSize: '0.68rem', color: '#64748B' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="auth-right" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <div className="auth-form-card" style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
          {/* Back Link */}
          <button
            className="btn btn-ghost btn-sm"
            style={{ marginBottom: 24, paddingLeft: 0, color: '#94A3B8', display: 'inline-flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', cursor: 'pointer' }}
            onClick={() => navigate('/')}
            onMouseEnter={e => e.currentTarget.style.color = '#FFFFFF'}
            onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}
          >
            <ArrowLeft size={14} /> Back to home
          </button>

          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, color: '#FFFFFF', marginBottom: 6 }}>
            {tab === 'login' ? 'Welcome back' : 'Create account'}
          </h3>
          <p style={{ fontSize: '0.88rem', color: '#94A3B8', marginBottom: 24 }}>
            {tab === 'login' ? 'Sign in to your HireSense account' : 'Join HireSense and get started'}
          </p>

          {/* Auth Tabs */}
          <div className="auth-tabs" id="auth-tabs">
            <div
              id="tab-login"
              className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
              onClick={() => setTab('login')}
            >
              Sign In
            </div>
            <div
              id="tab-register"
              className={`auth-tab ${tab === 'register' ? 'active' : ''}`}
              onClick={() => setTab('register')}
            >
              Register
            </div>
          </div>

          {/* Role selector */}
          <div
            style={{
              display: 'flex',
              gap: 8,
              marginBottom: 20,
              padding: '6px',
              background: '#0B0E17',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 14
            }}
          >
            {['recruiter', 'candidate'].map(r => (
              <button
                key={r}
                id={`role-${r}`}
                type="button"
                onClick={() => setRole(r)}
                style={{
                  flex: 1,
                  padding: '9px 16px',
                  borderRadius: 10,
                  border: role === r ? '1px solid #FFFFFF' : '1px solid transparent',
                  background: role === r ? '#FFFFFF' : 'transparent',
                  color: role === r ? '#000000' : '#94A3B8',
                  fontWeight: 600,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: role === r ? '0 0 16px rgba(255, 255, 255, 0.2)' : 'none'
                }}
              >
                {r === 'recruiter' ? <Briefcase size={15} /> : <User size={15} />}
                <span>{r.charAt(0).toUpperCase() + r.slice(1)}</span>
              </button>
            ))}
          </div>

          {/* Error Banner */}
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 16px',
                marginBottom: 18,
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                borderRadius: 10,
                color: '#F87171',
                fontSize: '0.84rem'
              }}
            >
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
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748B'
                  }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {tab === 'login' && (
              <div style={{ textAlign: 'right', marginTop: -4 }}>
                <a
                  href="#"
                  style={{ fontSize: '0.8rem', color: '#CBD5E1', textDecoration: 'none' }}
                  onClick={e => e.preventDefault()}
                >
                  Forgot password?
                </a>
              </div>
            )}

            <button
              type="submit"
              id="btn-submit"
              className="btn-primary-blue"
              style={{ marginTop: 6, width: '100%', padding: '12px', fontSize: '0.92rem' }}
              disabled={loading}
            >
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="spinner" style={{ width: 16, height: 16, borderTopColor: 'white' }} />
                  <span>Processing...</span>
                </div>
              ) : (
                tab === 'login' ? `Sign in as ${role}` : `Create ${role} account`
              )}
            </button>
          </form>

          {/* Demo shortcuts */}
          <div
            style={{
              marginTop: 24,
              padding: '14px',
              background: '#0B0E17',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 14
            }}
          >
            <div style={{ fontSize: '0.74rem', color: '#FFFFFF', marginBottom: 10, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, letterSpacing: '0.04em' }}>
              <Sparkles size={13} color="#FFFFFF" />
              <span>PRE-FILL DEMO ACCOUNT</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                id="demo-admin"
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background: '#151824',
                  color: '#E2E8F0',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onClick={() => fillDemo('admin')}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#FFFFFF'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
              >
                Admin
              </button>
              <button
                type="button"
                id="demo-recruiter"
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background: '#151824',
                  color: '#E2E8F0',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onClick={() => fillDemo('recruiter')}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#FFFFFF'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
              >
                Priya (Recruiter)
              </button>
              <button
                type="button"
                id="demo-candidate"
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background: '#151824',
                  color: '#E2E8F0',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onClick={() => fillDemo('candidate')}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#FFFFFF'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
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
