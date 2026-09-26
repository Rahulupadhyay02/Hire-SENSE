import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Briefcase,
  ArrowRight,
  CheckCircle2,
  Users,
  Target,
  Mic,
  Scale,
  FileText,
  TrendingUp,
  ShieldCheck,
  Building2,
  ChevronRight,
  Sparkles,
  Lock,
  ExternalLink,
  Award,
  Check,
  Clock,
  Home,
  UserPlus,
  CreditCard,
  Wrench,
  Headphones,
  Settings,
  ChevronDown,
  MoreHorizontal,
  Bell,
  MessageSquare,
  ChevronsUpDown,
  X,
  Percent,
  Globe,
  Compass,
  Repeat,
  Laptop,
  GraduationCap,
  Star,
  Zap,
  BarChart3
} from 'lucide-react'
import WorldMapCard from '../components/WorldMapCard'

export default function LandingPage() {
  const navigate = useNavigate()
  const [showLaptopBanner, setShowLaptopBanner] = useState(true)
  const [previewMode, setPreviewMode] = useState('3d') // '3d' | 'interactive'

  return (
    <div style={{ background: '#07090E', color: '#FFFFFF', minHeight: '100vh', overflowX: 'hidden', position: 'relative' }}>
      {/* ── Vintage Technical Gray & White Grid Background with Low Fade / Vignette ── */}
      <div className="vintage-grid-bg" aria-hidden="true">
        <div className="vintage-grid-lines" />
        <div className="vintage-vignette-overlay" />
      </div>

      {/* ── Top Navigation Bar ── */}
      <nav
        style={{
          borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
          background: 'rgba(11, 13, 19, 0.85)',
          backdropFilter: 'blur(16px)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          padding: '16px 32px'
        }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            <img
              src="/hiresense_logo_white.webp"
              alt="HireSense"
              style={{ height: 32, width: 'auto', display: 'block' }}
            />
            <div style={{ height: 18, width: 1, background: 'rgba(255, 255, 255, 0.15)' }} />
            <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 500, letterSpacing: '0.01em' }}>
              Explainable Talent Intelligence
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 28, fontSize: '0.88rem' }}>
            <a href="#laptop-preview" style={{ color: '#94A3B8', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#FFFFFF'} onMouseLeave={e => e.target.style.color = '#94A3B8'}>Platform</a>
            <a href="#capabilities" style={{ color: '#94A3B8', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#FFFFFF'} onMouseLeave={e => e.target.style.color = '#94A3B8'}>Capabilities</a>
            <a href="#compliance" style={{ color: '#94A3B8', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#FFFFFF'} onMouseLeave={e => e.target.style.color = '#94A3B8'}>AI Governance</a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/login?role=candidate')}
            >
              Candidate Portal
            </button>
            <button
              className="btn-primary-blue"
              onClick={() => navigate('/login?role=recruiter')}
            >
              Recruiter Sign In <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section style={{ padding: '80px 24px 40px', maxWidth: 1200, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
        {/* Subtle radial ambient glow behind hero */}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '600px',
            height: '350px',
            background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.06) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}
        />


        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '3.6rem',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1.15,
            color: '#FFFFFF',
            maxWidth: 900,
            margin: '0 auto 20px'
          }}
        >
          The Global Hiring Platform <br />
          <span style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #CBD5E1 50%, #94A3B8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Built for Modern High-Growth Teams.
          </span>
        </h1>

        <p
          style={{
            fontSize: '1.1rem',
            color: '#94A3B8',
            maxWidth: 680,
            margin: '0 auto 36px',
            lineHeight: 1.6
          }}
        >
          Hire, evaluate, and care for candidates worldwide with explainable AI matching,
          verified resume extractions, and observable speech insights. Human recruiters always make the final call.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 40 }}>
          <button
            className="btn-primary-blue"
            style={{ padding: '14px 28px', fontSize: '0.96rem' }}
            onClick={() => navigate('/login?role=recruiter')}
          >
            Launch Recruiter Workspace <ArrowRight size={16} />
          </button>
          <button
            className="btn btn-secondary"
            style={{ padding: '14px 24px', fontSize: '0.96rem' }}
            onClick={() => navigate('/login?role=candidate')}
          >
            Candidate Practice & Coaching
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32, fontSize: '0.82rem', color: '#94A3B8' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <ShieldCheck size={16} color="#10B981" /> NYC Local Law 144 Audited
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Lock size={16} color="#FFFFFF" /> Zero Automated Rejections
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={16} color="#A855F7" /> 100% Deterministic Grounding
          </span>
        </div>

        {/* Toggle between 3D MacBook Graphic & Interactive Code View */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 36, marginBottom: 20 }}>
          <div style={{ display: 'inline-flex', padding: 4, background: '#11141E', borderRadius: 12, border: '1px solid rgba(255,255,255,0.09)', gap: 4 }}>
            <button
              onClick={() => setPreviewMode('3d')}
              style={{
                padding: '8px 18px',
                borderRadius: 8,
                border: 'none',
                background: previewMode === '3d' ? '#FFFFFF' : 'transparent',
                color: previewMode === '3d' ? '#000000' : '#94A3B8',
                fontWeight: 600,
                fontSize: '0.84rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.2s',
                boxShadow: previewMode === '3d' ? '0 0 16px rgba(255, 255, 255, 0.2)' : 'none'
              }}
            >
              <Laptop size={15} /> 3D MacBook Pro View
            </button>
            <button
              onClick={() => setPreviewMode('interactive')}
              style={{
                padding: '8px 18px',
                borderRadius: 8,
                border: 'none',
                background: previewMode === 'interactive' ? '#FFFFFF' : 'transparent',
                color: previewMode === 'interactive' ? '#000000' : '#94A3B8',
                fontWeight: 600,
                fontSize: '0.84rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.2s',
                boxShadow: previewMode === 'interactive' ? '0 0 16px rgba(255, 255, 255, 0.2)' : 'none'
              }}
            >
              <Sparkles size={15} /> Live Interactive Sandbox
            </button>
          </div>
        </div>

        {previewMode === '3d' ? (
          /* ── 3D MacBook Pro Laptop Graphic Showcase (Exact match to reference image) ── */
          <div id="laptop-preview" style={{ position: 'relative', maxWidth: 1120, margin: '20px auto 0' }}>
            {/* Ambient Backlight Glow */}
            <div
              style={{
                position: 'absolute',
                top: '40%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '85%',
                height: '65%',
                background: 'radial-gradient(ellipse at center, rgba(37, 99, 235, 0.25) 0%, rgba(37, 99, 235, 0.05) 55%, transparent 75%)',
                filter: 'blur(50px)',
                pointerEvents: 'none'
              }}
            />

            {/* Floating Glass Stats Badge Left */}
            <div
              style={{
                position: 'absolute',
                top: '10%',
                left: '-16px',
                zIndex: 10,
                background: 'rgba(15, 18, 27, 0.85)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 14,
                padding: '12px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                boxShadow: '0 20px 40px rgba(0,0,0,0.6), 0 0 20px rgba(37,99,235,0.25)'
              }}
            >
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(37, 99, 235, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Globe size={18} color="#FFFFFF" />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 500 }}>Global Talent Network</div>
                <div style={{ fontSize: '0.92rem', color: '#FFFFFF', fontWeight: 700 }}>642 Active Team Members</div>
              </div>
            </div>

            {/* Floating Glass Stats Badge Right */}
            <div
              style={{
                position: 'absolute',
                bottom: '18%',
                right: '-16px',
                zIndex: 10,
                background: 'rgba(15, 18, 27, 0.85)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 14,
                padding: '12px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                boxShadow: '0 20px 40px rgba(0,0,0,0.6), 0 0 20px rgba(16,185,129,0.25)'
              }}
            >
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={18} color="#10B981" />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 500 }}>AI Governance & Bias Audited</div>
                <div style={{ fontSize: '0.92rem', color: '#FFFFFF', fontWeight: 700 }}>NYC LL 144 & EU AI Act</div>
              </div>
            </div>

            {/* High-res 3D MacBook Pro Graphic (Transparent background, revealing the grid background behind it) */}
            <div
              style={{
                position: 'relative',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onClick={() => setPreviewMode('interactive')}
              title="Click to switch to interactive sandbox"
            >
              <img
                src="/hiresense_macbook_cutout.png"
                alt="HireSense 3D MacBook Pro Dashboard"
                style={{
                  width: '100%',
                  maxWidth: 1060,
                  height: 'auto',
                  display: 'block',
                  filter: 'drop-shadow(0 30px 70px rgba(0, 0, 0, 0.8)) drop-shadow(0 0 45px rgba(37, 99, 235, 0.3))',
                  transition: 'transform 0.3s ease',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: 12,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(11, 13, 19, 0.85)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  borderRadius: 9999,
                  padding: '7px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '0.8rem',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
                  zIndex: 15,
                }}
              >
                <Sparkles size={14} style={{ color: '#FFFFFF' }} /> Click image or toggle above to open interactive live sandbox
              </div>
            </div>
          </div>
        ) : (
          /* ── Interactive Code Mockup ── */
          <div id="laptop-preview" className="laptop-mockup-wrap">
            {/* Laptop Screen Lid */}
            <div className="laptop-display-frame">
              {/* Top Display Notch */}
              <div className="laptop-camera-notch">
                <span className="laptop-camera-dot" />
                <span className="laptop-camera-indicator" />
              </div>

              {/* macOS Browser Bar */}
              <div className="laptop-browser-chrome">
                <div className="laptop-window-dots">
                  <span className="laptop-window-dot" style={{ background: '#EF4444' }} />
                  <span className="laptop-window-dot" style={{ background: '#F59E0B' }} />
                  <span className="laptop-window-dot" style={{ background: '#10B981' }} />
                </div>
                <div className="laptop-url-pill">
                  <Lock size={11} color="#94A3B8" />
                  <span>hiresense.com/home</span>
                </div>
                <div style={{ marginLeft: 'auto', fontSize: '0.72rem', color: '#64748B' }}>
                  Mon Jun 22 9:41 AM
                </div>
              </div>

              {/* Laptop Screen Viewport (Hosting the Exact EmployIn Dashboard, Branded as HireSense) */}
              <div className="laptop-screen-viewport">
                <div style={{ display: 'flex', minHeight: 520, textAlign: 'left' }}>
                  {/* 1. Inside-Laptop Sidebar */}
                  <aside style={{ width: 220, minWidth: 220, background: '#0E1017', borderRight: '1px solid rgba(255,255,255,0.06)', padding: '16px 12px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 6px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <img
                          src="/hiresense_logo_white.webp"
                          alt="HireSense"
                          style={{ height: 20, width: 'auto', display: 'block' }}
                        />
                      </div>
                      <button style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }}>
                        <MoreHorizontal size={16} />
                      </button>
                    </div>

                    {/* Nav List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#1A1E29', borderRadius: 8, color: '#FFFFFF', fontWeight: 600, fontSize: '0.84rem' }}>
                        <Home size={15} color="#FFFFFF" />
                        <span>Home</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', color: '#94A3B8', fontSize: '0.84rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Users size={15} />
                          <span>Team</span>
                        </div>
                        <ChevronDown size={12} color="#64748B" />
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', color: '#94A3B8', fontSize: '0.84rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <UserPlus size={15} />
                          <span>Hire</span>
                        </div>
                        <ChevronDown size={12} color="#64748B" />
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', color: '#94A3B8', fontSize: '0.84rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <CreditCard size={15} />
                          <span>Pay</span>
                        </div>
                        <ChevronDown size={12} color="#64748B" />
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', color: '#94A3B8', fontSize: '0.84rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Award size={15} />
                          <span>Total Rewards</span>
                        </div>
                        <ChevronDown size={12} color="#64748B" />
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', color: '#94A3B8', fontSize: '0.84rem' }}>
                        <Building2 size={15} />
                        <span>Company</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', color: '#94A3B8', fontSize: '0.84rem' }}>
                        <Wrench size={15} />
                        <span>Tools and resources</span>
                      </div>
                    </div>

                    {/* Sidebar Bottom */}
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 12px', color: '#94A3B8', fontSize: '0.82rem' }}>
                        <Headphones size={14} />
                        <span>Support Center</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 12px', color: '#94A3B8', fontSize: '0.82rem' }}>
                        <Settings size={14} />
                        <span>Settings</span>
                      </div>
                    </div>
                  </aside>

                  {/* 2. Inside-Laptop Main Body */}
                  <div style={{ flex: 1, padding: '20px 24px', overflowY: 'auto' }}>
                    {/* Topbar Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                      <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: '#FFFFFF' }}>
                          Hello, Jacob Jones!
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: 2 }}>
                          Here's what we have for you today
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: '#151823', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                          <Bell size={14} color="#94A3B8" />
                          <span style={{ position: 'absolute', top: 6, right: 6, width: 5, height: 5, borderRadius: '50%', background: '#EF4444' }} />
                        </div>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: '#151823', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                          <MessageSquare size={14} color="#94A3B8" />
                          <span style={{ position: 'absolute', top: 6, right: 6, width: 5, height: 5, borderRadius: '50%', background: '#EF4444' }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '2px 8px', borderRadius: 10 }}>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#000000' }}>
                            JJ
                          </div>
                          <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#FFFFFF', lineHeight: 1.1 }}>Jacob Jones</div>
                            <div style={{ fontSize: '0.68rem', color: '#64748B' }}>Team</div>
                          </div>
                          <ChevronsUpDown size={12} color="#64748B" />
                        </div>
                      </div>
                    </div>

                    {/* Kick Start Banner */}
                    {showLaptopBanner && (
                      <div style={{ background: 'linear-gradient(135deg, #1A1E29 0%, #121620 45%, #0B0E17 100%)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: 14, padding: '16px 20px', marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.98rem', color: '#FFFFFF', marginBottom: 4 }}>
                            Kick Start Your Hiring With HireSense
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#94A3B8', maxWidth: 520, lineHeight: 1.4 }}>
                            Hire, pay, and care for employees and contractors around the world, with compliant agreements, payroll, and
                            benefits. When hiring contractors, there's no HireSense fee for the first month!
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <button className="btn-primary-blue" style={{ padding: '8px 14px', fontSize: '0.8rem' }} onClick={() => navigate('/recruiter/jobs')}>
                            Start Hiring
                          </button>
                          <button style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }} onClick={() => setShowLaptopBanner(false)}>
                            <X size={15} />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* HireSense Tools Strip */}
                    <div style={{ marginBottom: 18 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFFFFF' }}>HireSense Tools</span>
                        <span style={{ fontSize: '0.75rem', color: '#64748B', cursor: 'pointer' }}>Help Center</span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                        {/* Cost Calculator */}
                        <div style={{ background: '#161924', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Percent size={14} />
                          </div>
                          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#FFFFFF', whiteSpace: 'nowrap' }}>Cost Calculator</span>
                        </div>

                        {/* Country Guides */}
                        <div style={{ background: '#161924', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(6, 182, 212, 0.15)', color: '#06B6D4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Globe size={14} />
                          </div>
                          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#FFFFFF', whiteSpace: 'nowrap' }}>Country Guides</span>
                        </div>

                        {/* Start Hiring */}
                        <div style={{ background: '#161924', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(249, 115, 22, 0.15)', color: '#F97316', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Compass size={14} />
                          </div>
                          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#FFFFFF', whiteSpace: 'nowrap' }}>Start Hiring</span>
                        </div>

                        {/* Salary Converter */}
                        <div style={{ background: '#161924', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(168, 85, 247, 0.15)', color: '#A855F7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Repeat size={14} />
                          </div>
                          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#FFFFFF', whiteSpace: 'nowrap' }}>Salary Converter</span>
                        </div>

                        {/* Salary Insight */}
                        <div style={{ background: '#161924', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(236, 72, 153, 0.15)', color: '#EC4899', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <CreditCard size={14} />
                          </div>
                          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#FFFFFF', whiteSpace: 'nowrap' }}>Salary Insight</span>
                        </div>
                      </div>
                    </div>

                    {/* Two-Column Grid: Onboarding + World Map */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: 14 }}>
                      {/* Left: Company Onboarding + Partners */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div style={{ background: '#161924', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 18 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.94rem', color: '#FFFFFF', marginBottom: 12 }}>
                            Company Onboarding
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div style={{ background: '#11131C', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: '0.82rem', color: '#E2E8F0', fontWeight: 500 }}>Complete Company Profile</span>
                              <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#FFFFFF', color: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Check size={12} strokeWidth={3} />
                              </div>
                            </div>

                            <div style={{ background: '#11131C', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: '0.82rem', color: '#E2E8F0', fontWeight: 500 }}>Start Hiring</span>
                              <span style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#CBD5E1', fontSize: '0.72rem', fontWeight: 500, padding: '2px 8px', borderRadius: 9999 }}>New Hire</span>
                            </div>

                            <div style={{ background: '#11131C', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: '0.82rem', color: '#E2E8F0', fontWeight: 500 }}>Add Point of Contact</span>
                              <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#FFFFFF', color: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Check size={12} strokeWidth={3} />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div style={{ background: '#161924', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 18 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.94rem', color: '#FFFFFF', marginBottom: 6 }}>
                            HireSense Partners
                          </div>
                          <p style={{ fontSize: '0.78rem', color: '#94A3B8', lineHeight: 1.4, marginBottom: 12 }}>
                            We partner with industry leaders and innovators to help you deliver the best employment experience.
                          </p>
                          <button className="btn-primary-blue" style={{ padding: '6px 14px', fontSize: '0.78rem' }}>
                            Discover our partners
                          </button>
                        </div>
                      </div>

                      {/* Right: Countries Hired In (World Map) */}
                      <div>
                        <WorldMapCard />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Laptop Base Chassis with 3D keyboard & trackpad */}
            <div className="laptop-chassis-bottom">
              <div className="laptop-keyboard-grid">
                <div className="laptop-key-row">
                  {[...Array(14)].map((_, i) => <div key={i} className="laptop-key" />)}
                </div>
                <div className="laptop-key-row">
                  {[...Array(14)].map((_, i) => <div key={i} className="laptop-key" />)}
                </div>
                <div className="laptop-key-row">
                  {[...Array(13)].map((_, i) => <div key={i} className="laptop-key" />)}
                </div>
                <div className="laptop-key-row">
                  {[...Array(11)].map((_, i) => <div key={i} className="laptop-key" />)}
                </div>
                <div className="laptop-key-row">
                  <div className="laptop-key" style={{ flex: 1.5 }} />
                  <div className="laptop-key" style={{ flex: 1.5 }} />
                  <div className="laptop-key" style={{ flex: 5 }} />
                  <div className="laptop-key" style={{ flex: 1.5 }} />
                  <div className="laptop-key" style={{ flex: 1.5 }} />
                </div>
              </div>
              <div className="laptop-trackpad-rect" />
            </div>
          </div>
        )}
      </section>

      {/* ── Corporate Clients & University Partners Animated Logo Marquee ── */}
      <section style={{
        padding: '44px 0 64px',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        background: 'linear-gradient(180deg, rgba(11, 15, 23, 0.9) 0%, rgba(7, 9, 14, 0.98) 100%)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* CSS Animation Keyframes for Smooth Seamless Marquee */}
        <style>{`
          @keyframes marqueeLeft {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @keyframes marqueeRight {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0); }
          }
          .marquee-track-1 {
            display: flex;
            width: max-content;
            gap: 20px;
            animation: marqueeLeft 38s linear infinite;
          }
          .marquee-track-2 {
            display: flex;
            width: max-content;
            gap: 20px;
            animation: marqueeRight 42s linear infinite;
          }
          .marquee-track-1:hover,
          .marquee-track-2:hover {
            animation-play-state: paused;
          }
          .marquee-badge {
            transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .marquee-badge:hover {
            transform: translateY(-3px);
            border-color: rgba(255, 255, 255, 0.35) !important;
            background: rgba(255, 255, 255, 0.09) !important;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 255, 255, 0.1);
          }
        `}</style>

        <div style={{ maxWidth: 1200, margin: '0 auto 28px', padding: '0 24px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '4px 14px',
            borderRadius: 9999,
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: 12,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FFFFFF', boxShadow: '0 0 8px rgba(255, 255, 255, 0.7)' }} />
            <span style={{ fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#CBD5E1' }}>
              Global Talent Ecosystem
            </span>
          </div>

          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: '#FFFFFF',
            letterSpacing: '-0.02em',
            margin: '0 0 6px 0',
          }}>
            Trusted by World-Class Tech Enterprises & Leading University Talent Networks
          </h3>

          <p style={{ fontSize: '0.86rem', color: '#94A3B8', margin: 0 }}>
            Over 250,000+ candidates verified and screened across top-tier engineering organizations.
          </p>
        </div>

        {/* ── Marquee Track 1: Enterprise Tech Giants (Scrolling Left) ── */}
        <div style={{
          overflow: 'hidden',
          width: '100%',
          position: 'relative',
          marginBottom: 16,
          maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
          padding: '4px 0',
        }}>
          <div className="marquee-track-1">
            {/* Duplicate array for seamless infinite marquee loop */}
            {[...Array(2)].flatMap((_, setIdx) => [
              {
                name: 'Google',
                category: 'Cloud & AI',
                logo: (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" fill="#FFFFFF" />
                    <path d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" fill="#FFFFFF" opacity="0.9" />
                    <path d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z" fill="#FFFFFF" opacity="0.75" />
                    <path d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.93 6.72-4.93z" fill="#FFFFFF" />
                  </svg>
                )
              },
              {
                name: 'Microsoft',
                category: 'Enterprise Tech',
                logo: (
                  <svg viewBox="0 0 23 23" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#FFFFFF" d="M0 0h10.5v10.5H0zM11.5 0H22v10.5H11.5zM0 11.5h10.5V22H0zM11.5 11.5H22V22H11.5z" />
                  </svg>
                )
              },
              {
                name: 'Amazon AWS',
                category: 'Infrastructure',
                logo: (
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M13.9 16.8c-3.1 2.3-7.6 3.5-11.4 3.5-5.4 0-10.2-2-13.9-5.3-.3-.3-.2-.7.2-.9.4-.2.8-.2 1.1 0 3.4 3 7.8 4.8 12.8 4.8 3.5 0 7.4-1.1 10.3-3.1.5-.4 1.1.2 1 .7-.1.1-.5.3-.1.3zm1.6-1.4c-.4-.5-2.4-.2-3.4-.1-.3 0-.4-.3-.1-.5 1.7-1.2 4.5-.8 4.9-.4.4.4.2 3.2-1.4 4.6-.3.2-.5.1-.4-.2.5-1.1.9-3.1.4-3.4zM15.1 9.2c0 2.4-1.2 3.9-3.1 3.9-1.3 0-2.2-.9-2.2-2.4 0-2.9 2.2-3.4 5.3-3.4v1.9zm3.5 7.8h-3.1v-1.4c-1 1.3-2.6 1.8-4.2 1.8-2.8 0-5-1.7-5-5 0-3.7 2.7-5.6 7.3-5.6 1.7 0 3.3.3 4.9.5v-1c0-1.8-1-2.9-3.5-2.9-1.8 0-3.6.6-4.9 1.5-.3.2-.5 0-.6-.3l-.8-1.3c-.1-.3 0-.5.3-.8 1.7-1.2 4.1-1.9 6.7-1.9 4.2 0 6 2.2 6 6v7.8c0 .9.4 1.3 1.3 1.3.3 0 .5 0 .6.1v1.4c-.4.1-1.1.3-1.8.3-2.3 0-3.2-1.2-3.3-2.3z" />
                  </svg>
                )
              },
              {
                name: 'Meta',
                category: 'AI Research',
                logo: (
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M12 5c-3.1 0-5.8 1.8-7.2 4.5C3.2 12.5 1.5 16.8 1.5 20c0 3.2 2.2 5.5 5.2 5.5 2.6 0 5-1.7 6.8-4.3 1.8 2.6 4.2 4.3 6.8 4.3 3 0 5.2-2.3 5.2-5.5 0-3.2-1.7-7.5-3.3-10.5C20.8 6.8 18.1 5 15 5h-3zm-1.1 4.5c.4 0 .8.1 1.1.4 2.2 1.8 4.6 5.8 5.9 9.1-1.6 2.6-3.5 4.1-5.5 4.1-2 0-3.9-1.5-5.5-4.1 1.3-3.3 3.7-7.3 5.9-9.1.3-.3.7-.4-1.9-.4z" />
                  </svg>
                )
              },
              {
                name: 'Stripe',
                category: 'Global Payments',
                logo: (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697.5 12.722.5 7.135.5 3.368 3.518 3.368 8.163c0 6.08 5.767 7.026 8.924 8.225 2.502.944 3.385 1.683 3.385 2.709 0 1.04-.908 1.603-2.41 1.603-2.316 0-5.32-.988-7.327-2.22l-.934 5.578c2.072 1.05 5.076 1.666 8.016 1.666 5.86 0 9.803-2.903 9.803-7.859 0-6.175-5.59-7.252-8.849-8.715z" />
                  </svg>
                )
              },
              {
                name: 'OpenAI',
                category: 'Frontier AI',
                logo: (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.677l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.674 8.105v-5.659a.79.79 0 0 0-.409-.686zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zM8.307 10.829l3.69-2.132 3.69 2.132v4.264l-3.69 2.13-3.69-2.13z" />
                  </svg>
                )
              },
              {
                name: 'Snowflake',
                category: 'Data Cloud',
                logo: (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M12 0l1.6 3.7L12 4.8l-1.6-1.1L12 0zm0 19.2l1.6 1.1L12 24l-1.6-3.7 1.6-1.1zm9.6-9.6l-1.1 1.6 3.7 1.6-3.7 1.6 1.1 1.6-4.8-1.6V12l4.8-2.4zm-19.2 0l4.8 2.4V14l-4.8 1.6 1.1-1.6-3.7-1.6 3.7-1.6-1.1-1.6zm15.7-4.1l-1.9 2.7-2.3-1.3 1.9-2.7 3.2-1.9-1.9 3.2zm-12.2 0l-1.9-3.2 3.2 1.9 1.9 2.7-2.3 1.3-1.9-2.7zm12.2 13l1.9 3.2-3.2-1.9-1.9-2.7 2.3-1.3 1.9 2.7zm-12.2 0l-1.9 2.7 1.9-2.7 2.3 1.3-1.9 2.7-3.2-1.9 1.9-3.2z" />
                  </svg>
                )
              },
              {
                name: 'Uber',
                category: 'Mobility & Logistics',
                logo: (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm-1-14h2v7.5l4.5 2.6-1 1.732L11 14.5V6z" />
                  </svg>
                )
              },
              {
                name: 'Airbnb',
                category: 'Global Marketplace',
                logo: (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M12 2c-3.3 0-6 2.7-6 6 0 4.1 4.8 9.3 5.4 9.9.3.4.9.4 1.2 0 .6-.6 5.4-5.8 5.4-9.9 0-3.3-2.7-6-6-6zm0 8.5c-1.4 0-2.5-1.1-2.5-2.5s1.1-2.5 2.5-2.5 2.5 1.1 2.5 2.5-1.1 2.5-2.5 2.5z" />
                  </svg>
                )
              },
              {
                name: 'Datadog',
                category: 'Observability',
                logo: (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                  </svg>
                )
              },
            ]).map((corp, i) => (
              <div
                key={i}
                className="marquee-badge"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 20px',
                  borderRadius: 14,
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.09)',
                  backdropFilter: 'blur(12px)',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <div style={{ color: '#FFFFFF', display: 'flex', alignItems: 'center' }}>
                  {corp.logo}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2 }}>
                    {corp.name}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>
                    {corp.category}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Marquee Track 2: Premier University Incubators & Talent Networks (Scrolling Right) ── */}
        <div style={{
          overflow: 'hidden',
          width: '100%',
          position: 'relative',
          maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
          padding: '4px 0',
        }}>
          <div className="marquee-track-2">
            {[...Array(2)].flatMap((_, setIdx) => [
              {
                name: 'Stanford University',
                role: 'Tech Ventures & AI Lab',
                logo: (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M12 2L6 8h3v4H7l5 6 5-6h-2V8h3l-6-6zm-1 18h2v2h-2v-2z" />
                  </svg>
                )
              },
              {
                name: 'MIT',
                role: 'Career Acceleration Incubator',
                logo: (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M2 4h3v16H2V4zm5 0h3v10H7V4zm5 0h3v16h-3V4zm5 0h3v10h-3V4zm5 0h3v16h-3V4z" />
                  </svg>
                )
              },
              {
                name: 'UC Berkeley',
                role: 'EECS Talent Network',
                logo: (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm4 0h-2v-4h2v4zm0-6h-2V9h2v2zm-4-2h-2V7h2v2z" />
                  </svg>
                )
              },
              {
                name: 'Harvard University',
                role: 'Innovation Labs',
                logo: (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M12 2L4 5v7c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V5l-8-3zm-2 14H8v-2h2v2zm0-4H8v-2h2v2zm6 4h-2v-2h2v2zm0-4h-2v-2h2v2zm-3-4h-2V6h2v2z" />
                  </svg>
                )
              },
              {
                name: 'IIT Innovation Cell',
                role: 'Placement & Research Hub',
                logo: (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
                    <circle cx="12" cy="12" r="3" fill="currentColor" />
                    <path d="M12 3v3m0 12v3M3 12h3m12 0h3m-2.4-6.6l-2.1 2.1m-9 9l-2.1 2.1m0-13.2l2.1 2.1m9 9l2.1 2.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                )
              },
              {
                name: 'Carnegie Mellon',
                role: 'School of Computer Science',
                logo: (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M12 2L4 6v6c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V6l-8-4zm-3 8h6v2H9v-2zm0 4h6v2H9v-2z" />
                  </svg>
                )
              },
            ]).map((uni, i) => (
              <div
                key={i}
                className="marquee-badge"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 20px',
                  borderRadius: 14,
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(12px)',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <div style={{ color: '#FFFFFF', display: 'flex', alignItems: 'center' }}>
                  {uni.logo}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2 }}>
                    {uni.name}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>
                    {uni.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Capabilities Section (Auditable Intelligence) ── */}
      <section id="capabilities" style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 54 }}>
          <div style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.84rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
            Auditable Intelligence
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#FFFFFF' }}>
            Engineered for Maximum Precision and Zero Hallucinations
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '0.95rem', maxWidth: 640, margin: '12px auto 0', lineHeight: 1.6 }}>
            Every score, metric, and recommendation is mathematically traceable back to source resume lines or acoustic speech evidence.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {/* Capability 1 */}
          <div className="dash-card">
            <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255, 255, 255, 0.08)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <FileText size={20} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF', marginBottom: 8 }}>
              Deterministic Resume Grounding
            </h3>
            <p style={{ fontSize: '0.86rem', color: '#94A3B8', lineHeight: 1.6 }}>
              Extract verified education, experience, and validated skills without synthetic AI fabrications.
              The original resume is always accessible side-by-side as legal evidence.
            </p>
          </div>

          {/* Capability 2 */}
          <div className="dash-card">
            <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(16, 185, 129, 0.15)', color: '#34D399', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Mic size={20} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF', marginBottom: 8 }}>
              Observable Speech Metrics
            </h3>
            <p style={{ fontSize: '0.86rem', color: '#94A3B8', lineHeight: 1.6 }}>
              Track objective speaking rate (WPM), filler frequency, pause distribution, and STAR methodology alignment.
              Zero pseudoscience: no facial or emotion guessing.
            </p>
          </div>

          {/* Capability 3 */}
          <div className="dash-card">
            <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(168, 85, 247, 0.15)', color: '#C084FC', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Scale size={20} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF', marginBottom: 8 }}>
              Explainable 4-Factor Matching
            </h3>
            <p style={{ fontSize: '0.86rem', color: '#94A3B8', lineHeight: 1.6 }}>
              Multi-factor scoring: 45% Skills + 20% Experience + 20% Projects + 15% Requirements coverage.
              Every score displays clear matched vs missing concepts.
            </p>
          </div>
        </div>
      </section>

      {/* ── DUAL PLATFORM SHOWCASE: ENTERPRISE & STUDENT/JOBSEEKER ── */}
      <section style={{ padding: '40px 24px 80px', maxWidth: 1200, margin: '0 auto' }}>
        {/* Showcase 1: Enterprise Recruiters */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.1fr 1fr',
          gap: 48,
          alignItems: 'center',
          marginBottom: 96,
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01))',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 24,
          padding: '48px 44px',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.5)',
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '5px 14px',
              borderRadius: 9999,
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#FFFFFF',
              marginBottom: 20,
            }}>
              <Sparkles size={13} /> Enterprise Talent Acquisition
            </div>

            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2.2rem',
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '-0.03em',
              lineHeight: 1.2,
              marginBottom: 16,
            }}>
              Autonomous Candidate Intelligence With 100% Explainable Grounding
            </h2>

            <p style={{ fontSize: '0.95rem', color: '#94A3B8', lineHeight: 1.6, marginBottom: 24 }}>
              Say goodbye to black-box candidate ranking. HireSense equips enterprise talent teams with explainable match analytics, side-by-side evidence inspection, and automatic NYC Local Law 144 compliance logs.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}>
              {[
                { title: 'Deterministic Resume Extraction', desc: 'Converts unstructured PDFs to structured skills & verified history with zero LLM hallucinations.' },
                { title: '4-Factor Weighted Ranking', desc: 'Precise formula: 45% Skills + 20% Experience + 20% Projects + 15% Requirements with full mathematical breakdown.' },
                { title: 'NYC Local Law 144 & EEOC Audited', desc: 'Real-time adverse impact tracking ensures selection rates adhere to the federal four-fifths benchmark.' },
                { title: 'Interview Synthesis & Dossier', desc: 'Acoustic speech rhythm, WPM cadence, and STAR methodology structure synthesized in seconds.' },
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ marginTop: 2, color: '#FFFFFF' }}>
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFFFFF' }}>{item.title}</div>
                    <div style={{ fontSize: '0.82rem', color: '#94A3B8', lineHeight: 1.45 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate('/login?role=recruiter')}
              style={{
                background: '#FFFFFF',
                color: '#000000',
                border: '1px solid #FFFFFF',
                borderRadius: 10,
                padding: '12px 28px',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 4px 16px rgba(255, 255, 255, 0.2)',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={e => e.currentTarget.style.background = '#E2E8F0'}
              onMouseOut={e => e.currentTarget.style.background = '#FFFFFF'}
            >
              Launch Recruiter Workspace <ArrowRight size={16} />
            </button>
          </div>

          {/* Image Right */}
          <div style={{
            position: 'relative',
            borderRadius: 20,
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
          }}>
            <img
              src="/enterprise_corporate_hiring.jpg"
              alt="HireSense Enterprise Talent Intelligence Boardroom"
              style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
            />
            <div style={{
              position: 'absolute',
              bottom: 16,
              left: 16,
              right: 16,
              padding: '12px 18px',
              borderRadius: 12,
              background: 'rgba(11, 15, 23, 0.85)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 500 }}>Enterprise Sourcing Pipeline</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFFFFF' }}>Candidate Fit Index: 94.2% Verified</div>
              </div>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#FFFFFF',
                background: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 6,
                padding: '3px 8px',
              }}>
                Bias-Free
              </span>
            </div>
          </div>
        </div>

        {/* Showcase 2: Students & Jobseekers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.1fr',
          gap: 48,
          alignItems: 'center',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01))',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 24,
          padding: '48px 44px',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.5)',
        }}>
          {/* Image Left */}
          <div style={{
            position: 'relative',
            borderRadius: 20,
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
          }}>
            <img
              src="/student_career_acceleration.jpg"
              alt="HireSense Student Career Acceleration Hub"
              style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
            />
            <div style={{
              position: 'absolute',
              bottom: 16,
              left: 16,
              right: 16,
              padding: '12px 18px',
              borderRadius: 12,
              background: 'rgba(11, 15, 23, 0.85)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 500 }}>Mock Interview Studio</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFFFFF' }}>STAR Structure: 86% · WPM: 148 Optimal</div>
              </div>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#FFFFFF',
                background: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 6,
                padding: '3px 8px',
              }}>
                Job Ready
              </span>
            </div>
          </div>

          {/* Text Right */}
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '5px 14px',
              borderRadius: 9999,
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#FFFFFF',
              marginBottom: 20,
            }}>
              <GraduationCap size={14} /> Students & Jobseekers Launchpad
            </div>

            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2.2rem',
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '-0.03em',
              lineHeight: 1.2,
              marginBottom: 16,
            }}>
              AI Interview Coaching & Transparent Career Acceleration
            </h2>

            <p style={{ fontSize: '0.95rem', color: '#94A3B8', lineHeight: 1.6, marginBottom: 24 }}>
              Never submit into an ATS black hole again. Practice realistic mock interviews with instant speech cadence feedback, master the STAR storytelling method, and build a verified candidate dossier recruiters can trust.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}>
              {[
                { title: 'Interactive AI Mock Interviews', desc: 'Simulate high-stakes technical & behavioral interview rounds customized to specific job roles.' },
                { title: 'Real-Time Speech & Cadence Analytics', desc: 'Objective acoustic feedback on speech rate (130-165 WPM target) and filler word frequency (<2%).' },
                { title: 'STAR Method Response Structuring', desc: 'Actionable coaching tips to structure Situation, Task, Action, and Measurable Result.' },
                { title: 'Candidate-in-the-Loop Agency', desc: 'Inspect exactly what the AI extracted from your resume and correct details before applying.' },
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ marginTop: 2, color: '#FFFFFF' }}>
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFFFFF' }}>{item.title}</div>
                    <div style={{ fontSize: '0.82rem', color: '#94A3B8', lineHeight: 1.45 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate('/login?role=candidate')}
              style={{
                background: '#FFFFFF',
                color: '#000000',
                border: '1px solid #FFFFFF',
                borderRadius: 10,
                padding: '12px 28px',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 4px 16px rgba(255, 255, 255, 0.2)',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={e => e.currentTarget.style.background = '#E2E8F0'}
              onMouseOut={e => e.currentTarget.style.background = '#FFFFFF'}
            >
              Start Candidate Practice <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ── WHY HIRESENSE IS UNIQUE (COMPARISON MATRIX) ── */}
      <section style={{
        padding: '80px 24px',
        maxWidth: 1200,
        margin: '0 auto',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 54 }}>
          <div style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.84rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
            Competitive Advantage
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#FFFFFF' }}>
            Why HireSense is Fundamentally Unique
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '0.95rem', maxWidth: 680, margin: '12px auto 0', lineHeight: 1.6 }}>
            Traditional ATS platforms rely on brittle keyword filtering and opaque generative AI. HireSense introduces deterministic grounding, explainable metrics, and candidate agency.
          </p>
        </div>

        {/* Comparison Table Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01))',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(255, 255, 255, 0.02)' }}>
                <th style={{ padding: '20px 24px', fontSize: '0.85rem', color: '#94A3B8', fontWeight: 600, width: '28%' }}>Dimension</th>
                <th style={{ padding: '20px 24px', fontSize: '0.85rem', color: '#EF4444', fontWeight: 700, width: '36%' }}>Traditional ATS & AI Screeners</th>
                <th style={{ padding: '20px 24px', fontSize: '0.85rem', color: '#FFFFFF', fontWeight: 700, width: '36%', background: 'rgba(255, 255, 255, 0.05)' }}>HireSense Explainable OS</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  dim: 'Candidate Screening',
                  trad: 'Brittle keyword matching incentivizes resume stuffing and misses non-standard phrasing.',
                  hiresense: 'Deterministic skill taxonomy & multi-factor semantic matching based on verified evidence.',
                },
                {
                  dim: 'AI Transparency & Trust',
                  trad: 'Opaque black-box scoring. Recruiters have no idea why a candidate received an 85% or 40%.',
                  hiresense: '100% explainable 4-factor scoring with clear matched vs missing concepts and source citation.',
                },
                {
                  dim: 'Interview Evaluation',
                  trad: 'Subjective human bias or controversial emotion/facial recognition pseudoscience.',
                  hiresense: 'Objective acoustic cadence (WPM, filler rate) and STAR structure adherence without facial guessing.',
                },
                {
                  dim: 'Candidate Experience',
                  trad: 'Resume black hole with silent automated rejections and zero actionable feedback.',
                  hiresense: 'Candidate-in-the-loop profile verification and real-time mock interview coaching dossiers.',
                },
                {
                  dim: 'Legal & Bias Compliance',
                  trad: 'High legal exposure under NYC Local Law 144, EEOC guidelines, and EU AI Act.',
                  hiresense: 'Continuous adverse impact monitoring ensuring compliance with the federal four-fifths rule.',
                },
              ].map((row, idx) => (
                <tr
                  key={idx}
                  style={{
                    borderBottom: idx === 4 ? 'none' : '1px solid rgba(255, 255, 255, 0.05)',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '20px 24px', fontSize: '0.9rem', fontWeight: 700, color: '#FFFFFF' }}>
                    {row.dim}
                  </td>
                  <td style={{ padding: '20px 24px', fontSize: '0.86rem', color: '#94A3B8', lineHeight: 1.5 }}>
                    <span style={{ color: '#EF4444', marginRight: 6 }}>✕</span> {row.trad}
                  </td>
                  <td style={{ padding: '20px 24px', fontSize: '0.86rem', color: '#E2E8F0', lineHeight: 1.5, background: 'rgba(255, 255, 255, 0.03)' }}>
                    <span style={{ color: '#FFFFFF', marginRight: 6, fontWeight: 700 }}>✓</span> {row.hiresense}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── WHAT WE DELIVER: MEASURED ENTERPRISE IMPACT ── */}
      <section style={{
        padding: '60px 24px 80px',
        maxWidth: 1200,
        margin: '0 auto',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.84rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
            Proven Performance
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#FFFFFF' }}>
            What We Deliver Across Global Hiring Pipelines
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {[
            { metric: '89%', label: 'Shortlist-to-Offer Precision', sub: 'High-confidence alignment between job specs and verified skills.' },
            { metric: '10x', label: 'Screening Velocity', sub: 'Triage 1,000+ candidates in under 20 minutes instead of 3 weeks.' },
            { metric: '0%', label: 'Generative Hallucinations', sub: '100% deterministic grounding backed by source resume evidence.' },
            { metric: '42%', label: 'Candidate Fluency Gain', sub: 'Measured communication improvement across 3 mock interview attempts.' },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.01))',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 18,
                padding: '28px 24px',
                textAlign: 'center',
                backdropFilter: 'blur(12px)',
                transition: 'all 0.25s ease',
              }}
              onMouseOver={e => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)'
                e.currentTarget.style.transform = 'translateY(-3px)'
              }}
              onMouseOut={e => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <div style={{ fontSize: '3.2rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 12 }}>
                {stat.metric}
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF', marginBottom: 8 }}>
                {stat.label}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#94A3B8', lineHeight: 1.45 }}>
                {stat.sub}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS / PROOF POINTS ── */}
      <section style={{
        padding: '60px 24px 80px',
        maxWidth: 1200,
        margin: '0 auto',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.84rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
            Social Proof
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#FFFFFF' }}>
            Trusted by Talent Leaders and Candidates Alike
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {[
            {
              quote: 'HireSense cut our first-round technical screening cycle from 18 days to 48 hours while giving us total confidence that our hiring decisions are auditable and EEOC compliant.',
              author: 'Sarah Jenkins',
              role: 'VP of Global Talent Acquisition',
              company: 'Vertex AI',
              initials: 'SJ',
            },
            {
              quote: 'The AI mock interview studio gave our university incubator students transparent feedback on their STAR structuring and filler words. Their technical interview pass rate jumped by 38%.',
              author: 'Prof. David Chen',
              role: 'Director of Career Innovation',
              company: 'Stanford Tech Ventures',
              initials: 'DC',
            },
            {
              quote: 'As a jobseeker, seeing exactly why I matched a role and being able to verify what the AI extracted from my PDF gave me unprecedented confidence during live technical interviews.',
              author: 'Elena Rostova',
              role: 'Senior Full Stack Engineer',
              company: 'Hired at CloudScale',
              initials: 'ER',
            },
          ].map((testi, idx) => (
            <div
              key={idx}
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0.01))',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 18,
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <p style={{ fontSize: '0.92rem', color: '#CBD5E1', lineHeight: 1.6, fontStyle: 'italic', marginBottom: 24 }}>
                "{testi.quote}"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #FFFFFF, #CBD5E1)',
                  color: '#000000',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {testi.initials}
                </div>
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#FFFFFF' }}>{testi.author}</div>
                  <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>{testi.role} · {testi.company}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CALL TO ACTION BANNER ── */}
      <section style={{
        padding: '0 24px 80px',
        maxWidth: 1200,
        margin: '0 auto',
      }}>
        <div style={{
          position: 'relative',
          borderRadius: 24,
          overflow: 'hidden',
          padding: '60px 48px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 24px 70px rgba(0, 0, 0, 0.6)',
        }}>
          {/* Subtle Ambient Radial */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '600px',
            height: '300px',
            background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative', zIndex: 2 }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2.8rem',
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '-0.03em',
              marginBottom: 16,
            }}>
              Step Into the Next Generation of Explainable Hiring
            </h2>
            <p style={{
              fontSize: '1.05rem',
              color: '#94A3B8',
              maxWidth: 640,
              margin: '0 auto 32px',
              lineHeight: 1.6,
            }}>
              Whether you are scaling an engineering organization or accelerating your personal career trajectory, HireSense brings verified transparency to every hiring milestone.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
              <button
                onClick={() => navigate('/login?role=recruiter')}
                style={{
                  background: '#FFFFFF',
                  color: '#000000',
                  border: '1px solid #FFFFFF',
                  borderRadius: 10,
                  padding: '14px 30px',
                  fontSize: '0.98rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 4px 18px rgba(255, 255, 255, 0.25)',
                  transition: 'all 0.2s ease',
                }}
                onMouseOver={e => e.currentTarget.style.background = '#E2E8F0'}
                onMouseOut={e => e.currentTarget.style.background = '#FFFFFF'}
              >
                Launch Recruiter Workspace <ArrowRight size={16} />
              </button>

              <button
                onClick={() => navigate('/login?role=candidate')}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  borderRadius: 10,
                  padding: '14px 26px',
                  fontSize: '0.98rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.2s ease',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.35)'
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.18)'
                }}
              >
                Candidate Mock Studio
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── EXTENDED FOOTER ── */}
      <footer id="compliance" style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '60px 24px 40px',
        background: '#05070B',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.5fr repeat(3, 1fr)',
            gap: 40,
            marginBottom: 48,
          }}>
            {/* Brand column */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <img
                  src="/hiresense_logo_white.webp"
                  alt="HireSense"
                  style={{ height: 28, width: 'auto', display: 'block' }}
                />
                <span style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: 600 }}>Explainable Talent OS</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.6, maxWidth: 300 }}>
                Autonomous talent intelligence, deterministic resume parsing, and observable speech analytics engineered for ethical global hiring.
              </p>
            </div>

            {/* Column 1: Solutions */}
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF', marginBottom: 16 }}>Solutions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.82rem', color: '#94A3B8' }}>
                <span style={{ cursor: 'pointer' }} onClick={() => navigate('/login?role=recruiter')}>Enterprise Recruiting</span>
                <span style={{ cursor: 'pointer' }} onClick={() => navigate('/login?role=recruiter')}>Startup Velocity Sourcing</span>
                <span style={{ cursor: 'pointer' }} onClick={() => navigate('/login?role=candidate')}>Student Career Acceleration</span>
                <span style={{ cursor: 'pointer' }} onClick={() => navigate('/login?role=candidate')}>Mock Interview Coaching</span>
              </div>
            </div>

            {/* Column 2: Governance & Compliance */}
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF', marginBottom: 16 }}>AI Governance</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.82rem', color: '#94A3B8' }}>
                <span>NYC Local Law 144 Audited</span>
                <span>EEOC Four-Fifths Compliant</span>
                <span>Zero Generative Hallucination</span>
                <span>GDPR Candidate Sovereignty</span>
              </div>
            </div>

            {/* Column 3: Platform */}
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF', marginBottom: 16 }}>Platform</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.82rem', color: '#94A3B8' }}>
                <span style={{ cursor: 'pointer' }} onClick={() => navigate('/login')}>Recruiter Portal</span>
                <span style={{ cursor: 'pointer' }} onClick={() => navigate('/login')}>Candidate Portal</span>
                <span>API Documentation</span>
                <span>Status & Reliability</span>
              </div>
            </div>
          </div>

          <div style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            paddingTop: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
            fontSize: '0.78rem',
            color: '#64748B',
          }}>
            <div>&copy; 2026 HireSense Systems Inc. All rights reserved.</div>
            <div style={{ display: 'flex', gap: 24 }}>
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Security Whitepaper</span>
              <span>Auditable AI Disclosures</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
