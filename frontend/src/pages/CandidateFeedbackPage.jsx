import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'
import {
  Sparkles, Target, Compass, ArrowRight, CheckCircle, TrendingUp,
  Clock, AlertCircle, Award, RefreshCw, BarChart2, Mic, Eye, Zap,
  Layers, ChevronRight, BookOpen, ExternalLink, Activity,
  Briefcase, MessageSquare, CheckCircle2, Lightbulb
} from 'lucide-react'
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area
} from 'recharts'
import { useChartColors } from '../components/Charts'

function ThemedTooltip({ active, payload, label }) {
  const { tooltipBg, tooltipBorder, tooltipText, tooltipSub } = useChartColors()
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: tooltipBg,
      border: `1px solid ${tooltipBorder}`,
      borderRadius: 10,
      padding: '10px 14px',
      backdropFilter: 'blur(20px)',
      fontSize: '0.82rem',
      boxShadow: '0 8px 32px rgba(0,0,0,0.25)'
    }}>
      <div style={{ fontWeight: 700, color: tooltipText, marginBottom: 6 }}>{label}</div>
      {payload.map((p, idx) => (
        <div key={idx} className="flex items-center gap-2" style={{ marginTop: 2 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color || p.stroke }} />
          <span style={{ color: tooltipSub }}>{p.name}:</span>
          <span style={{ fontWeight: 700, color: tooltipText }}>{p.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function CandidateFeedbackPage({ initialTab = 'pillars' }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const chartColors = useChartColors()

  const [activeTab, setActiveTab] = useState(initialTab)
  const [applications, setApplications] = useState([])
  const [selectedAppId, setSelectedAppId] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Load applications on mount
  useEffect(() => {
    client.get('/applications')
      .then(res => {
        const apps = res.data || []
        setApplications(apps)
        if (apps.length > 0) {
          // Check if URL has ?app_id=
          const params = new URLSearchParams(location.search)
          const qId = params.get('app_id')
          if (qId && apps.some(a => String(a.id) === qId)) {
            setSelectedAppId(qId)
          } else {
            setSelectedAppId(String(apps[0].id))
          }
        } else {
          setLoading(false)
        }
      })
      .catch(err => {
        setError('Failed to load applications. Please try again.')
        setLoading(false)
      })
  }, [location.search])

  // Fetch feedback when selectedAppId changes
  const fetchFeedback = async (appId) => {
    if (!appId) return
    setLoading(true)
    setError('')
    try {
      const res = await client.get(`/applications/${appId}/feedback`)
      setFeedback(res.data)
    } catch (err) {
      console.error('Failed to fetch candidate feedback:', err)
      setError(err.response?.data?.detail || 'Could not load feedback for this application.')
      setFeedback(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedAppId) {
      fetchFeedback(selectedAppId)
    }
  }, [selectedAppId])

  // Format progression data for charts and Attempt History table
  const progressChartData = (feedback?.timeline || []).map((t, idx) => ({
    attempt: `Att. ${t.attempt_number}`,
    score: Math.round(t.overall_score),
    fillerRate: t.filler_rate != null ? Number(t.filler_rate) : 0,
    wpm: t.wpm || 0,
    structure: Math.round(t.structure_score || 0),
    date: t.created_at ? new Date(t.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : `Att. ${t.attempt_number}`,
    deltaScore: t.delta_score,
    deltaFiller: t.delta_filler,
  }))

  const scoreDelta = progressChartData.length >= 2
    ? progressChartData[progressChartData.length - 1].score - progressChartData[0].score
    : 0
  const fillerDelta = progressChartData.length >= 2
    ? Number((progressChartData[0].fillerRate - progressChartData[progressChartData.length - 1].fillerRate).toFixed(1))
    : 0

  const latestScore = feedback?.latest_score ?? 0
  const firstScore = feedback?.timeline?.length > 0 ? feedback.timeline[0].overall_score : latestScore
  const totalScoreGain = feedback?.timeline?.length > 1 ? Math.round((latestScore - firstScore) * 10) / 10 : null

  return (
    <div className="app-shell">
      <Sidebar role="candidate" />
      <div className="main-content">
        <Topbar role="candidate" title="Candidate Coaching & Feedback" />

        <div className="page-container" style={{ maxWidth: 1200, margin: '0 auto' }}>
          
          {/* Top Application Selector & Header Banner */}
          <div className="glass-card" style={{ padding: '24px 28px', marginBottom: 24 }}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-3" style={{ marginBottom: 4 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: 'rgba(37, 99, 235, 0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#2563eb'
                  }}>
                    <MessageSquare size={20} />
                  </div>
                  <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    Interview Coaching & Progress Dossier
                  </h1>
                </div>
                <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                  Actionable, evidence-based feedback designed to sharpen your technical interviewing skills attempt-by-attempt.
                </p>
              </div>

              {/* Application Selector */}
              {applications.length > 0 && (
                <div className="flex items-center gap-3">
                  <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    Target Role:
                  </span>
                  <select
                    className="select-input"
                    style={{ minWidth: 260, fontWeight: 600 }}
                    value={selectedAppId}
                    onChange={e => setSelectedAppId(e.target.value)}
                  >
                    {applications.map(app => (
                      <option key={app.id} value={app.id}>
                        {app.job_title} (App #{app.id})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Application Meta Sub-bar */}
            {feedback && (
              <div className="flex items-center justify-between flex-wrap gap-3 pt-3" style={{ marginTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="badge badge-brand" style={{ fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Briefcase size={12} />
                    <span>{feedback.job_title}</span>
                  </span>
                  <span className="badge badge-neutral" style={{ fontSize: '0.78rem' }}>
                    Status: {feedback.current_status}
                  </span>
                  <span className="badge badge-info" style={{ fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Mic size={12} />
                    <span>{feedback.total_attempts} Practice {feedback.total_attempts === 1 ? 'Attempt' : 'Attempts'}</span>
                  </span>
                  {totalScoreGain !== null && totalScoreGain > 0 && (
                    <span className="badge badge-success" style={{ fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <TrendingUp size={12} />
                      <span>+{totalScoreGain}% Progress Gain</span>
                    </span>
                  )}
                </div>

                {/* Viewed Tracking Indicator */}
                <div className="flex items-center gap-1" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <Eye size={14} style={{ color: '#10b981' }} />
                  <span>Dossier logged as viewed</span>
                </div>
              </div>
            )}
          </div>

          {loading ? (
            <div className="glass-card" style={{ padding: '80px 20px', textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto 16px' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
                Synthesizing your structured feedback and longitudinal progress metrics...
              </p>
            </div>
          ) : error ? (
            <div className="glass-card" style={{ padding: '48px 24px', textAlign: 'center', borderColor: 'rgba(239,68,68,0.3)' }}>
              <AlertCircle size={36} color="#ef4444" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
                {error}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', maxWidth: 480, margin: '0 auto 20px' }}>
                Please make sure you have submitted at least one practice interview for this job application.
              </p>
              <button className="btn btn-primary" onClick={() => navigate('/candidate')}>
                <Mic size={16} /> Go to Interview Upload
              </button>
            </div>
          ) : feedback?.total_attempts === 0 ? (
            <div className="glass-card" style={{ padding: '60px 24px', textAlign: 'center' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%', background: 'rgba(61,110,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
              }}>
                <Mic size={32} color="var(--brand-400)" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>
                No Completed Interview Practice Runs Yet
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: 520, margin: '0 auto 24px', lineHeight: 1.5 }}>
                Submit your interview recording to receive automated, non-judgmental coaching feedback covering speaking pace, filler words, STAR answer structure, and technical keyword coverage.
              </p>
              <button className="btn btn-primary" onClick={() => navigate('/candidate')}>
                <Mic size={16} /> Record or Upload Interview Response
              </button>
            </div>
          ) : (
            <>
              {/* Top Quick Stats Grid */}
              <div className="grid-4" style={{ marginBottom: 24 }}>
                <div className="glass-card" style={{ padding: '20px 22px', borderColor: 'rgba(16,185,129,0.35)' }}>
                  <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Overall Score
                    </span>
                    <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>Latest</span>
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#10b981', lineHeight: 1 }}>
                    {feedback.latest_score}%
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 6 }}>
                    Weighted communication composite
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '20px 22px' }}>
                  <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Speaking Pace
                    </span>
                    <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>120–160 WPM Target</span>
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
                    {feedback.timeline.length > 0 ? feedback.timeline[feedback.timeline.length - 1].wpm : 0}
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)', marginLeft: 4 }}>WPM</span>
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 6 }}>
                    Conversational speed & rhythm
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '20px 22px' }}>
                  <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Filler Word Rate
                    </span>
                    <span className="badge badge-warning" style={{ fontSize: '0.72rem' }}>&lt; 3% Benchmark</span>
                  </div>
                  <div style={{
                    fontSize: '2rem', fontWeight: 900, lineHeight: 1,
                    color: (feedback.timeline[feedback.timeline.length - 1]?.filler_rate ?? 0) < 3.0 ? '#10b981' : '#f59e0b'
                  }}>
                    {feedback.timeline.length > 0 ? feedback.timeline[feedback.timeline.length - 1].filler_rate : 0}%
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 6 }}>
                    Density of verbal pauses (um, uh, like)
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '20px 22px' }}>
                  <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      STAR Structure
                    </span>
                    <span className="badge badge-brand" style={{ fontSize: '0.72rem' }}>75+ Goal</span>
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--brand-400)', lineHeight: 1 }}>
                    {feedback.timeline.length > 0 ? Math.round(feedback.timeline[feedback.timeline.length - 1].structure_score) : 0}
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)', marginLeft: 4 }}>/100</span>
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 6 }}>
                    Situation → Task → Action → Result
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-2" style={{ marginBottom: 24, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 12 }}>
                <button
                  className={`btn ${activeTab === 'pillars' ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ borderRadius: 8, padding: '8px 18px', fontSize: '0.86rem', fontWeight: 700 }}
                  onClick={() => setActiveTab('pillars')}
                >
                  <Target size={16} /> 4-Pillar Coaching Blueprint
                </button>
                <button
                  className={`btn ${activeTab === 'timeline' ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ borderRadius: 8, padding: '8px 18px', fontSize: '0.86rem', fontWeight: 700 }}
                  onClick={() => setActiveTab('timeline')}
                >
                  <TrendingUp size={16} /> Multi-Attempt History Timeline
                </button>
                <button
                  className={`btn ${activeTab === 'radar' ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ borderRadius: 8, padding: '8px 18px', fontSize: '0.86rem', fontWeight: 700 }}
                  onClick={() => setActiveTab('radar')}
                >
                  <Activity size={16} /> Competency Radar & Strengths
                </button>
              </div>

              {/* ══════════════════════════════════════════════════
                  TAB 1: 4-PILLAR COACHING BLUEPRINT
                 ══════════════════════════════════════════════════ */}
              {activeTab === 'pillars' && (
                <div>
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                      Constructive 4-Step Action Framework
                    </div>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0 }}>
                      Each dimension breaks down exactly: <strong>What Went Well</strong> → <strong>What Can Improve</strong> → <strong>Why It Matters</strong> → <strong>What To Do Next</strong>.
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 32 }}>
                    {feedback.pillars.map((pillar, idx) => (
                      <div
                        key={idx}
                        className="glass-card"
                        style={{
                          padding: 24,
                          borderColor: pillar.priority === 'high'
                            ? 'rgba(239,68,68,0.3)'
                            : pillar.priority === 'medium'
                            ? 'rgba(245,158,11,0.25)'
                            : 'rgba(16,185,129,0.25)'
                        }}
                      >
                        {/* Pillar Header */}
                        <div className="flex items-center justify-between flex-wrap gap-2" style={{ marginBottom: 16 }}>
                          <div className="flex items-center gap-3">
                            <div style={{
                              width: 36, height: 36, borderRadius: 8,
                              background: 'rgba(37, 99, 235, 0.12)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: '#2563eb'
                            }}>
                              <Target size={18} />
                            </div>
                            <div>
                              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                                {pillar.area}
                              </h3>
                              <div className="flex items-center gap-2" style={{ marginTop: 2 }}>
                                {pillar.current_metric && (
                                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                                    Current: <strong style={{ color: 'var(--text-primary)' }}>{pillar.current_metric}</strong>
                                  </span>
                                )}
                                {pillar.target_metric && (
                                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                                    • Target: <strong style={{ color: '#10b981' }}>{pillar.target_metric}</strong>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`badge ${
                              pillar.priority === 'high'
                                ? 'badge-danger'
                                : pillar.priority === 'medium'
                                ? 'badge-warning'
                                : 'badge-success'
                            }`} style={{ fontSize: '0.74rem', textTransform: 'capitalize' }}>
                              {pillar.priority} Priority
                            </span>
                          </div>
                        </div>

                        {/* 4 Distinct Blocks Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                          
                          {/* 1. What Went Well */}
                          <div style={{
                            padding: '14px 16px',
                            background: 'rgba(16,185,129,0.06)',
                            border: '1px solid rgba(16,185,129,0.22)',
                            borderRadius: 10,
                          }}>
                            <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
                              <CheckCircle2 size={16} color="#10b981" />
                              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase' }}>
                                What Went Well
                              </span>
                            </div>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.45 }}>
                              {pillar.what_went_well}
                            </p>
                          </div>

                          {/* 2. What Can Improve */}
                          <div style={{
                            padding: '14px 16px',
                            background: 'rgba(245,158,11,0.06)',
                            border: '1px solid rgba(245,158,11,0.22)',
                            borderRadius: 10,
                          }}>
                            <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
                              <Target size={16} color="#f59e0b" />
                              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase' }}>
                                What Can Improve
                              </span>
                            </div>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.45 }}>
                              {pillar.what_can_improve}
                            </p>
                          </div>

                          {/* 3. Why It Matters */}
                          <div style={{
                            padding: '14px 16px',
                            background: 'rgba(61,110,255,0.06)',
                            border: '1px solid rgba(61,110,255,0.22)',
                            borderRadius: 10,
                          }}>
                            <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
                              <Lightbulb size={16} color="var(--brand-400)" />
                              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--brand-400)', textTransform: 'uppercase' }}>
                                Why It Matters
                              </span>
                            </div>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.45 }}>
                              {pillar.why_it_matters}
                            </p>
                          </div>

                          {/* 4. What To Do Next */}
                          <div style={{
                            padding: '14px 16px',
                            background: 'rgba(139,92,246,0.06)',
                            border: '1px solid rgba(139,92,246,0.25)',
                            borderRadius: 10,
                          }}>
                            <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
                              <ArrowRight size={16} color="#8b5cf6" />
                              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#8b5cf6', textTransform: 'uppercase' }}>
                                What To Do Next
                              </span>
                            </div>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.45, fontWeight: 500 }}>
                              {pillar.what_to_do_next}
                            </p>
                          </div>

                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Practice Blueprint Drills Box */}
                  <div className="glass-card" style={{ padding: 24, marginBottom: 32, borderColor: 'var(--border-brand)' }}>
                    <div className="flex items-center gap-2" style={{ marginBottom: 16 }}>
                      <BookOpen size={20} color="var(--brand-400)" />
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                        Recommended Daily Interview Drills
                      </h3>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
                      <div style={{ padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Clock size={16} color="#10b981" />
                          <span>The 2-Second Pause Technique</span>
                        </div>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                          Before answering any question or transitioning to a new point, close your lips and take a silent 2-beat breath. This single habit drops filler word rate by up to 60%.
                        </p>
                      </div>

                      <div style={{ padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Target size={16} color="var(--brand-400)" />
                          <span>The 60-Second STAR Drill</span>
                        </div>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                          Set a 60-second timer. Deliver: 10s Situation (problem) → 10s Task (your goal) → 25s Action (exact code/tools used) → 15s Result (measurable latency or business metric).
                        </p>
                      </div>

                      <div style={{ padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Layers size={16} color="#8b5cf6" />
                          <span>Tech Stack Anchor Weaving</span>
                        </div>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                          Highlight 3 core keywords from the job posting (e.g. <em>FastAPI, PostgreSQL, Redis</em>) and structure your explanation explicitly around architectural choices made with them.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════════════════
                  TAB 2: MULTI-ATTEMPT HISTORY TIMELINE
                 ══════════════════════════════════════════════════ */}
              {activeTab === 'timeline' && (
                <div>
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                      Iterative Practice Progression Timeline
                    </div>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0 }}>
                      Observe your communication metrics and score gains across each recorded practice session.
                    </p>
                  </div>

                  {/* Side-by-Side Progress Trend Charts (Exact match to official specification) */}
                  <div className="grid-2" style={{ marginBottom: 24 }}>
                    {/* Score Improvement Chart */}
                    <div className="chart-card">
                      <div className="chart-header">
                        <div>
                          <div className="chart-title">Score Improvement</div>
                          <div className="chart-subtitle">Across {progressChartData.length} interview attempts</div>
                        </div>
                        {progressChartData.length >= 2 && (
                          <span className={`badge ${scoreDelta >= 0 ? 'badge-success' : 'badge-danger'}`} style={{ fontWeight: 800 }}>
                            {scoreDelta >= 0 ? `↑ +${scoreDelta} PTS` : `↓ ${scoreDelta} PTS`}
                          </span>
                        )}
                      </div>
                      <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={progressChartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="scoreGradOfficial" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke={chartColors.gridStroke} />
                          <XAxis dataKey="attempt" tick={{ fill: chartColors.labelFill, fontSize: 11 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: chartColors.labelFill, fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                          <Tooltip content={<ThemedTooltip />} />
                          <Area type="monotone" dataKey="score" name="Score" stroke="#10b981" fill="url(#scoreGradOfficial)" strokeWidth={2.5} dot={{ fill: '#10b981', r: 5, strokeWidth: 0 }} activeDot={{ r: 7 }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Filler Rate Trend Chart */}
                    <div className="chart-card">
                      <div className="chart-header">
                        <div>
                          <div className="chart-title">Filler Rate Trend</div>
                          <div className="chart-subtitle">Lower is better · Continuous fluency tracking</div>
                        </div>
                        {progressChartData.length >= 2 && (
                          <span className={`badge ${fillerDelta >= 0 ? 'badge-success' : 'badge-warning'}`} style={{ fontWeight: 800 }}>
                            {fillerDelta >= 0 ? `↓ ${fillerDelta}%` : `↑ ${Math.abs(fillerDelta)}%`}
                          </span>
                        )}
                      </div>
                      <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={progressChartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={chartColors.gridStroke} />
                          <XAxis dataKey="attempt" tick={{ fill: chartColors.labelFill, fontSize: 11 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: chartColors.labelFill, fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 'auto']} />
                          <Tooltip content={<ThemedTooltip />} />
                          <Line type="monotone" dataKey="fillerRate" name="Filler %" stroke="#f59e0b" strokeWidth={2.5} dot={{ fill: '#f59e0b', r: 5, strokeWidth: 0 }} activeDot={{ r: 7 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Attempt History Table (Exact match to official Progress specification) */}
                  <div className="glass-card" style={{ padding: 0, overflow: 'hidden', marginBottom: 24 }}>
                    <div style={{ padding: '20px 24px 14px' }}>
                      <div className="chart-title" style={{ fontSize: '1.05rem', fontWeight: 800 }}>
                        Attempt History
                      </div>
                    </div>
                    <div style={{ overflowX: 'auto', padding: '0 20px 20px' }}>
                      <table className="data-table" style={{ width: '100%' }}>
                        <thead>
                          <tr>
                            <th>ATTEMPT</th>
                            <th>RECORDED</th>
                            <th>OVERALL SCORE</th>
                            <th>FILLER RATE</th>
                            <th>SPEAKING RATE</th>
                            <th>STRUCTURE SCORE</th>
                            <th>CHANGE</th>
                          </tr>
                        </thead>
                        <tbody>
                          {progressChartData.map((d, i) => (
                            <tr key={i}>
                              <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{d.attempt}</td>
                              <td style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>{d.date}</td>
                              <td>
                                <div className="flex items-center gap-2">
                                  <div className="progress-bar" style={{ width: 80, height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
                                    <div className="progress-fill" style={{
                                      width: `${d.score}%`,
                                      height: '100%',
                                      background: 'linear-gradient(90deg, #10b981, #06b6d4)',
                                      borderRadius: 4
                                    }} />
                                  </div>
                                  <span style={{ fontWeight: 700, color: '#10b981' }}>{d.score}%</span>
                                </div>
                              </td>
                              <td style={{ color: d.fillerRate < 3.5 ? '#10b981' : '#f59e0b', fontWeight: 700 }}>
                                {d.fillerRate}%
                              </td>
                              <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{d.wpm} wpm</td>
                              <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{d.structure}%</td>
                              <td>
                                {i === 0 ? (
                                  <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontStyle: 'italic' }}>
                                    baseline
                                  </span>
                                ) : (
                                  <span className={`badge ${d.score >= progressChartData[i - 1].score ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.76rem', fontWeight: 800 }}>
                                    {d.score >= progressChartData[i - 1].score ? '↑' : '↓'} {Math.abs(d.score - progressChartData[i - 1].score)} pts
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Step-by-Step Attempt Timeline Cards */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
                    {feedback.timeline.map((attempt, i) => (
                      <div
                        key={attempt.interview_id}
                        className="glass-card"
                        style={{ padding: 22, borderLeft: i === feedback.timeline.length - 1 ? '4px solid #10b981' : '4px solid var(--border-subtle)' }}
                      >
                        <div className="flex items-center justify-between flex-wrap gap-2" style={{ marginBottom: 12 }}>
                          <div className="flex items-center gap-3">
                            <span style={{
                              width: 32, height: 32, borderRadius: '50%',
                              background: i === feedback.timeline.length - 1 ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)',
                              color: i === feedback.timeline.length - 1 ? '#10b981' : 'var(--text-primary)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: 800, fontSize: '0.88rem'
                            }}>
                              #{attempt.attempt_number}
                            </span>
                            <div>
                              <div style={{ fontWeight: 800, fontSize: '0.96rem', color: 'var(--text-primary)' }}>
                                Practice Attempt #{attempt.attempt_number}
                              </div>
                              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                                Recorded on {new Date(attempt.created_at).toLocaleDateString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                {attempt.duration_seconds && ` • ${Math.round(attempt.duration_seconds)}s recording duration`}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {attempt.delta_score !== null && (
                              <span className={`badge ${attempt.delta_score >= 0 ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.76rem', fontWeight: 700 }}>
                                {attempt.delta_score >= 0 ? `+${attempt.delta_score}%` : `${attempt.delta_score}%`} Overall
                              </span>
                            )}
                            {attempt.delta_filler !== null && (
                              <span className={`badge ${attempt.delta_filler <= 0 ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.76rem' }}>
                                {attempt.delta_filler <= 0 ? `${attempt.delta_filler}% Fillers` : `+${attempt.delta_filler}% Fillers`}
                              </span>
                            )}
                            <span className="badge badge-brand" style={{ fontSize: '0.88rem', fontWeight: 800 }}>
                              {attempt.overall_score}% Score
                            </span>
                          </div>
                        </div>

                        {/* Attempt Breakdown Matrix */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                          gap: 12,
                          padding: '12px 16px',
                          background: 'rgba(255,255,255,0.02)',
                          borderRadius: 8,
                          marginBottom: 10
                        }}>
                          <div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Speaking Pace</div>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                              {attempt.wpm} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>WPM</span>
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Filler Words</div>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: attempt.filler_rate < 3.0 ? '#10b981' : '#f59e0b' }}>
                              {attempt.filler_rate}%
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>STAR Structure</div>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--brand-400)' }}>
                              {Math.round(attempt.structure_score)}/100
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tech Relevance</div>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#8b5cf6' }}>
                              {Math.round(attempt.relevance_score)}/100
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Clarity</div>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                              {Math.round(attempt.clarity_score)}/100
                            </div>
                          </div>
                        </div>

                        {attempt.key_improvement && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Sparkles size={14} color="#10b981" />
                            <span><strong>Milestone:</strong> {attempt.key_improvement}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════════════════
                  TAB 3: COMPETENCY RADAR & STRENGTHS
                 ══════════════════════════════════════════════════ */}
              {activeTab === 'radar' && (
                <div style={{ marginBottom: 32 }}>
                  <div className="grid-2">
                    {/* 5-Axis Radar Chart */}
                    <div className="glass-card" style={{ padding: 24 }}>
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          5-Dimensional Competency Radar
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          Multi-axis balance of communication readiness
                        </div>
                      </div>

                      <ResponsiveContainer width="100%" height={280}>
                        <RadarChart data={feedback.radar}>
                          <PolarGrid stroke={chartColors.polarGrid} />
                          <PolarAngleAxis dataKey="area" tick={{ fill: chartColors.labelFill, fontSize: 11 }} />
                          <Radar dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.25} strokeWidth={2.5} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Strengths Highlights */}
                    <div className="glass-card" style={{ padding: 24, borderColor: 'rgba(16,185,129,0.25)' }}>
                      <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
                        <div className="flex items-center gap-2">
                          <Sparkles size={18} color="#10b981" />
                          <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                            Validated Candidate Strengths
                          </div>
                        </div>
                        <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>
                          {feedback.strengths_summary.length} Verified
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {feedback.strengths_summary.map((str, i) => (
                          <div
                            key={i}
                            style={{
                              padding: '12px 14px',
                              background: 'rgba(16,185,129,0.06)',
                              border: '1px solid rgba(16,185,129,0.2)',
                              borderRadius: 8,
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 10
                            }}
                          >
                            <CheckCircle size={16} color="#10b981" style={{ marginTop: 2, flexShrink: 0 }} />
                            <span style={{ fontSize: '0.84rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                              {str}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Responsible AI Guarantee Box */}
              <div style={{
                padding: '16px 20px',
                background: 'rgba(61,110,255,0.06)',
                border: '1px solid rgba(61,110,255,0.2)',
                borderRadius: 12,
                fontSize: '0.84rem',
                color: 'var(--text-secondary)',
                marginBottom: 32,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12
              }}>
                <span style={{ fontSize: '1.2rem', marginTop: -2 }}>ℹ️</span>
                <div style={{ lineHeight: 1.5 }}>
                  <strong style={{ color: 'var(--brand-400)' }}>HireSense Responsible AI Guarantee</strong> — {feedback.ethical_ai_notice}
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
