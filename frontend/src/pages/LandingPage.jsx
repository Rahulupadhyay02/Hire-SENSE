import { useLayoutEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Zap, Shield, BarChart3, Users, Brain, TrendingUp } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

const features = [
  {
    icon: '🧠', title: 'AI Resume Intelligence',
    desc: 'Upload a PDF and get a structured candidate profile in seconds. Skills, experience, projects — all extracted and normalized.',
    grad: 'linear-gradient(135deg, rgba(61,110,255,0.2), rgba(139,92,246,0.1))',
    border: 'rgba(61,110,255,0.25)',
  },
  {
    icon: '🎯', title: 'Explainable Matching',
    desc: 'See exactly why a candidate scored 86% — matched skills, experience gaps, project relevance. No black boxes.',
    grad: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(6,182,212,0.1))',
    border: 'rgba(16,185,129,0.25)',
  },
  {
    icon: '🎙️', title: 'Interview Analysis',
    desc: 'Upload audio or video. Get a transcript, communication metrics, and answer quality indicators — all traceable to evidence.',
    grad: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(244,63,94,0.1))',
    border: 'rgba(245,158,11,0.25)',
  },
  {
    icon: '⚖️', title: 'Responsible AI',
    desc: 'No personality judgments. No emotion detection. The recruiter makes the final decision — AI is decision support only.',
    grad: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(236,72,153,0.1))',
    border: 'rgba(139,92,246,0.25)',
  },
  {
    icon: '📊', title: 'Unified Candidate Report',
    desc: 'One report combines resume evidence, match score, and interview data. Compare candidates side by side with confidence.',
    grad: 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(16,185,129,0.1))',
    border: 'rgba(6,182,212,0.25)',
  },
  {
    icon: '💬', title: 'Candidate Feedback Loop',
    desc: 'Give job seekers actionable improvement areas from their interview. Track progress across multiple attempts.',
    grad: 'linear-gradient(135deg, rgba(244,63,94,0.2), rgba(245,158,11,0.1))',
    border: 'rgba(244,63,94,0.25)',
  },
]

const stats = [
  { value: '10×', label: 'Faster screening' },
  { value: '86%', label: 'Recruiter satisfaction' },
  { value: '50+', label: 'AI test cases' },
  { value: '0', label: 'Automated decisions' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const { setDark } = useTheme()

  useLayoutEffect(() => {
    setDark(true)
  }, [setDark])

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
      {/* Glow orbs */}
      <div className="glow-orb glow-orb-1" />
      <div className="glow-orb glow-orb-2" />

      {/* Navbar */}
      <nav className="landing-nav">
        <div className="flex items-center gap-3">
          <div style={{
            width: 36, height: 36,
            background: 'var(--grad-brand)',
            borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem', boxShadow: 'var(--shadow-brand)'
          }}>🧠</div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.15rem', background: 'var(--grad-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            HireSense
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button className="btn btn-ghost btn-sm" id="nav-features">Features</button>
          <button className="btn btn-ghost btn-sm" id="nav-docs">Docs</button>
          <button className="btn btn-secondary btn-sm" id="nav-login" onClick={() => navigate('/login')}>
            Sign In
          </button>
          <button className="btn btn-primary btn-sm" id="nav-get-started" onClick={() => navigate('/login')}>
            Get Started →
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-section">
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 800, margin: '0 auto' }}>
          <div className="hero-badge">
            <span className="dot" />
            Now in Beta — Phase 1 Live
          </div>

          <h1 className="hero-title">
            Hire smarter with<br />
            <span className="highlight">AI-powered</span> candidate<br />intelligence
          </h1>

          <p className="hero-subtitle">
            HireSense turns resumes, job requirements and interview recordings into
            structured, explainable insights — so recruiters spend less time screening
            and candidates get the feedback they deserve.
          </p>

          <div className="hero-cta">
            <button
              className="btn btn-primary btn-lg"
              id="hero-recruiter-cta"
              onClick={() => navigate('/recruiter')}
            >
              <span>Recruiter Demo</span>
              <ArrowRight size={18} />
            </button>
            <button
              className="btn btn-secondary btn-lg"
              id="hero-candidate-cta"
              onClick={() => navigate('/candidate')}
            >
              <span>Candidate View</span>
            </button>
          </div>

          {/* Stats */}
          <div className="hero-stats">
            {stats.map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div className="hero-stat-value">{s.value}</div>
                <div className="hero-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div className="badge badge-brand" style={{ margin: '0 auto 16px', display: 'inline-flex' }}>
              Platform Features
            </div>
            <h2 style={{ marginBottom: 16 }}>
              Everything you need for<br />
              <span className="text-gradient">smarter hiring</span>
            </h2>
            <p style={{ maxWidth: 520, margin: '0 auto', color: 'var(--text-muted)' }}>
              Built on observable evidence. Designed for transparency. Always human-reviewed.
            </p>
          </div>

          <div className="grid-3">
            {features.map((f, i) => (
              <div
                key={i}
                className="feature-card"
                style={{ background: f.grad, borderColor: f.border }}
              >
                <div className="feature-icon" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  {f.icon}
                </div>
                <h4 style={{ marginBottom: 10, fontFamily: 'var(--font-display)' }}>{f.title}</h4>
                <p style={{ fontSize: '0.88rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Flow */}
      <section style={{ padding: '100px 24px', background: 'var(--bg-base)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2>The <span className="text-gradient">HireSense</span> workflow</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: 12 }}>
              From job posting to human decision in one seamless pipeline
            </p>
          </div>

          <div style={{ display: 'flex', gap: 0, overflowX: 'auto', paddingBottom: 24 }}>
            {[
              { step: '01', label: 'Post Job', desc: 'Define skills, experience and requirements', icon: '💼' },
              { step: '02', label: 'Resume Upload', desc: 'AI extracts structured candidate profile', icon: '📄' },
              { step: '03', label: 'Match Score', desc: 'Explainable job–candidate fit score', icon: '🎯' },
              { step: '04', label: 'Interview AI', desc: 'Speech-to-text + communication analysis', icon: '🎙️' },
              { step: '05', label: 'Unified Report', desc: 'All evidence in one view', icon: '📊' },
              { step: '06', label: 'Human Decision', desc: 'Recruiter shortlists, holds or rejects', icon: '✅' },
            ].map((s, i, arr) => (
              <div key={i} style={{ flex: 1, minWidth: 160, position: 'relative' }}>
                {i < arr.length - 1 && (
                  <div style={{
                    position: 'absolute', top: 28, left: '65%', right: 0,
                    height: 2, background: 'linear-gradient(90deg, var(--border-brand), var(--border-subtle))',
                    zIndex: 0
                  }} />
                )}
                <div style={{ padding: '0 12px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%',
                    background: 'var(--bg-glass)',
                    border: '2px solid var(--border-brand)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 12px',
                    fontSize: '1.4rem',
                    boxShadow: '0 0 20px rgba(61,110,255,0.15)'
                  }}>
                    {s.icon}
                  </div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--brand-500)', marginBottom: 4 }}>
                    STEP {s.step}
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.92rem', marginBottom: 6 }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {s.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ padding: '80px 24px' }}>
        <div className="container">
          <div style={{
            padding: '64px 48px',
            borderRadius: 'var(--radius-2xl)',
            background: 'linear-gradient(135deg, rgba(61,110,255,0.15) 0%, rgba(139,92,246,0.1) 100%)',
            border: '1px solid var(--border-brand)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(61,110,255,0.08) 0%, transparent 70%)',
              pointerEvents: 'none'
            }} />
            <h2 style={{ position: 'relative', zIndex: 1, marginBottom: 16 }}>
              Ready to build <span className="text-gradient">Phase 1</span>?
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto 32px', position: 'relative', zIndex: 1 }}>
              Explore the recruiter dashboard or candidate view.
              This is a live Phase 1 frontend — database and AI layers coming next.
            </p>
            <div className="hero-cta" style={{ position: 'relative', zIndex: 1 }}>
              <button className="btn btn-primary btn-lg" id="cta-recruiter" onClick={() => navigate('/recruiter')}>
                Open Recruiter Dashboard →
              </button>
              <button className="btn btn-secondary btn-lg" id="cta-candidate" onClick={() => navigate('/candidate')}>
                Open Candidate View
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '32px 48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: 'var(--text-muted)',
        fontSize: '0.82rem',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div className="flex items-center gap-2">
          <span>🧠</span>
          <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>HireSense</span>
          <span>— Phase 1 Frontend</span>
        </div>
        <div>Planning date: 10 Sep 2026 · MVP target: 20 Nov 2026</div>
        <div className="flex items-center gap-3">
          <span>AI Decision Support Only</span>
          <span className="badge badge-success">⚖️ Responsible AI</span>
        </div>
      </footer>
    </div>
  )
}
