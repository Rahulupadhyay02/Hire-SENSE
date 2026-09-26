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
  Briefcase, Award, TrendingUp, MessageSquare, Info, Pause, X, Loader2,
  Users, ChevronLeft, ChevronRight, ArrowLeft, ArrowRight
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
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const rawAppId = searchParams.get('applicationId') || searchParams.get('appId') || searchParams.get('id')
  const [applicationId, setApplicationId] = useState(rawAppId || null)

  const [jobs, setJobs] = useState([])
  const [allApplications, setAllApplications] = useState([])
  const [selectedJobId, setSelectedJobId] = useState(null)
  const [loadingData, setLoadingData] = useState(true)

  const [report, setReport] = useState(null)
  const [loadingReport, setLoadingReport] = useState(false)
  const [reportError, setReportError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  // Load jobs and applications
  useEffect(() => {
    setLoadingData(true)
    Promise.all([
      client.get('/jobs').catch(() => ({ data: [] })),
      client.get('/applications').catch(() => ({ data: [] }))
    ])
      .then(([jobsRes, appsRes]) => {
        const fetchedJobs = jobsRes.data || []
        const fetchedApps = appsRes.data || []
        setJobs(fetchedJobs)
        setAllApplications(fetchedApps)

        // Determine default selectedJobId
        if (applicationId) {
          const matchedApp = fetchedApps.find(a => String(a.id) === String(applicationId))
          if (matchedApp) {
            setSelectedJobId(matchedApp.job_id)
          } else if (fetchedJobs.length > 0) {
            setSelectedJobId(fetchedJobs[0].id)
          }
        } else if (fetchedJobs.length > 0) {
          setSelectedJobId(fetchedJobs[0].id)
        }
      })
      .finally(() => setLoadingData(false))
  }, [])

  // Sync applicationId with searchParams
  useEffect(() => {
    const pId = searchParams.get('applicationId') || searchParams.get('appId') || searchParams.get('id')
    setApplicationId(pId || null)
    if (pId && allApplications.length > 0) {
      const matchedApp = allApplications.find(a => String(a.id) === String(pId))
      if (matchedApp) setSelectedJobId(matchedApp.job_id)
    }
  }, [searchParams, allApplications])

  // Decision state
  const [recruiterNotes, setRecruiterNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [currentStatus, setCurrentStatus] = useState(null)
  const [toast, setToast] = useState(null)

  // ── Load report when applicationId changes ────────────────────────────────
  const fetchReport = useCallback(async () => {
    if (!applicationId) return
    try {
      setLoadingReport(true)
      setReportError(null)
      const res = await client.get(`/applications/${applicationId}/report`)
      setReport(res.data)
      setCurrentStatus(res.data.current_status)
      if (res.data.job_id) {
        setSelectedJobId(res.data.job_id)
      }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to load report. Please try again.'
      setReportError(msg)
    } finally {
      setLoadingReport(false)
    }
  }, [applicationId])

  useEffect(() => {
    if (applicationId) {
      fetchReport()
    } else {
      setReport(null)
      setReportError(null)
    }
  }, [applicationId, fetchReport])

  // Handlers for switching views and candidates
  const handleOpenReport = (appId) => {
    setApplicationId(String(appId))
    setSearchParams({ applicationId: String(appId) })
    const matchedApp = allApplications.find(a => String(a.id) === String(appId))
    if (matchedApp) setSelectedJobId(matchedApp.job_id)
  }

  const handleBackToGrid = () => {
    setApplicationId(null)
    setSearchParams({})
    setReport(null)
    setReportError(null)
  }

  // Active Job and Job Applicants
  const selectedJob = jobs.find(j => j.id === selectedJobId) || jobs[0]
  const currentJobApps = allApplications.filter(a => a.job_id === (report?.job_id || selectedJobId || selectedJob?.id))
  const currentJobAppIndex = currentJobApps.findIndex(a => String(a.id) === String(applicationId))

  const handlePrevCandidate = () => {
    if (currentJobAppIndex > 0) {
      handleOpenReport(currentJobApps[currentJobAppIndex - 1].id)
    }
  }

  const handleNextCandidate = () => {
    if (currentJobAppIndex < currentJobApps.length - 1) {
      handleOpenReport(currentJobApps[currentJobAppIndex + 1].id)
    }
  }

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
  const colors = useChartColors()

  // ── View 1: Job Profiles Grid & Respective Candidates (Hub Mode) ───────────
  if (!applicationId) {
    const selectedJobApplicants = allApplications.filter(a => a.job_id === (selectedJobId || selectedJob?.id))

    return (
      <div className="app-layout">
        <Sidebar role="recruiter" />
        <div className="main-content">
          <Topbar
            title="AI Candidate Reports Hub"
            subtitle="Explore job profiles and candidate evaluations"
          />

          <div className="page-content">
            {/* Page Header */}
            <div style={{ marginBottom: 28 }}>
              <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Sparkles size={24} style={{ color: '#FFFFFF' }} />
                Job Profiles & AI Reports
              </h1>
              <p className="page-subtitle">
                Select a job posting to view its applicants and inspect in-depth AI evaluations
              </p>
            </div>

            {loadingData ? (
              <div>
                <div className="grid-3" style={{ marginBottom: 28 }}>
                  {[1, 2, 3].map(i => <Skeleton key={i} height={180} />)}
                </div>
                <div className="grid-2">
                  {[1, 2].map(i => <Skeleton key={i} height={240} />)}
                </div>
              </div>
            ) : (
              <>
                {/* ── Section 1: Jobs Grid ─────────────────────────────────── */}
                <div style={{ marginBottom: 36 }}>
                  <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Briefcase size={18} color="#FFFFFF" />
                      Jobs Created by Recruiter
                      <span className="badge badge-brand" style={{ marginLeft: 6 }}>
                        {jobs.length} Positions
                      </span>
                    </h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Click any job card to view its candidate applicants
                    </span>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
                    gap: 16
                  }}>
                    {jobs.map(job => {
                      const isSelected = (selectedJobId || selectedJob?.id) === job.id
                      const jobApps = allApplications.filter(a => a.job_id === job.id)
                      const shortlistedCount = jobApps.filter(a => a.status === 'Shortlisted').length

                      return (
                        <div
                          key={job.id}
                          onClick={() => setSelectedJobId(job.id)}
                          className="glass-card"
                          style={{
                            padding: 22,
                            cursor: 'pointer',
                            borderRadius: 'var(--radius-lg)',
                            background: isSelected ? 'rgba(255, 255, 255, 0.12)' : 'rgba(16, 23, 38, 0.75)',
                            border: isSelected ? '2px solid #FFFFFF' : '1px solid rgba(255, 255, 255, 0.07)',
                            boxShadow: isSelected ? '0 0 24px rgba(255, 255, 255, 0.15)' : 'none',
                            transition: 'all 0.2s ease',
                            position: 'relative'
                          }}
                        >
                          {isSelected && (
                            <span style={{
                              position: 'absolute', top: 14, right: 14,
                              background: 'rgba(255, 255, 255, 0.15)', color: '#FFFFFF',
                              border: '1px solid rgba(255, 255, 255, 0.3)',
                              borderRadius: 12, fontSize: '0.72rem', padding: '2px 8px', fontWeight: 600
                            }}>
                              Selected Role ✓
                            </span>
                          )}

                          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            {job.experience || 'Full-time'}
                          </div>

                          <h4 style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '1.18rem',
                            fontWeight: 700,
                            color: '#FFFFFF',
                            marginBottom: 14,
                            paddingRight: isSelected ? 80 : 0
                          }}>
                            {job.title}
                          </h4>

                          {/* Stats Row */}
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr 1fr',
                            gap: 8,
                            padding: '10px 12px',
                            background: 'rgba(0, 0, 0, 0.25)',
                            borderRadius: 8,
                            marginBottom: 14
                          }}>
                            <div>
                              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Applicants</div>
                              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                                {jobApps.length}
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Avg Match</div>
                              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: (job.avg_match_score || 0) >= 70 ? '#10b981' : '#f59e0b' }}>
                                {job.avg_match_score || 0}%
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Shortlisted</div>
                              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF' }}>
                                {shortlistedCount}
                              </div>
                            </div>
                          </div>

                          {/* Required Skills tags */}
                          <div className="flex gap-1" style={{ flexWrap: 'wrap' }}>
                            {(job.required_skills || []).slice(0, 4).map(sk => (
                              <span key={sk} className="skill-tag" style={{ fontSize: '0.7rem', padding: '2px 7px' }}>{sk}</span>
                            ))}
                            {(job.required_skills?.length || 0) > 4 && (
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', padding: '2px 4px' }}>
                                +{job.required_skills.length - 4}
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* ── Section 2: Respective Job Seekers ─────────────────────── */}
                <div>
                  <div className="flex items-center justify-between" style={{ marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Users size={18} color="#FFFFFF" />
                        Applicants for: <span style={{ color: '#FFFFFF' }}>{selectedJob?.title || 'Selected Job'}</span>
                        <span className="badge badge-brand" style={{ marginLeft: 6 }}>
                          {selectedJobApplicants.length} {selectedJobApplicants.length === 1 ? 'Applicant' : 'Applicants'}
                        </span>
                      </h3>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                        Click "View Full AI Report" on any candidate to inspect comprehensive match analytics, resume evidence, and interview performance
                      </p>
                    </div>
                  </div>

                  {selectedJobApplicants.length === 0 ? (
                    <div className="glass-card" style={{ padding: '48px 24px', textAlign: 'center' }}>
                      <Users size={44} style={{ color: 'var(--text-muted)', margin: '0 auto 12px', opacity: 0.4 }} />
                      <h4 style={{ color: '#FFFFFF', marginBottom: 6 }}>No Applications Yet</h4>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', maxWidth: 440, margin: '0 auto' }}>
                        No job seekers have applied to this role yet. When candidates apply, their AI evaluation cards will appear here.
                      </p>
                    </div>
                  ) : (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                      gap: 16
                    }}>
                      {selectedJobApplicants.map(app => {
                        const score = Math.round(app.match_score || 0)
                        const initials = (app.candidate_name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                        return (
                          <div
                            key={app.id}
                            className="glass-card"
                            style={{
                              padding: 22,
                              borderRadius: 'var(--radius-lg)',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              gap: 16,
                              background: 'rgba(16, 23, 38, 0.75)',
                              border: '1px solid rgba(255, 255, 255, 0.08)',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseOver={e => {
                              e.currentTarget.style.borderColor = 'rgba(61, 110, 255, 0.4)'
                              e.currentTarget.style.transform = 'translateY(-2px)'
                            }}
                            onMouseOut={e => {
                              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
                              e.currentTarget.style.transform = 'translateY(0)'
                            }}
                          >
                            <div>
                              {/* Top Row: Avatar, Name, Email, Match Score */}
                              <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
                                <div className="flex items-center gap-3">
                                  <div style={{
                                    width: 48, height: 48, borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #FFFFFF, #CBD5E1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.05rem', fontWeight: 800, color: '#000000', flexShrink: 0
                                  }}>
                                    {initials}
                                  </div>
                                  <div>
                                    <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.08rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                                      {app.candidate_name}
                                    </h4>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                      <Mail size={12} /> {app.candidate_email}
                                    </div>
                                  </div>
                                </div>

                                {/* Match Score Badge */}
                                <div style={{
                                  textAlign: 'center',
                                  padding: '6px 12px',
                                  background: score >= 80 ? 'rgba(16, 185, 129, 0.12)' : (score >= 65 ? 'rgba(245, 158, 11, 0.12)' : 'rgba(61, 110, 255, 0.12)'),
                                  border: `1px solid ${score >= 80 ? 'rgba(16, 185, 129, 0.3)' : (score >= 65 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(61, 110, 255, 0.3)')}`,
                                  borderRadius: 10,
                                  flexShrink: 0
                                }}>
                                  <div style={{
                                    fontSize: '1.2rem',
                                    fontWeight: 800,
                                    fontFamily: 'var(--font-display)',
                                    color: score >= 80 ? '#10b981' : (score >= 65 ? '#f59e0b' : '#3d6eff'),
                                    lineHeight: 1
                                  }}>
                                    {score}%
                                  </div>
                                  <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: 2, fontWeight: 600 }}>
                                    MATCH
                                  </div>
                                </div>
                              </div>

                              {/* Details & Status */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                                <StatusBadge status={app.status} />
                                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                  {app.candidate_experience || '1-2 years'}
                                </span>
                                {app.candidate_education && (
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    · {app.candidate_education}
                                  </span>
                                )}
                              </div>

                              {/* Verified Skills */}
                              <div className="flex gap-1" style={{ flexWrap: 'wrap', marginBottom: 14 }}>
                                {(app.candidate_skills || []).slice(0, 4).map(sk => (
                                  <span key={sk} className="skill-tag" style={{ fontSize: '0.72rem', padding: '3px 8px' }}>
                                    {sk}
                                  </span>
                                ))}
                                {(app.candidate_skills?.length || 0) > 4 && (
                                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', padding: '3px 4px' }}>
                                    +{app.candidate_skills.length - 4}
                                  </span>
                                )}
                              </div>

                              {/* Notes */}
                              {app.notes && (
                                <p style={{
                                  fontSize: '0.78rem',
                                  color: 'var(--text-muted)',
                                  background: 'rgba(0, 0, 0, 0.2)',
                                  padding: '8px 10px',
                                  borderRadius: 6,
                                  margin: '0 0 14px 0',
                                  lineHeight: 1.4,
                                  fontStyle: 'italic'
                                }}>
                                  "{app.notes}"
                                </p>
                              )}
                            </div>

                            {/* View AI Report Action */}
                            <button
                              className="btn btn-primary"
                              style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8,
                                padding: '10px 16px',
                                fontWeight: 600,
                                fontSize: '0.86rem'
                              }}
                              onClick={() => handleOpenReport(app.id)}
                            >
                              <Sparkles size={16} />
                              <span>View Full AI Report</span>
                              <ArrowRight size={15} />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── View 2: Full AI Candidate Report Mode ──────────────────────────────────
  if (loadingReport || !report) {
    return (
      <div className="app-layout">
        <Sidebar role="recruiter" />
        <div className="main-content">
          <Topbar title="AI Candidate Report" subtitle="Loading evaluation report…" />
          <div className="page-content">
            <div style={{ marginBottom: 20 }}>
              <button className="btn btn-secondary btn-sm flex items-center gap-2" onClick={handleBackToGrid}>
                <ArrowLeft size={16} /> Back to Job Applicants
              </button>
            </div>
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

  if (reportError) {
    return (
      <div className="app-layout">
        <Sidebar role="recruiter" />
        <div className="main-content">
          <Topbar title="AI Candidate Report" subtitle="Error loading report" />
          <div className="page-content">
            <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
              <AlertTriangle size={44} style={{ color: '#f59e0b', margin: '0 auto 16px' }} />
              <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 12, color: '#FFFFFF' }}>Could Not Load Report</h3>
              <div style={{ color: 'var(--text-muted)', marginBottom: 24 }}>{reportError}</div>
              <button className="btn btn-primary" onClick={handleBackToGrid}>Back to Job Applicants</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Derived display values for Report Mode ────────────────────────────────
  const ms = report.match_score || {}
  const iv = report.interview_summary || {}
  const re = report.resume_evidence || {}

  const candidateInitials = (report.candidate_name || 'U')
    .split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  // Radar data
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

  return (
    <div className="app-layout">
      <Sidebar role="recruiter" />
      <div className="main-content">
        <Topbar
          title="AI Candidate Report"
          subtitle={`${report.candidate_name} · ${report.job_title}`}
        />

        <div className="page-content">

          {/* ── Breadcrumbs & Navigation Bar ───────────────────────────────── */}
          <div className="glass-card flex items-center justify-between" style={{
            padding: '14px 20px',
            marginBottom: 24,
            background: 'rgba(16, 23, 38, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 'var(--radius-lg)',
            flexWrap: 'wrap',
            gap: 12
          }}>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                className="btn btn-secondary btn-sm flex items-center gap-2"
                onClick={handleBackToGrid}
                style={{ fontWeight: 600 }}
              >
                <ArrowLeft size={16} />
                <span>Back to Job Applicants</span>
              </button>

              <div style={{ color: 'var(--text-muted)', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>Jobs</span>
                <span style={{ opacity: 0.4 }}>/</span>
                <strong style={{ color: '#FFFFFF' }}>{report.job_title}</strong>
                <span style={{ opacity: 0.4 }}>/</span>
                <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{report.candidate_name}</span>
              </div>
            </div>

            {/* Sibling navigation between applicants for this specific job */}
            {currentJobApps.length > 1 && (
              <div className="flex items-center gap-2">
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginRight: 4 }}>
                  Applicant {currentJobAppIndex + 1} of {currentJobApps.length} for this role
                </span>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handlePrevCandidate}
                  disabled={currentJobAppIndex <= 0}
                  style={{ opacity: currentJobAppIndex <= 0 ? 0.4 : 1, cursor: currentJobAppIndex <= 0 ? 'not-allowed' : 'pointer' }}
                  title="Previous Applicant for this Job"
                >
                  <ChevronLeft size={15} /> Prev
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handleNextCandidate}
                  disabled={currentJobAppIndex >= currentJobApps.length - 1}
                  style={{ opacity: currentJobAppIndex >= currentJobApps.length - 1 ? 0.4 : 1, cursor: currentJobAppIndex >= currentJobApps.length - 1 ? 'not-allowed' : 'pointer' }}
                  title="Next Applicant for this Job"
                >
                  Next <ChevronRight size={15} />
                </button>
              </div>
            )}
          </div>

          {/* ── Header Card ─────────────────────────────────────────────────── */}
          <div className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="candidate-avatar" style={{
                  width: 72, height: 72, fontSize: '1.6rem',
                  background: 'linear-gradient(135deg, #FFFFFF, #CBD5E1)',
                  color: '#000000', flexShrink: 0
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
                      background: activeTab === t ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                      color: activeTab === t ? '#FFFFFF' : 'var(--text-muted)',
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
                      <Radar dataKey="value" stroke="#FFFFFF" fill="#FFFFFF" fillOpacity={0.15} strokeWidth={2} />
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
                      {ms.components?.formula || ms.components_json?.formula || `Overall = 0.45 × Skills (${ms.skills_score?.toFixed(1)}%) + 0.20 × Experience (${ms.experience_score?.toFixed(1)}%) + 0.20 × Projects (${ms.projects_score?.toFixed(1)}%) + 0.15 × Requirements (${ms.coverage_score?.toFixed(1)}%)`}<br />
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
                      <span>Configured by Recruiter Match Formula — autonomous per-job weighting.</span>
                    </div>
                  </div>
                </div>

                {/* Component score bars */}
                {(() => {
                  const comp = ms.components || ms.components_json || {}
                  const weights = comp.weights || { skills: 0.45, experience: 0.20, projects: 0.20, coverage: 0.15 }
                  const sPct = Math.round((weights.skills ?? 0.45) * 100)
                  const ePct = Math.round((weights.experience ?? 0.20) * 100)
                  const pPct = Math.round((weights.projects ?? 0.20) * 100)
                  const rPct = Math.round(((weights.requirements ?? weights.coverage) ?? 0.15) * 100)

                  return (
                    <div className="grid-4" style={{ marginBottom: 24 }}>
                      {[
                        { label: `Skills (${sPct}%)`,       value: ms.skills_score || 0 },
                        { label: `Experience (${ePct}%)`,    value: ms.experience_score || 0 },
                        { label: `Projects (${pPct}%)`,      value: ms.projects_score || 0 },
                        { label: `Requirements (${rPct}%)`,  value: ms.coverage_score || 0 },
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
                  )
                })()}

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
                        { label: 'Word Count',    value: iv.latest_metrics.word_count || 0, icon: FileText, sub: 'words total', color: '#FFFFFF' },
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
                  background: 'rgba(255, 255, 255, 0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#FFFFFF'
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
