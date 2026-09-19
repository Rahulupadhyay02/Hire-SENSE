/**
 * Phase 8 — Unified AI Report Page (Fully Live)
 * ================================================
 * Loads all data from GET /api/v1/applications/{id}/report
 * Wires human decision to POST /api/v1/applications/{id}/decision
 * Zero hardcoded mock data.
 */

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import { ScoreRing, StatusBadge } from '../components/Charts'
import { useChartColors } from '../components/Charts'
import client from '../api/client'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import {
  CheckCircle2, XCircle, AlertTriangle, Mail, FileText, Target, Mic, Scale,
  Wrench, Calendar, Folder, Check, Sparkles, Search, Brain, GraduationCap,
  Briefcase, Award, TrendingUp, MessageSquare, Info, Pause, X, Loader2
} from 'lucide-react'

// ── Themed tooltip for charts ─────────────────────────────────────────────────
function ThemedTooltip({ active, payload, label }) {
  const { tooltipBg, tooltipBorder, tooltipText, tooltipSub } = useChartColors()
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: tooltipBg, border: `1px solid ${tooltipBorder}`,
      borderRadius: 10, padding: '10px 14px', backdropFilter: 'blur(20px)', fontSize: '0.82rem'
    }}>
      <div style={{ fontWeight: 700, color: tooltipText, marginBottom: 4 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: tooltipSub }}>
          {p.name}: <strong style={{ color: tooltipText }}>{p.value}{p.name === 'filler_rate' ? '%' : ''}</strong>
        </div>
      ))}
    </div>
  )
}

// ── Score colour helper ────────────────────────────────────────────────────────
function scoreColor(score) {
  if (score >= 80) return '#10b981'
  if (score >= 60) return '#f59e0b'
  return '#f43f5e'
}

// ── Toast notification ─────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [onClose])

  const bg = type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)'
  const border = type === 'success' ? 'rgba(16,185,129,0.4)' : 'rgba(244,63,94,0.4)'
  const Icon = type === 'success' ? CheckCircle2 : XCircle
  const iconColor = type === 'success' ? '#10b981' : '#f43f5e'

  return (
    <div style={{
      position: 'fixed', bottom: 32, right: 32, zIndex: 9999,
      background: bg, border: `1px solid ${border}`,
      borderRadius: 'var(--radius-lg)', padding: '16px 24px',
      backdropFilter: 'blur(20px)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      display: 'flex', alignItems: 'center', gap: 12,
      animation: 'fadeInUp 0.3s ease',
    }}>
      <Icon size={20} color={iconColor} style={{ flexShrink: 0 }} />
      <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem' }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginLeft: 8, display: 'flex', alignItems: 'center' }}>
        <X size={16} />
      </button>
    </div>
  )
}

// ── Skeleton loader ────────────────────────────────────────────────────────────
function Skeleton({ height = 20, width = '100%', style = {} }) {
  return (
    <div style={{
      height, width,
      background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      borderRadius: 8,
      ...style
    }} />
  )
}

// ── Skill status icon ──────────────────────────────────────────────────────────
function SkillStatusIcon({ status }) {
  if (status === 'matched') {
    return <Check size={16} color="#10b981" style={{ strokeWidth: 2.5 }} />
  }
  if (status === 'missing') {
    return <X size={16} color="#f43f5e" style={{ strokeWidth: 2.5 }} />
  }
  return <AlertTriangle size={15} color="#f59e0b" style={{ strokeWidth: 2 }} />
}

// ── Format file size ───────────────────────────────────────────────────────────
function formatBytes(bytes) {
  if (!bytes) return ''
  const mb = bytes / (1024 * 1024)
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function ReportPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const applicationId = searchParams.get('applicationId')

  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  // Decision state
  const [recruiterNotes, setRecruiterNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [currentStatus, setCurrentStatus] = useState(null)
  const [toast, setToast] = useState(null)

  // ── Load report ───────────────────────────────────────────────────────────
  const fetchReport = useCallback(async () => {
    if (!applicationId) {
      setError('No application ID provided. Go back and select a candidate.')
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      setError(null)
      const res = await client.get(`/applications/${applicationId}/report`)
      setReport(res.data)
      setCurrentStatus(res.data.current_status)
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to load report. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [applicationId])

  useEffect(() => { fetchReport() }, [fetchReport])

  // ── Submit human decision ─────────────────────────────────────────────────
  const handleDecision = async (decision) => {
    try {
      setSubmitting(true)
      const res = await client.post(`/applications/${applicationId}/decision`, {
        decision,
        notes: recruiterNotes || null,
      })
      setCurrentStatus(res.data.new_status)
      setReport(prev => prev ? { ...prev, current_status: res.data.new_status } : prev)
      setToast({ message: `Decision recorded: ${decision}. Audit log #${res.data.audit_log_id} created.`, type: 'success' })
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to record decision.'
      setToast({ message: msg, type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  const tabs = ['overview', 'resume', 'matching', 'interview', 'decision']

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="app-layout">
        <Sidebar role="recruiter" />
        <div className="main-content">
          <Topbar title="AI Candidate Report" subtitle="Loading report…" />
          <div className="page-content">
            <div className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
              <div className="flex items-center gap-4">
                <Skeleton height={72} width={72} style={{ borderRadius: '50%' }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <Skeleton height={28} width="40%" />
                  <Skeleton height={18} width="60%" />
                  <Skeleton height={14} width="50%" />
                </div>
                <Skeleton height={110} width={110} style={{ borderRadius: '50%' }} />
              </div>
            </div>
            <div className="grid-4" style={{ marginBottom: 24 }}>
              {[1, 2, 3, 4].map(i => <Skeleton key={i} height={140} />)}
            </div>
            <div className="grid-2">
              <Skeleton height={280} />
              <Skeleton height={280} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="app-layout">
        <Sidebar role="recruiter" />
        <div className="main-content">
          <Topbar title="AI Candidate Report" subtitle="Error" />
          <div className="page-content">
            <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
              <AlertTriangle size={44} style={{ color: '#f59e0b', margin: '0 auto 16px' }} />
              <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 12 }}>Could Not Load Report</h3>
              <div style={{ color: 'var(--text-muted)', marginBottom: 24 }}>{error}</div>
              <button className="btn btn-primary" onClick={() => navigate(-1)}>Go Back</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Derived display values ────────────────────────────────────────────────
  const ms = report.match_score || {}
  const iv = report.interview_summary || {}
  const re = report.resume_evidence || {}

  const candidateInitials = (report.candidate_name || 'U')
    .split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  // Radar data — prefer interview radar, fallback to match components
  const radarData = iv.latest_metrics?.radar?.length
    ? iv.latest_metrics.radar
    : [
        { area: 'Skills',       value: Math.round(ms.skills_score || 0) },
        { area: 'Experience',   value: Math.round(ms.experience_score || 0) },
        { area: 'Projects',     value: Math.round(ms.projects_score || 0) },
        { area: 'Requirements', value: Math.round(ms.coverage_score || 0) },
      ]

  // Communication trend data
  const trendData = (iv.trend || []).map((t, idx) => ({
    attempt: `Attempt ${idx + 1}`,
    score: t.score ? Math.round(t.score) : null,
    filler_rate: t.filler_rate ? Math.round(t.filler_rate * 10) / 10 : null,
  })).filter(t => t.score !== null)

  // Skills list from components
  const skillsList = ms.components?.skills || []

  const colors = useChartColors()

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="app-layout">
      <Sidebar role="recruiter" />
      <div className="main-content">
        <Topbar
          title="AI Candidate Report"
          subtitle={`${report.candidate_name} · ${report.job_title}`}
        />

        <div className="page-content">

          {/* ── Header Card ─────────────────────────────────────────────────── */}
          <div className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="candidate-avatar" style={{
                  width: 72, height: 72, fontSize: '1.6rem',
                  background: 'linear-gradient(135deg, #3d6eff, #8b5cf6)', flexShrink: 0
                }}>
                  {candidateInitials}
                </div>
                <div>
                  <div className="flex items-center gap-3" style={{ marginBottom: 6, flexWrap: 'wrap' }}>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem' }}>
                      {report.candidate_name}
                    </h2>
                    <StatusBadge status={currentStatus} />
                    {ms.is_overridden && (
                      <span className="badge" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}>
                        Score Overridden
                      </span>
                    )}
                    <span className="badge badge-brand">AI Report Ready</span>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {report.job_title}
                    {report.candidate_experience ? ` · ${report.candidate_experience} experience` : ''}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Mail size={13} />
                    <span>{report.candidate_email}</span>
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <ScoreRing score={Math.round(ms.overall_score || 0)} size={110} strokeWidth={10} label="Overall Match" />
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  vs. {report.job_title}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2" style={{ marginTop: 24, borderTop: '1px solid var(--border-subtle)', paddingTop: 20, flexWrap: 'wrap' }}>
              {tabs.map(t => {
                const iconMap = {
                  overview: Target,
                  resume: FileText,
                  matching: Scale,
                  interview: Mic,
                  decision: CheckCircle2,
                }
                const TabIcon = iconMap[t] || Target
                return (
                  <button
                    key={t}
                    id={`tab-${t}`}
                    onClick={() => setActiveTab(t)}
                    className="btn btn-sm"
                    style={{
                      borderRadius: 'var(--radius-full)',
                      border: activeTab === t ? '1px solid var(--border-brand)' : '1px solid var(--border-subtle)',
                      background: activeTab === t ? 'rgba(37, 99, 235, 0.15)' : 'transparent',
                      color: activeTab === t ? '#2563eb' : 'var(--text-muted)',
                      textTransform: 'capitalize', fontWeight: 600,
                      display: 'inline-flex', alignItems: 'center', gap: 6
                    }}
                  >
                    <TabIcon size={14} />
                    <span>{t}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* ── Tab: Overview ────────────────────────────────────────────────── */}
          {activeTab === 'overview' && (
            <>
              {/* 4 Score rings */}
              <div className="grid-4" style={{ marginBottom: 24 }}>
                {[
                  { label: 'Skills Match',   value: Math.round(ms.skills_score || 0) },
                  { label: 'Experience',     value: Math.round(ms.experience_score || 0) },
                  { label: 'Projects',       value: Math.round(ms.projects_score || 0) },
                  { label: 'Requirements',   value: Math.round(ms.coverage_score || 0) },
                ].map(c => (
                  <div key={c.label} className="stat-card" style={{ textAlign: 'center', paddingTop: 28 }}>
                    <ScoreRing score={c.value} size={90} strokeWidth={8} label={c.label} />
                  </div>
                ))}
              </div>

              <div className="grid-2" style={{ marginBottom: 24 }}>
                {/* Competency Radar */}
                <div className="chart-card">
                  <div className="chart-header"><div className="chart-title">Competency Radar</div></div>
                  <ResponsiveContainer width="100%" height={220}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke={colors.polarGrid} />
                      <PolarAngleAxis dataKey="area" tick={{ fill: colors.labelFill, fontSize: 11 }} />
                      <Radar dataKey="value" stroke="#3d6eff" fill="#3d6eff" fillOpacity={0.15} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Interview Progress */}
                <div className="chart-card">
                  <div className="chart-header">
                    <div className="chart-title">Interview Progress</div>
                    <div className="chart-subtitle">
                      {iv.total_interviews > 0 ? `Across ${iv.total_interviews} attempt${iv.total_interviews > 1 ? 's' : ''}` : 'No interviews yet'}
                    </div>
                  </div>
                  {trendData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={colors.gridStroke} />
                        <XAxis dataKey="attempt" tick={{ fill: colors.tickFill, fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: colors.tickFill, fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                        <Tooltip content={<ThemedTooltip />} />
                        <Line type="monotone" dataKey="score" name="Score" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', strokeWidth: 0, r: 5 }} />
                        <Line type="monotone" dataKey="filler_rate" name="filler_rate" stroke="#f59e0b" strokeWidth={2.5} dot={{ fill: '#f59e0b', strokeWidth: 0, r: 5 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 220, color: 'var(--text-muted)', flexDirection: 'column', gap: 8 }}>
                      <Mic size={32} color="var(--text-muted)" />
                      <span style={{ fontSize: '0.85rem' }}>No completed interviews yet</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Strengths & Areas to Review */}
              <div className="grid-2" style={{ marginBottom: 24 }}>
                <div className="glass-card" style={{ padding: 24 }}>
                  <div className="chart-title" style={{ marginBottom: 16 }}>Strengths Identified</div>
                  {(report.strengths || []).map((s, i) => (
                    <div key={i} className="flex items-center gap-3" style={{ padding: '10px 0', borderBottom: i < report.strengths.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', flexShrink: 0 }} />
                      <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{s}</span>
                    </div>
                  ))}
                </div>
                <div className="glass-card" style={{ padding: 24 }}>
                  <div className="chart-title" style={{ marginBottom: 16 }}>Areas to Review</div>
                  {(report.areas_to_review || []).map((a, i) => (
                    <div key={i} className="flex items-center gap-3" style={{ padding: '10px 0', borderBottom: i < report.areas_to_review.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', flexShrink: 0 }} />
                      <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{a}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Match Explanation */}
              {ms.explanation && (
                <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
                  <div className="chart-title" style={{ marginBottom: 12 }}>Match Score Rationale</div>
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.84rem',
                    color: 'var(--text-secondary)', lineHeight: 1.8,
                    padding: '14px 18px',
                    background: 'rgba(61,110,255,0.04)',
                    border: '1px solid rgba(61,110,255,0.15)',
                    borderRadius: 10, whiteSpace: 'pre-wrap'
                  }}>
                    {ms.explanation}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── Tab: Resume ──────────────────────────────────────────────────── */}
          {activeTab === 'resume' && (
            <>
              {/* Education */}
              {(re.education || []).length > 0 && (
                <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
                  <div className="chart-title" style={{ marginBottom: 16 }}>Education & Academics</div>
                  {re.education.map((edu, i) => (
                    <div key={i} style={{ padding: '12px 0', borderBottom: i < re.education.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                        {edu.degree || edu.qualification || 'Degree'}
                        {edu.field ? ` in ${edu.field}` : ''}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginTop: 4 }}>
                        {edu.institution || edu.school || ''}{edu.year ? ` · ${edu.year}` : ''}{edu.gpa ? ` · GPA: ${edu.gpa}` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Skills */}
              {(re.skills || []).length > 0 && (
                <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
                  <div className="chart-title" style={{ marginBottom: 16 }}>Extracted Skills</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {re.skills.map((sk, i) => (
                      <span key={i} className="badge badge-brand" style={{ fontSize: '0.82rem', padding: '5px 12px' }}>
                        {typeof sk === 'string' ? sk : (sk.name || sk)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              {(re.experience || []).length > 0 && (
                <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
                  <div className="chart-title" style={{ marginBottom: 16 }}>Work Experience</div>
                  {re.experience.map((exp, i) => (
                    <div key={i} style={{ padding: '14px 0', borderBottom: i < re.experience.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                        {exp.title || exp.role || 'Role'}
                        {exp.company ? ` · ${exp.company}` : ''}
                      </div>
                      {exp.duration && <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: 2 }}>{exp.duration}</div>}
                      {(exp.description || exp.summary) && (
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 8, lineHeight: 1.6 }}>
                          {String(exp.description || exp.summary).slice(0, 300)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Projects */}
              {(re.projects || []).length > 0 && (
                <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
                  <div className="chart-title" style={{ marginBottom: 16 }}>Key Projects</div>
                  {re.projects.map((proj, i) => (
                    <div key={i} style={{ padding: '14px 0', borderBottom: i < re.projects.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                        {proj.name || proj.title || 'Project'}
                      </div>
                      {(proj.description || proj.summary) && (
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 6, lineHeight: 1.6 }}>
                          {String(proj.description || proj.summary).slice(0, 300)}
                        </div>
                      )}
                      {(proj.technologies || proj.tech || []).length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                          {(proj.technologies || proj.tech).map((t, j) => (
                            <span key={j} style={{ fontSize: '0.78rem', padding: '3px 10px', borderRadius: 20, background: 'rgba(61,110,255,0.1)', color: 'var(--brand-400)', border: '1px solid rgba(61,110,255,0.2)' }}>
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Certifications */}
              {(re.certifications || []).length > 0 && (
                <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
                  <div className="chart-title" style={{ marginBottom: 16 }}>Certifications</div>
                  {re.certifications.map((cert, i) => (
                    <div key={i} style={{ padding: '8px 0', borderBottom: i < re.certifications.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                      <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                        {typeof cert === 'string' ? cert : (cert.name || cert.title || JSON.stringify(cert))}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Fallback if no data */}
              {!re.education?.length && !re.skills?.length && !re.experience?.length && !re.projects?.length && (
                <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
                  <FileText size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
                  <div style={{ color: 'var(--text-muted)' }}>No structured resume data yet. Ask the candidate to upload their resume.</div>
                </div>
              )}
            </>
          )}

          {/* ── Tab: Matching ─────────────────────────────────────────────────── */}
          {activeTab === 'matching' && (
            <>
              <div className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
                <div className="flex items-center gap-4" style={{ marginBottom: 24 }}>
                  <ScoreRing score={Math.round(ms.overall_score || 0)} size={120} strokeWidth={10} label="Overall Match" />
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 8 }}>Match Formula</h3>
                    <div style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.85rem',
                      color: 'var(--brand-400)', padding: '14px 18px',
                      background: 'rgba(61,110,255,0.06)',
                      border: '1px solid rgba(61,110,255,0.2)',
                      borderRadius: 10, lineHeight: 2
                    }}>
                      Overall = 0.45 × Skills ({ms.skills_score?.toFixed(1)}%) + 0.20 × Experience ({ms.experience_score?.toFixed(1)}%) + 0.20 × Projects ({ms.projects_score?.toFixed(1)}%) + 0.15 × Requirements ({ms.coverage_score?.toFixed(1)}%)<br />
                      = <strong>{ms.overall_score?.toFixed(1)}%</strong>
                      {ms.is_overridden && <span style={{ color: '#f59e0b', marginLeft: 12 }}>(Manually overridden)</span>}
                    </div>
                    {ms.is_overridden && ms.override_reason && (
                      <div style={{ marginTop: 8, fontSize: '0.82rem', color: '#f59e0b' }}>
                        Override reason: {ms.override_reason}
                      </div>
                    )}
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <AlertTriangle size={14} color="#f59e0b" />
                      <span>Scoring weights are starting defaults — validate with real users and revise after testing.</span>
                    </div>
                  </div>
                </div>

                {/* Component score bars */}
                <div className="grid-4" style={{ marginBottom: 24 }}>
                  {[
                    { label: 'Skills (45%)',       value: ms.skills_score || 0 },
                    { label: 'Experience (20%)',    value: ms.experience_score || 0 },
                    { label: 'Projects (20%)',      value: ms.projects_score || 0 },
                    { label: 'Requirements (15%)',  value: ms.coverage_score || 0 },
                  ].map(c => (
                    <div key={c.label} className="stat-card" style={{ padding: 18 }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 10 }}>{c.label}</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, color: scoreColor(c.value) }}>
                        {Math.round(c.value)}%
                      </div>
                      <div className="progress-bar" style={{ marginTop: 10 }}>
                        <div className="progress-fill" style={{ width: `${c.value}%`, background: `linear-gradient(90deg, ${scoreColor(c.value)}, ${scoreColor(c.value)}88)` }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Skill-by-Skill Evidence */}
                {skillsList.length > 0 && (
                  <>
                    <div className="chart-title" style={{ marginBottom: 16 }}>Skill-by-Skill Evidence</div>
                    {skillsList.map((s, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 16,
                        padding: '12px 0', borderBottom: '1px solid var(--border-subtle)'
                      }}>
                        <div style={{ width: 32, textAlign: 'center' }}>
                          <SkillStatusIcon status={s.status} />
                        </div>
                        <div style={{ width: 120, fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                          {s.skill}
                          {s.category === 'preferred' && (
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 6 }}>(preferred)</span>
                          )}
                        </div>
                        <div style={{ flex: 1, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          {s.evidence || (s.status === 'matched' ? 'Evidence found' : s.status === 'missing' ? 'Not found in profile' : 'Limited evidence')}
                        </div>
                        <div style={{ width: 80, textAlign: 'right', fontWeight: 700, fontSize: '0.82rem', color: s.status === 'matched' ? '#10b981' : s.status === 'missing' ? '#f43f5e' : '#f59e0b' }}>
                          {s.status === 'matched' ? 'Matched' : s.status === 'missing' ? 'Missing' : 'Unclear'}
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {skillsList.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
                    Run AI analysis first to see skill-by-skill evidence.
                  </div>
                )}
              </div>

              {/* AI Explanation */}
              {ms.explanation && (
                <div className="glass-card" style={{ padding: 24 }}>
                  <div className="chart-title" style={{ marginBottom: 12 }}>Detailed Match Breakdown</div>
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.84rem',
                    color: 'var(--text-secondary)', lineHeight: 1.8,
                    padding: '14px 18px',
                    background: 'rgba(61,110,255,0.04)',
                    border: '1px solid rgba(61,110,255,0.15)',
                    borderRadius: 10, whiteSpace: 'pre-wrap'
                  }}>
                    {ms.explanation}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── Tab: Interview ────────────────────────────────────────────────── */}
          {activeTab === 'interview' && (
            <>
              {iv.total_interviews === 0 ? (
                <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
                  <Mic size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
                  <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 8 }}>No Interviews Yet</h3>
                  <div style={{ color: 'var(--text-muted)' }}>
                    Upload an interview recording from the Candidates page to see AI analysis here.
                  </div>
                </div>
              ) : (
                <>
                  {/* Communication metric stats */}
                  {iv.latest_metrics && (
                    <div className="grid-4" style={{ marginBottom: 24 }}>
                      {[
                        { label: 'Word Count',    value: iv.latest_metrics.word_count || 0, icon: FileText, sub: 'words total', color: '#3d6eff' },
                        { label: 'Filler Rate',   value: `${iv.latest_metrics.filler_word_rate || 0}%`, icon: MessageSquare, sub: `${iv.latest_metrics.filler_count || 0} filler words`, color: '#10b981' },
                        { label: 'Speaking Rate', value: `${iv.latest_metrics.wpm || 0}`, icon: Mic, sub: 'words per minute', color: '#8b5cf6' },
                        { label: 'Comm. Score',   value: `${Math.round(iv.latest_communication_score || 0)}`, icon: Award, sub: 'out of 100', color: '#f59e0b' },
                      ].map(m => {
                        const MetricIcon = m.icon
                        return (
                          <div key={m.label} className="stat-card">
                            <div style={{ color: m.color, marginBottom: 12 }}>
                              <MetricIcon size={22} />
                            </div>
                            <div className="stat-value" style={{ fontSize: '1.8rem', background: `linear-gradient(135deg, ${m.color}, ${m.color}88)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                              {m.value}
                            </div>
                            <div className="stat-label">{m.label}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{m.sub}</div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Communication Radar + Strengths side by side */}
                  <div className="grid-2" style={{ marginBottom: 24 }}>
                    {iv.latest_metrics?.radar?.length > 0 && (
                      <div className="chart-card">
                        <div className="chart-header"><div className="chart-title">Communication Radar</div></div>
                        <ResponsiveContainer width="100%" height={220}>
                          <RadarChart data={iv.latest_metrics.radar}>
                            <PolarGrid stroke={colors.polarGrid} />
                            <PolarAngleAxis dataKey="area" tick={{ fill: colors.labelFill, fontSize: 11 }} />
                            <Radar dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.15} strokeWidth={2} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    {/* Strengths */}
                    {iv.latest_metrics?.strengths?.length > 0 && (
                      <div className="glass-card" style={{ padding: 24 }}>
                        <div className="chart-title" style={{ marginBottom: 14 }}>Strengths Detected</div>
                        {iv.latest_metrics.strengths.map((s, i) => (
                          <div key={i} className="flex items-center gap-3" style={{ padding: '8px 0', borderBottom: i < iv.latest_metrics.strengths.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', flexShrink: 0 }} />
                            <span style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>{s}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Improvement Coaching */}
                  {iv.latest_metrics?.improvements?.length > 0 && (
                    <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
                      <div className="chart-title" style={{ marginBottom: 16 }}>Areas for Improvement</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {iv.latest_metrics.improvements.map((imp, i) => (
                          <div key={i} style={{
                            padding: '14px 18px',
                            background: imp.priority === 'high' ? 'rgba(244,63,94,0.06)' : 'rgba(245,158,11,0.06)',
                            border: `1px solid ${imp.priority === 'high' ? 'rgba(244,63,94,0.2)' : 'rgba(245,158,11,0.2)'}`,
                            borderRadius: 'var(--radius-lg)',
                          }}>
                            <div className="flex items-center gap-3" style={{ marginBottom: 8 }}>
                              <Target size={18} color="#f59e0b" />
                              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{imp.label}</div>
                              <span style={{ marginLeft: 'auto', fontSize: '0.78rem', padding: '3px 10px', borderRadius: 20, background: imp.priority === 'high' ? 'rgba(244,63,94,0.15)' : 'rgba(245,158,11,0.15)', color: imp.priority === 'high' ? '#f43f5e' : '#f59e0b' }}>
                                {imp.priority}
                              </span>
                            </div>
                            <div className="flex gap-6" style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                              <span>Current: <strong style={{ color: 'var(--text-primary)' }}>{imp.current}</strong></span>
                              <span>Target: <strong style={{ color: '#10b981' }}>{imp.target}</strong></span>
                            </div>
                            <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{imp.action}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Transcript */}
                  {iv.latest_transcript && (
                    <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
                      <div className="chart-title" style={{ marginBottom: 14 }}>Interview Transcript</div>
                      <div style={{
                        maxHeight: 320, overflowY: 'auto',
                        fontFamily: 'var(--font-mono)', fontSize: '0.83rem',
                        color: 'var(--text-secondary)', lineHeight: 1.8,
                        padding: '14px 18px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 10, whiteSpace: 'pre-wrap',
                      }}>
                        {iv.latest_transcript}
                      </div>
                    </div>
                  )}

                  {/* Progress trend */}
                  {trendData.length > 1 && (
                    <div className="chart-card" style={{ marginBottom: 24 }}>
                      <div className="chart-header">
                        <div className="chart-title">Communication Progress</div>
                        <div className="chart-subtitle">{iv.total_interviews} interviews</div>
                      </div>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={trendData}>
                          <CartesianGrid strokeDasharray="3 3" stroke={colors.gridStroke} />
                          <XAxis dataKey="attempt" tick={{ fill: colors.tickFill, fontSize: 11 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: colors.tickFill, fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                          <Tooltip content={<ThemedTooltip />} />
                          <Line type="monotone" dataKey="score" name="Score" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', strokeWidth: 0, r: 5 }} />
                          <Line type="monotone" dataKey="filler_rate" name="filler_rate" stroke="#f59e0b" strokeWidth={2.5} dot={{ fill: '#f59e0b', strokeWidth: 0, r: 5 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Responsible AI Notice */}
                  <div style={{
                    padding: '16px 20px',
                    background: 'rgba(245,158,11,0.06)',
                    border: '1px solid rgba(245,158,11,0.2)',
                    borderRadius: 'var(--radius-lg)',
                    fontSize: '0.84rem', color: 'var(--text-secondary)',
                    display: 'flex', gap: 12, alignItems: 'flex-start'
                  }}>
                    <AlertTriangle size={18} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <strong style={{ color: '#f59e0b' }}>AI Limitations Notice</strong> — Interview analysis is based on observable speech and text evidence only.
                      No personality, honesty, emotion or mental-state claims are made. Recruiter review and human decision required.
                      Original transcript remains available as evidence.
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {/* ── Tab: Decision ─────────────────────────────────────────────────── */}
          {activeTab === 'decision' && (
            <div className="glass-card" style={{ padding: 32, borderColor: 'var(--border-brand)' }}>
              <div className="flex items-center gap-3" style={{ marginBottom: 24 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: 'rgba(37, 99, 235, 0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#2563eb'
                }}>
                  <Scale size={22} />
                </div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)' }}>Human Review Decision</h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    AI provides evidence. You make the decision. All actions are logged and auditable.
                  </div>
                </div>
              </div>

              {/* Evidence summary */}
              <div className="grid-3" style={{ marginBottom: 28 }}>
                {[
                  {
                    label: 'Resume AI',
                    status: re.skills?.length > 0 ? 'Profile parsed & verified' : 'No resume data',
                    color: re.skills?.length > 0 ? '#10b981' : '#f59e0b',
                  },
                  {
                    label: 'Match Score',
                    status: ms.overall_score > 0 ? `${Math.round(ms.overall_score)}% — ${ms.overall_score >= 80 ? 'Excellent match' : ms.overall_score >= 60 ? 'Good match' : 'Below threshold'}` : 'Not computed',
                    color: ms.overall_score >= 80 ? '#10b981' : ms.overall_score >= 60 ? '#f59e0b' : '#f43f5e',
                  },
                  {
                    label: 'Interview AI',
                    status: iv.total_interviews > 0 ? `${iv.total_interviews} interview${iv.total_interviews > 1 ? 's' : ''} analyzed` : 'No interviews',
                    color: iv.total_interviews > 0 ? '#10b981' : '#f59e0b',
                  },
                ].map(s => (
                  <div key={s.label} style={{
                    padding: '16px', background: `${s.color}0d`,
                    border: `1px solid ${s.color}33`,
                    borderRadius: 'var(--radius-lg)', textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6 }}>{s.label}</div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: s.color }}>{s.status}</div>
                  </div>
                ))}
              </div>

              {/* Current status banner */}
              {currentStatus && currentStatus !== 'Pending' && currentStatus !== 'Reviewing' && (
                <div style={{
                  marginBottom: 24, padding: '14px 18px',
                  background: 'rgba(61,110,255,0.08)',
                  border: '1px solid var(--border-brand)',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: '0.88rem', color: 'var(--text-secondary)',
                  display: 'flex', alignItems: 'center', gap: 10
                }}>
                  <Info size={16} color="var(--brand-400)" />
                  <span>Current decision: <strong style={{ color: 'var(--brand-400)' }}>{currentStatus}</strong>. You can change it by making a new selection below.</span>
                </div>
              )}

              {/* Recruiter Notes */}
              <div className="form-group" style={{ marginBottom: 24 }}>
                <label className="form-label" htmlFor="recruiter-notes">Recruiter Notes (optional)</label>
                <textarea
                  id="recruiter-notes"
                  className="form-input form-textarea"
                  placeholder="Add any notes about this candidate before making a decision..."
                  value={recruiterNotes}
                  onChange={e => setRecruiterNotes(e.target.value)}
                  style={{ minHeight: 90 }}
                />
              </div>

              {/* Decision Buttons */}
              <div className="flex gap-3">
                <button
                  className="btn btn-primary btn-lg"
                  id="decision-shortlist"
                  style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  disabled={submitting}
                  onClick={() => handleDecision('Shortlisted')}
                >
                  <CheckCircle2 size={18} />
                  <span>{submitting ? 'Saving…' : 'Shortlist Candidate'}</span>
                </button>
                <button
                  className="btn btn-secondary btn-lg"
                  id="decision-hold"
                  style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  disabled={submitting}
                  onClick={() => handleDecision('Hold')}
                >
                  <Pause size={18} />
                  <span>{submitting ? 'Saving…' : 'Put on Hold'}</span>
                </button>
                <button
                  className="btn btn-danger"
                  id="decision-reject"
                  style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  disabled={submitting}
                  onClick={() => handleDecision('Rejected')}
                >
                  <XCircle size={18} />
                  <span>{submitting ? 'Saving…' : 'Reject Candidate'}</span>
                </button>
              </div>

              <div style={{ marginTop: 16, fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                Decision will be logged with timestamp, recruiter ID, and AI evidence snapshot. AI does not make this decision — you do.
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
