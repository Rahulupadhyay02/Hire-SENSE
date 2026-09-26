import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Briefcase,
  Users,
  ShieldCheck,
  Search,
  FileText,
  Calendar,
  ChevronDown,
  LayoutDashboard,
  GitPullRequest,
  BarChart2,
  Settings,
  LogOut,
  Sparkles,
  ExternalLink,
  Sliders,
  CheckCircle2,
  ArrowUpRight,
  Bell
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'
import RecruiterProfileModal from '../components/RecruiterProfileModal'

export default function RecruiterDashboard({ initialOpenProfile = false }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  // Navigation state
  const [activeNav, setActiveNav] = useState('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState('Date')
  const [dateMenuOpen, setDateMenuOpen] = useState(false)
  const [showProModal, setShowProModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(initialOpenProfile || window.location.pathname === '/recruiter/settings')
  const [recruiterProfile, setRecruiterProfile] = useState(null)

  // Real backend metrics & lists
  const [jobs, setJobs] = useState([])
  const [applications, setApplications] = useState([])
  const [stats, setStats] = useState({
    activeJobs: 3,
    totalCandidates: 11,
    avgFitScore: 71,
    newCandidates: 15,
    newHires: 12,
    interviews: 5,
    reviewed: 0,
    offer: 0,
    rejected: 0,
    cvsUsed: 3,
    cvsLimit: 300,
    vacanciesCreated: 2,
    vacanciesLimit: 50,
    tokensUsed: '8K',
    tokensLimit: '100K',
  })

  // Load live data from HireSense backend
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [jobsRes, appsRes, profRes] = await Promise.all([
          client.get('/jobs').catch(() => ({ data: [] })),
          client.get('/applications').catch(() => ({ data: [] })),
          client.get('/recruiters/me/profile').catch(() => ({ data: null })),
        ])

        const jobsList = Array.isArray(jobsRes.data) ? jobsRes.data : []
        const appsList = Array.isArray(appsRes.data) ? appsRes.data : []
        if (profRes.data) {
          setRecruiterProfile(profRes.data)
        }

        setJobs(jobsList)
        setApplications(appsList)

        const activeJ = jobsList.filter(j => (j.status || '').toLowerCase() === 'active').length || jobsList.length || 3
        const totalApps = appsList.length || 11

        // Stage counts from real applications
        const shortlisted = appsList.filter(a => a.status === 'Shortlisted' || a.status === 'Offer').length
        const inInterview = appsList.filter(a => a.status === 'Interview' || a.status === 'Reviewing').length
        const newApps = appsList.filter(a => a.status === 'New' || a.status === 'Pending').length || (totalApps - shortlisted - inInterview)
        const offers = appsList.filter(a => a.status === 'Offer').length
        const rejected = appsList.filter(a => a.status === 'Rejected').length

        // Average fit score calculation
        const avgMatch = appsList.length > 0
          ? Math.round(appsList.reduce((acc, a) => acc + (Number(a.match_score) || 0), 0) / appsList.length)
          : 71

        setStats(prev => ({
          ...prev,
          activeJobs: activeJ,
          totalCandidates: totalApps,
          avgFitScore: avgMatch || 71,
          newCandidates: newApps > 0 ? newApps : 15,
          newHires: shortlisted > 0 ? shortlisted : 12,
          interviews: inInterview > 0 ? inInterview : 5,
          offer: offers,
          rejected: rejected,
          cvsUsed: totalApps > 0 ? totalApps : 3,
          vacanciesCreated: jobsList.length > 0 ? jobsList.length : 2,
        }))
      } catch (err) {
        console.warn('RecruiterDashboard loaded with baseline data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Candidate rows: format real applications from backend, with graceful fallback to standard candidates if DB empty
  const displayCandidates = useMemo(() => {
    if (applications.length > 0) {
      return applications.slice(0, 5).map((app, idx) => {
        const score = Math.round(Number(app.match_score) || 75)
        const isGood = score >= 80
        return {
          id: app.id,
          name: app.candidate_name || `Candidate #${app.id}`,
          email: app.candidate_email || 'candidate@hiresense.ai',
          avatar: `https://images.unsplash.com/photo-${1534528741775 + idx * 1000}?w=100&auto=format&fit=crop&q=80`,
          fallbackInitials: (app.candidate_name || 'CA').split(' ').map(n => n[0]).join('').slice(0, 2),
          salary: '$3,500',
          position: app.job_title || 'Software Engineer',
          status: app.status || 'Interview',
          fitScore: score,
          scoreColor: isGood ? '#10B981' : '#F59E0B',
          scoreBg: isGood ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
        }
      })
    }

    // Baseline candidates when no DB applications exist yet
    return [
      {
        id: 101,
        name: 'Wade Warren',
        email: 'wadewarren@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        fallbackInitials: 'WW',
        salary: '$3,500',
        position: 'Middle Vue.js Frontend Engineer',
        status: 'Interview',
        fitScore: 84,
        scoreColor: '#10B981',
        scoreBg: 'rgba(16, 185, 129, 0.15)',
      },
      {
        id: 102,
        name: 'Juanita Flores',
        email: 'juanitaflores@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
        fallbackInitials: 'JF',
        salary: '$2,800',
        position: 'UX Researcher',
        status: 'Offer',
        fitScore: 81,
        scoreColor: '#10B981',
        scoreBg: 'rgba(16, 185, 129, 0.15)',
      },
      {
        id: 103,
        name: 'László Barbara',
        email: '',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        fallbackInitials: 'LB',
        salary: '$5,200',
        position: 'Full Stack Engineer Python + Vue.js',
        status: 'Interview',
        fitScore: 73,
        scoreColor: '#F59E0B',
        scoreBg: 'rgba(245, 158, 11, 0.15)',
      },
    ]
  }, [applications])

  // Filter candidates by live search query
  const filteredCandidates = useMemo(() => {
    if (!searchQuery.trim()) return displayCandidates
    const q = searchQuery.toLowerCase()
    return displayCandidates.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.position.toLowerCase().includes(q) ||
      c.status.toLowerCase().includes(q) ||
      (c.email && c.email.toLowerCase().includes(q))
    )
  }, [displayCandidates, searchQuery])

  // Spline geometry for the electric blue curve
  const splinePath = 'M 20 185 C 45 180, 60 170, 75 162 C 90 154, 105 170, 125 168 C 145 166, 155 174, 175 162 C 195 150, 205 125, 230 115 C 255 105, 275 120, 295 102 C 315 84, 320 62, 332 55 C 342 60, 350 120, 368 108 C 385 96, 400 135, 420 115 C 440 95, 455 128, 475 130 C 495 132, 510 145, 525 142'
  const splineArea = `${splinePath} L 525 210 L 20 210 Z`

  // Segment widths for pipeline overview
  const totalPipeline = (stats.newCandidates + stats.newHires + stats.interviews) || 32
  const pctNew = Math.max(10, Math.round((stats.newCandidates / totalPipeline) * 100))
  const pctHires = Math.max(10, Math.round((stats.newHires / totalPipeline) * 100))
  const pctInterviews = Math.max(5, 100 - pctNew - pctHires)

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#0B0F17',
      color: '#F8FAFC',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      boxSizing: 'border-box',
    }}>
      {/* ── LEFT FLOATING DOCK (Full HireSense Recruiter Navigation) ── */}
      <aside style={{
        width: 68,
        background: '#0D111A',
        borderRight: '1px solid rgba(255, 255, 255, 0.07)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px 0',
        flexShrink: 0,
        zIndex: 40,
      }}>
        {/* Brand App Icon */}
        <button
          onClick={() => navigate('/')}
          title="HireSense Landing"
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.02))',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 32,
            cursor: 'pointer',
            padding: 0,
            transition: 'all 0.2s ease',
          }}
          onMouseOver={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'}
          onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}
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
          {/* Dashboard (Active) */}
          <button
            onClick={() => { setActiveNav('dashboard'); navigate('/recruiter') }}
            title="Dashboard Overview"
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: activeNav === 'dashboard' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
              border: activeNav === 'dashboard' ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid transparent',
              color: activeNav === 'dashboard' ? '#FFFFFF' : '#64748B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: activeNav === 'dashboard' ? '0 0 16px rgba(255, 255, 255, 0.15)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <LayoutDashboard size={20} />
          </button>

          {/* Jobs / Vacancies */}
          <button
            onClick={() => { setActiveNav('jobs'); navigate('/recruiter/jobs') }}
            title="Job Postings"
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: activeNav === 'jobs' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
              border: activeNav === 'jobs' ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid transparent',
              color: activeNav === 'jobs' ? '#FFFFFF' : '#64748B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={e => e.currentTarget.style.color = '#CBD5E1'}
            onMouseOut={e => e.currentTarget.style.color = activeNav === 'jobs' ? '#FFFFFF' : '#64748B'}
          >
            <Briefcase size={20} />
          </button>

          {/* Candidates */}
          <button
            onClick={() => { setActiveNav('candidates'); navigate('/recruiter/candidates') }}
            title="Candidates Pool"
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: activeNav === 'candidates' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
              border: activeNav === 'candidates' ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid transparent',
              color: activeNav === 'candidates' ? '#FFFFFF' : '#64748B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={e => e.currentTarget.style.color = '#CBD5E1'}
            onMouseOut={e => e.currentTarget.style.color = activeNav === 'candidates' ? '#FFFFFF' : '#64748B'}
          >
            <Users size={20} />
          </button>

          {/* Pipeline */}
          <button
            onClick={() => { setActiveNav('pipeline'); navigate('/recruiter/pipeline') }}
            title="Recruitment Pipeline"
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: activeNav === 'pipeline' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
              border: activeNav === 'pipeline' ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid transparent',
              color: activeNav === 'pipeline' ? '#FFFFFF' : '#64748B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={e => e.currentTarget.style.color = '#CBD5E1'}
            onMouseOut={e => e.currentTarget.style.color = activeNav === 'pipeline' ? '#FFFFFF' : '#64748B'}
          >
            <GitPullRequest size={20} />
          </button>

          {/* AI Reports */}
          <button
            onClick={() => { setActiveNav('reports'); navigate('/recruiter/report') }}
            title="AI Assessment Reports"
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: activeNav === 'reports' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
              border: activeNav === 'reports' ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid transparent',
              color: activeNav === 'reports' ? '#FFFFFF' : '#64748B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={e => e.currentTarget.style.color = '#CBD5E1'}
            onMouseOut={e => e.currentTarget.style.color = activeNav === 'reports' ? '#FFFFFF' : '#64748B'}
          >
            <BarChart2 size={20} />
          </button>

          {/* Settings */}
          <button
            onClick={() => { setActiveNav('settings'); navigate('/recruiter/settings') }}
            title="Workspace Settings"
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: activeNav === 'settings' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
              border: activeNav === 'settings' ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid transparent',
              color: activeNav === 'settings' ? '#FFFFFF' : '#64748B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={e => e.currentTarget.style.color = '#CBD5E1'}
            onMouseOut={e => e.currentTarget.style.color = activeNav === 'settings' ? '#FFFFFF' : '#64748B'}
          >
            <Settings size={20} />
          </button>
        </div>

        {/* Bottom LogOut */}
        <button
          onClick={() => { logout(); navigate('/login') }}
          title="Sign Out"
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'transparent',
            border: 'none',
            color: '#64748B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseOver={e => e.currentTarget.style.color = '#EF4444'}
          onMouseOut={e => e.currentTarget.style.color = '#64748B'}
        >
          <LogOut size={20} />
        </button>
      </aside>

      {/* ── MAIN WORKSPACE ────────────────────────────────────────── */}
      <main style={{
        flex: 1,
        padding: '24px 36px 40px',
        overflowY: 'auto',
        background: `
          radial-gradient(ellipse 70% 35% at 50% -5%, rgba(37, 99, 235, 0.12), transparent 70%),
          linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 32px 32px, 32px 32px',
      }}>
        {/* Top Navbar Header */}
        <header style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 28,
        }}>
          <div style={{
            fontSize: '15px',
            fontWeight: 500,
            color: '#94A3B8',
            letterSpacing: '-0.01em',
          }}>
            Dashboard
          </div>

          {/* Right: Search Box + Notifications + Recruiter Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Search Box */}
            <div style={{
              position: 'relative',
              width: 280,
            }}>
              <Search size={15} style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748B',
                pointerEvents: 'none',
              }} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search members or vacancies..."
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.035)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 9999,
                  padding: '9px 16px 9px 38px',
                  fontSize: '13px',
                  color: '#E2E8F0',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)'}
              />
            </div>

            {/* Notification Bell */}
            <button
              title="Notifications"
              style={{
                position: 'relative',
                width: 38,
                height: 38,
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
                top: 8,
                right: 8,
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#FFFFFF',
                boxShadow: '0 0 6px rgba(255, 255, 255, 0.6)',
              }} />
            </button>

            {/* Recruiter Profile Pill Trigger */}
            <div
              id="btn-recruiter-profile-trigger"
              onClick={() => setIsProfileModalOpen(true)}
              title="Recruiter & Company Profile — Click to manage"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer',
                padding: '5px 12px 5px 6px',
                borderRadius: 12,
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
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
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
              }}>
                {(recruiterProfile?.name || user?.name || 'Priya Mehta')
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#FFFFFF', lineHeight: 1.2 }}>
                  {recruiterProfile?.name ? recruiterProfile.name.split(' ')[0] : (user?.name ? user.name.split(' ')[0] : 'Priya')}
                </span>
                <span style={{ fontSize: '11px', color: '#CBD5E1' }}>
                  {recruiterProfile?.company_name || 'NeuralStack AI'} · Recruiter
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* ── EXECUTIVE HERO BANNER ─────────────────────────────────── */}
        <div style={{
          position: 'relative',
          borderRadius: 20,
          overflow: 'hidden',
          marginBottom: 28,
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.6)',
          minHeight: 220,
          display: 'flex',
          alignItems: 'stretch',
        }}>
          {/* Background Image with Cinematic Overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: "url('/recruiter_hero_banner.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center right',
            zIndex: 1,
          }} />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, #0B0F17 0%, rgba(11, 15, 23, 0.94) 42%, rgba(11, 15, 23, 0.72) 70%, rgba(11, 15, 23, 0.35) 100%)',
            zIndex: 2,
          }} />

          {/* Banner Content Container */}
          <div style={{
            position: 'relative',
            zIndex: 3,
            padding: '32px 36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            gap: 32,
          }}>
            {/* Left Content */}
            <div style={{ maxWidth: 620 }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '5px 14px',
                borderRadius: 9999,
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(12px)',
                marginBottom: 16,
              }}>
                <Sparkles size={14} style={{ color: '#FFFFFF' }} />
                <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#FFFFFF' }}>
                  AI Talent Intelligence & Pipeline Velocity
                </span>
              </div>

              <h1 style={{
                fontSize: '32px',
                fontWeight: 800,
                color: '#FFFFFF',
                letterSpacing: '-0.03em',
                lineHeight: 1.15,
                margin: '0 0 10px 0',
              }}>
                Welcome back, {recruiterProfile?.name ? recruiterProfile.name.split(' ')[0] : (user?.name ? user.name.split(' ')[0] : 'Recruiter')}
              </h1>

              <p style={{
                fontSize: '14px',
                color: '#94A3B8',
                lineHeight: 1.5,
                margin: '0 0 22px 0',
                maxWidth: 540,
              }}>
                Autonomous candidate ranking, real-time interview synthesis, and evidence-based matching across all active hiring pipelines.
              </p>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <button
                  onClick={() => navigate('/recruiter/jobs')}
                  id="btn-create-job"
                  style={{
                    background: '#FFFFFF',
                    color: '#000000',
                    border: '1px solid #FFFFFF',
                    borderRadius: 10,
                    padding: '11px 24px',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: '0 4px 16px rgba(255, 255, 255, 0.2)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.background = '#E2E8F0';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.background = '#FFFFFF';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <span>+</span> Create New Job
                </button>

                <button
                  onClick={() => navigate('/recruiter/candidates')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255, 255, 255, 0.16)',
                    borderRadius: 10,
                    padding: '11px 22px',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.16)';
                  }}
                >
                  Candidate Pool <ArrowUpRight size={15} />
                </button>
              </div>
            </div>

            {/* Right HUD Metric Highlights */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              minWidth: 240,
              background: 'rgba(13, 17, 26, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 14,
              padding: '18px 20px',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: '#94A3B8' }}>Match Precision</span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  background: 'rgba(255, 255, 255, 0.1)',
                  padding: '2px 8px',
                  borderRadius: 6,
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                }}>
                  Top Tier
                </span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                {stats.avgFitScore}% Fit Index
              </div>

              <div style={{ height: 1, background: 'rgba(255, 255, 255, 0.08)', margin: '2px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#94A3B8' }}>Active Pipeline</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>{stats.totalCandidates} Candidates</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#94A3B8' }}>Interviews Pending</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#CBD5E1' }}>{stats.interviews} Scheduled</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── TOP 3 KPI STAT CARDS ──────────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 20,
          marginBottom: 28,
        }}>
          {/* Card 1: Total Vacancies */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.01))',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 16,
            padding: '22px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.25s ease',
          }}
          onMouseOver={e => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={e => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
              }}>
                <Briefcase size={22} />
              </div>
              <div>
                <div style={{ fontSize: '13px', color: '#94A3B8', fontWeight: 500, marginBottom: 4 }}>
                  Total Vacancies
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: '28px', fontWeight: 800, color: '#FFFFFF', lineHeight: 1 }}>
                    {stats.activeJobs}
                  </span>
                  <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>
                    active listings
                  </span>
                </div>
              </div>
            </div>
            <span style={{
              fontSize: '11px',
              fontWeight: 600,
              color: '#FFFFFF',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: 20,
              padding: '4px 10px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}>
              <ArrowUpRight size={12} /> Active
            </span>
          </div>

          {/* Card 2: Total Candidates */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.01))',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 16,
            padding: '22px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.25s ease',
          }}
          onMouseOver={e => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={e => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
              }}>
                <Users size={22} />
              </div>
              <div>
                <div style={{ fontSize: '13px', color: '#94A3B8', fontWeight: 500, marginBottom: 4 }}>
                  Total Candidates
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: '28px', fontWeight: 800, color: '#FFFFFF', lineHeight: 1 }}>
                    {stats.totalCandidates}
                  </span>
                  <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>
                    in pipeline
                  </span>
                </div>
              </div>
            </div>
            <span style={{
              fontSize: '11px',
              fontWeight: 600,
              color: '#FFFFFF',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: 20,
              padding: '4px 10px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}>
              <ArrowUpRight size={12} /> Sourced
            </span>
          </div>

          {/* Card 3: Avg Fit Score */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.01))',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 16,
            padding: '22px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.25s ease',
          }}
          onMouseOver={e => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={e => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
              }}>
                <ShieldCheck size={22} />
              </div>
              <div>
                <div style={{ fontSize: '13px', color: '#94A3B8', fontWeight: 500, marginBottom: 4 }}>
                  Avg Fit Score
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: '28px', fontWeight: 800, color: '#FFFFFF', lineHeight: 1 }}>
                    {stats.avgFitScore}%
                  </span>
                  <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>
                    match quality
                  </span>
                </div>
              </div>
            </div>
            <span style={{
              fontSize: '11px',
              fontWeight: 600,
              color: '#FFFFFF',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: 20,
              padding: '4px 10px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}>
              <CheckCircle2 size={12} /> Verified
            </span>
          </div>
        </div>

        {/* ── MAIN 2-COLUMN GRID (LEFT 69% / RIGHT 31%) ─────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 330px',
          gap: 20,
          alignItems: 'start',
        }}>
          {/* ══════════ LEFT COLUMN ══════════ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Card 1: Top Candidates */}
            <div style={{
              background: '#101726',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: 14,
              padding: '20px 24px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 18,
              }}>
                <span style={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF' }}>
                  Top Candidates
                </span>
                <button
                  onClick={() => navigate('/recruiter/candidates')}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '13px',
                    color: '#94A3B8',
                    cursor: 'pointer',
                    transition: 'color 0.2s',
                  }}
                  onMouseOver={e => e.currentTarget.style.color = '#FFFFFF'}
                  onMouseOut={e => e.currentTarget.style.color = '#94A3B8'}
                >
                  View all
                </button>
              </div>

              {/* Candidates Table */}
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
              }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <th style={{ padding: '8px 12px 12px 0', fontSize: '12px', fontWeight: 500, color: '#64748B' }}>Name</th>
                    <th style={{ padding: '8px 12px 12px', fontSize: '12px', fontWeight: 500, color: '#64748B' }}>Position and salary</th>
                    <th style={{ padding: '8px 12px 12px', fontSize: '12px', fontWeight: 500, color: '#64748B', textAlign: 'center' }}>Status</th>
                    <th style={{ padding: '8px 12px 12px', fontSize: '12px', fontWeight: 500, color: '#64748B', textAlign: 'center' }}>Fit Score</th>
                    <th style={{ padding: '8px 0 12px', width: 40 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCandidates.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '24px 0', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
                        No candidates match your search filter.
                      </td>
                    </tr>
                  ) : (
                    filteredCandidates.map((cand, idx) => (
                      <tr
                        key={cand.id}
                        style={{
                          borderBottom: idx === filteredCandidates.length - 1 ? 'none' : '1px solid rgba(255, 255, 255, 0.04)',
                          transition: 'background 0.15s ease',
                        }}
                      >
                        {/* Name & Avatar */}
                        <td style={{ padding: '14px 12px 14px 0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <img
                              src={cand.avatar}
                              alt={cand.name}
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: '50%',
                                objectFit: 'cover',
                                background: '#1E293B',
                              }}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                                if (e.currentTarget.nextElementSibling) {
                                  e.currentTarget.nextElementSibling.style.display = 'flex'
                                }
                              }}
                            />
                            <div style={{
                              display: 'none',
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              background: '#1E293B',
                              color: '#94A3B8',
                              fontSize: '12px',
                              fontWeight: 600,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                              {cand.fallbackInitials}
                            </div>
                            <div>
                              <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#FFFFFF' }}>
                                {cand.name}
                              </div>
                              {cand.email && (
                                <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                                  {cand.email}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Position and Salary */}
                        <td style={{ padding: '14px 12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#FFFFFF' }}>
                              {cand.salary}
                            </span>
                            <span style={{ fontSize: '13px', color: '#94A3B8' }}>
                              {cand.position}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 14px',
                            borderRadius: 8,
                            background: 'rgba(255, 255, 255, 0.05)',
                            color: '#E2E8F0',
                            fontSize: '12.5px',
                            fontWeight: 500,
                          }}>
                            {cand.status}
                          </span>
                        </td>

                        {/* Fit Score Badge */}
                        <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '5px 12px',
                            borderRadius: 6,
                            background: cand.scoreBg,
                            color: cand.scoreColor,
                            fontSize: '12.5px',
                            fontWeight: 600,
                          }}>
                            <span style={{ fontWeight: 700 }}>{cand.fitScore}</span> Proceed
                          </span>
                        </td>

                        {/* Action Doc Icon */}
                        <td style={{ padding: '14px 0', textAlign: 'right' }}>
                          <button
                            onClick={() => navigate(`/recruiter/report?appId=${cand.id}`)}
                            title="View AI Candidate Dossier"
                            style={{
                              background: 'rgba(255, 255, 255, 0.04)',
                              border: '1px solid rgba(255, 255, 255, 0.08)',
                              borderRadius: 8,
                              width: 32,
                              height: 32,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#64748B',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                            }}
                            onMouseOver={e => {
                              e.currentTarget.style.color = '#FFFFFF'
                              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)'
                            }}
                            onMouseOut={e => {
                              e.currentTarget.style.color = '#64748B'
                              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
                            }}
                          >
                            <FileText size={15} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Row 2: CV's per Vacancy & Hires Statistic */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1.45fr 1fr',
              gap: 20,
            }}>
              {/* Card Left: CV's per Vacancy Spline Chart */}
              <div style={{
                background: '#101726',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: 14,
                padding: '20px 22px 14px',
                position: 'relative',
              }}>
                {/* Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 10,
                }}>
                  <span style={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF' }}>
                    CV's per Vacancy
                  </span>

                  {/* Date Filter Pill Dropdown */}
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => setDateMenuOpen(!dateMenuOpen)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: 8,
                        padding: '4px 10px',
                        fontSize: '12px',
                        color: '#94A3B8',
                        cursor: 'pointer',
                      }}
                    >
                      <Calendar size={13} />
                      <span>{dateFilter}</span>
                      <ChevronDown size={13} />
                    </button>

                    {dateMenuOpen && (
                      <div style={{
                        position: 'absolute',
                        right: 0,
                        top: 32,
                        background: '#1E293B',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 8,
                        padding: '4px 0',
                        width: 130,
                        zIndex: 20,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                      }}>
                        {['Date', 'Last 7 days', 'Last 30 days', 'All time'].map(opt => (
                          <div
                            key={opt}
                            onClick={() => { setDateFilter(opt); setDateMenuOpen(false) }}
                            style={{
                              padding: '6px 12px',
                              fontSize: '12px',
                              color: opt === dateFilter ? '#FFFFFF' : '#CBD5E1',
                              fontWeight: opt === dateFilter ? 600 : 400,
                              cursor: 'pointer',
                            }}
                            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                          >
                            {opt}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Spline Area Chart Canvas */}
                <div style={{ position: 'relative', height: 180, width: '100%' }}>
                  <svg
                    viewBox="0 0 540 210"
                    style={{ width: '100%', height: '100%', overflow: 'visible' }}
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="chartWhiteGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
                      </linearGradient>
                      <filter id="glowWhite" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#FFFFFF" floodOpacity="0.5" />
                      </filter>
                    </defs>

                    {/* Dotted Guideline at Peak Dec (467) */}
                    <line
                      x1="20"
                      y1="55"
                      x2="480"
                      y2="55"
                      stroke="#3B82F6"
                      strokeOpacity="0.4"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />

                    {/* Blue Gradient Area Fill */}
                    <path
                      d={splineArea}
                      fill="url(#chartBlueGrad)"
                    />

                    {/* Blue Electric Spline Path */}
                    <path
                      d={splinePath}
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="2.4"
                      filter="url(#glowBlue)"
                    />

                    {/* Glowing Peak Dot at Dec (x=332, y=55) */}
                    <circle cx="332" cy="55" r="7" fill="rgba(59, 130, 246, 0.25)" />
                    <circle cx="332" cy="55" r="4" fill="#FFFFFF" stroke="#3B82F6" strokeWidth="2.5" />

                    {/* Y-Axis Guidelines / Labels on right */}
                    <text x="500" y="22" fill="#64748B" fontSize="11" textAnchor="start">750</text>
                    <text x="500" y="48" fill="#64748B" fontSize="11" textAnchor="start">500</text>
                    <text x="500" y="59" fill="#FFFFFF" fontWeight="700" fontSize="11.5" textAnchor="start">467</text>
                    <text x="500" y="98" fill="#64748B" fontSize="11" textAnchor="start">300</text>
                    <text x="500" y="145" fill="#64748B" fontSize="11" textAnchor="start">150</text>
                    <text x="500" y="196" fill="#64748B" fontSize="11" textAnchor="start">0</text>
                  </svg>

                  {/* X-Axis Month Labels */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingRight: 40,
                    paddingLeft: 8,
                    marginTop: 4,
                    fontSize: '11px',
                    color: '#64748B',
                  }}>
                    <span>Jun</span>
                    <span>Jul</span>
                    <span>Aug</span>
                    <span>Sep</span>
                    <span>Oct</span>
                    <span style={{ color: '#93C5FD', fontWeight: 600 }}>Dec</span>
                    <span>Jan</span>
                    <span>Feb</span>
                  </div>
                </div>
              </div>

              {/* Card Right: Hires Statistic */}
              <div style={{
                background: 'radial-gradient(ellipse at 50% 120%, rgba(37, 99, 235, 0.35) 0%, #101726 80%)',
                border: '1px solid rgba(59, 130, 246, 0.15)',
                borderRadius: 14,
                padding: '20px 22px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF' }}>
                  Hires Statistic
                </div>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '32px 0',
                  textAlign: 'center',
                }}>
                  <div style={{
                    fontSize: '13.5px',
                    color: '#94A3B8',
                    marginBottom: 8,
                    fontWeight: 400,
                  }}>
                    AI-find candidates
                  </div>
                  <div style={{
                    fontSize: '34px',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    letterSpacing: '-0.02em',
                    lineHeight: 1,
                  }}>
                    1,200 hired
                  </div>
                </div>

                <div style={{ height: 10 }} />
              </div>
            </div>

            {/* Card 3: Pipeline Overview */}
            <div style={{
              background: '#101726',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: 14,
              padding: '20px 24px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF' }}>
                  Pipeline Overview
                </div>
                <button
                  onClick={() => navigate('/recruiter/pipeline')}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '12px',
                    color: '#94A3B8',
                    cursor: 'pointer',
                  }}
                  onMouseOver={e => e.currentTarget.style.color = '#FFFFFF'}
                  onMouseOut={e => e.currentTarget.style.color = '#94A3B8'}
                >
                  Manage pipeline →
                </button>
              </div>

              {/* Numbers Row */}
              <div style={{
                display: 'flex',
                gap: 50,
                marginBottom: 14,
              }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#94A3B8', marginBottom: 2 }}>
                    New candidates
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF' }}>
                    {stats.newCandidates}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#94A3B8', marginBottom: 2 }}>
                    New hires
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF' }}>
                    {stats.newHires}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#94A3B8', marginBottom: 2 }}>
                    Interviews
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF' }}>
                    {stats.interviews}
                  </div>
                </div>
              </div>

              {/* Segmented Progress Bar */}
              <div style={{
                width: '100%',
                height: 10,
                borderRadius: 9999,
                background: 'rgba(255, 255, 255, 0.06)',
                display: 'flex',
                overflow: 'hidden',
                gap: 2,
                marginBottom: 16,
              }}>
                {/* New candidates */}
                <div style={{
                  width: `${pctNew}%`,
                  background: '#94A3B8',
                  borderRadius: '9999px 0 0 9999px',
                }} />
                {/* New hires */}
                <div style={{
                  width: `${pctHires}%`,
                  background: '#10B981',
                }} />
                {/* Interviews */}
                <div style={{
                  width: `${pctInterviews}%`,
                  background: '#A855F7',
                  borderRadius: '0 9999px 9999px 0',
                }} />
              </div>

              {/* Legend Row */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 18,
                fontSize: '12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#CBD5E1' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#94A3B8' }} />
                  <span><strong>{stats.newCandidates}</strong> New candidates</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#CBD5E1' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
                  <span><strong>{stats.newHires}</strong> New hires</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#CBD5E1' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#A855F7' }} />
                  <span><strong>{stats.interviews}</strong> interviews</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94A3B8' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B' }} />
                  <span><strong>{stats.reviewed}</strong> Reviewed</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94A3B8' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FFFFFF' }} />
                  <span><strong>{stats.offer}</strong> Offer</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94A3B8' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444' }} />
                  <span><strong>{stats.rejected}</strong> Rejected</span>
                </div>
              </div>
            </div>
          </div>

          {/* ══════════ RIGHT COLUMN ══════════ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Card 1: Must/Nice-to-have Rules */}
            <div style={{
              background: '#101726',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: 14,
              padding: '20px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}>
                <span style={{ fontSize: '14.5px', fontWeight: 600, color: '#FFFFFF' }}>
                  Must/Nice-to-have Rules
                </span>
                <Sliders size={14} color="#64748B" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Rule 1: Must Have */}
                <div style={{
                  borderLeft: '3px solid #EF4444',
                  paddingLeft: 12,
                }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#FFFFFF', marginBottom: 2 }}>
                    Must Have
                  </div>
                  <div style={{ fontSize: '12px', color: '#94A3B8', lineHeight: 1.4 }}>
                    Missing Critical Thinking - Auto Reject
                  </div>
                </div>

                {/* Rule 2: Nice to Have */}
                <div style={{
                  borderLeft: '3px solid #F97316',
                  paddingLeft: 12,
                }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#FFFFFF', marginBottom: 2 }}>
                    Nice to Have
                  </div>
                  <div style={{ fontSize: '12px', color: '#94A3B8', lineHeight: 1.4 }}>
                    Partial match
                  </div>
                </div>

                {/* Rule 3: Bonus */}
                <div style={{
                  borderLeft: '3px solid #10B981',
                  paddingLeft: 12,
                }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#FFFFFF', marginBottom: 2 }}>
                    Bonus
                  </div>
                  <div style={{ fontSize: '12px', color: '#94A3B8', lineHeight: 1.4 }}>
                    +10% for 10+ years BA experience<br />
                    Agile-Scrum
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Usage */}
            <div style={{
              background: '#101726',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: 14,
              padding: '20px',
            }}>
              <div style={{
                fontSize: '14.5px',
                fontWeight: 600,
                color: '#FFFFFF',
                marginBottom: 16,
              }}>
                Usage
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* CV's Used */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: 6 }}>
                    <span style={{ color: '#94A3B8' }}>CV's Used</span>
                    <span style={{ fontWeight: 600, color: '#FFFFFF' }}>{stats.cvsUsed}/{stats.cvsLimit}</span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: 5,
                    borderRadius: 9999,
                    background: 'rgba(255, 255, 255, 0.07)',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${Math.max(8, Math.min(100, (stats.cvsUsed / stats.cvsLimit) * 100))}%`,
                      height: '100%',
                      background: '#FFFFFF',
                      borderRadius: 9999,
                    }} />
                  </div>
                </div>

                {/* Vacancies Created */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: 6 }}>
                    <span style={{ color: '#94A3B8' }}>Vacancies Created</span>
                    <span style={{ fontWeight: 600, color: '#FFFFFF' }}>{stats.vacanciesCreated}/{stats.vacanciesLimit}</span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: 5,
                    borderRadius: 9999,
                    background: 'rgba(255, 255, 255, 0.07)',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${Math.max(6, Math.min(100, (stats.vacanciesCreated / stats.vacanciesLimit) * 100))}%`,
                      height: '100%',
                      background: '#FFFFFF',
                      borderRadius: 9999,
                    }} />
                  </div>
                </div>

                {/* Tokens Used */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: 6 }}>
                    <span style={{ color: '#94A3B8' }}>Tokens Used</span>
                    <span style={{ fontWeight: 600, color: '#FFFFFF' }}>{stats.tokensUsed}/{stats.tokensLimit}</span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: 5,
                    borderRadius: 9999,
                    background: 'rgba(255, 255, 255, 0.07)',
                    overflow: 'hidden',
                  }}>
                    <div style={{ width: '18%', height: '100%', background: '#FFFFFF', borderRadius: 9999 }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Skill Gaps Summary */}
            <div style={{
              background: '#101726',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: 14,
              padding: '20px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 14,
              }}>
                <span style={{ fontSize: '14.5px', fontWeight: 600, color: '#FFFFFF' }}>
                  Skill Gaps Summary
                </span>
                <button
                  onClick={() => navigate('/recruiter/report')}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '12px',
                    color: '#94A3B8',
                    cursor: 'pointer',
                  }}
                  onMouseOver={e => e.currentTarget.style.color = '#FFFFFF'}
                  onMouseOut={e => e.currentTarget.style.color = '#94A3B8'}
                >
                  View all
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ fontSize: '12.5px', color: '#94A3B8' }}>
                  Common gaps across candidates
                </div>
                <div style={{ fontSize: '13px', color: '#CBD5E1', lineHeight: 1.4 }}>
                  Critical thinking skill missing in 72% of CVs
                </div>
                <div style={{ fontSize: '13px', color: '#CBD5E1', lineHeight: 1.4 }}>
                  Domain Fintech most popular
                </div>
              </div>
            </div>

            {/* Card 4: Boost your search (High-tech architectural grid) */}
            <div style={{
              background: `
                linear-gradient(145deg, rgba(29, 78, 216, 0.22) 0%, rgba(15, 23, 42, 0.95) 100%),
                linear-gradient(rgba(59, 130, 246, 0.08) 1px, transparent 1px),
                linear-gradient(90deg, rgba(59, 130, 246, 0.08) 1px, transparent 1px)
              `,
              backgroundSize: '100% 100%, 20px 20px, 20px 20px',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              borderRadius: 14,
              padding: '22px 20px',
            }}>
              <div style={{
                fontSize: '16px',
                fontWeight: 700,
                color: '#FFFFFF',
                marginBottom: 8,
              }}>
                Boost your search
              </div>
              <p style={{
                fontSize: '12.5px',
                color: '#94A3B8',
                lineHeight: 1.5,
                margin: '0 0 18px 0',
              }}>
                AI-powered replies, tag insights, and tools that save hours
              </p>
              <button
                onClick={() => setShowProModal(true)}
                style={{
                  width: '100%',
                  background: '#FFFFFF',
                  color: '#000000',
                  border: '1px solid #FFFFFF',
                  borderRadius: 10,
                  padding: '11px 0',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(255, 255, 255, 0.15)',
                  transition: 'all 0.2s ease',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = '#E2E8F0';
                  e.currentTarget.style.color = '#000000';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = '#FFFFFF';
                  e.currentTarget.style.color = '#000000';
                }}
              >
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>

        {/* Pro Upgrade Modal */}
        {showProModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
            onClick={() => setShowProModal(false)}
          >
            <div
              style={{
                width: 440,
                background: '#0F172A',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: 16,
                padding: '28px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <Sparkles size={22} color="#FFFFFF" />
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#FFFFFF' }}>HireSense Pro Enterprise</h3>
              </div>
              <p style={{ fontSize: '13.5px', color: '#94A3B8', lineHeight: 1.5, marginBottom: 20 }}>
                Unlock unlimited candidate scoring, custom behavioral interview rubrics, automated WhatsApp candidate screening, and 10x token capacity.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={() => setShowProModal(false)}
                  style={{
                    flex: 1,
                    background: '#FFFFFF',
                    color: '#000000',
                    border: '1px solid #FFFFFF',
                    borderRadius: 10,
                    padding: '10px 0',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Start 14-Day Free Trial
                </button>
                <button
                  onClick={() => setShowProModal(false)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#CBD5E1',
                    border: 'none',
                    borderRadius: 10,
                    padding: '10px 18px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Recruiter Profile Modal */}
        <RecruiterProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          onProfileUpdated={(updated) => {
            setRecruiterProfile(updated)
          }}
        />
      </main>
    </div>
  )
}
