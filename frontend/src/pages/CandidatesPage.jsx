import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import { StatusBadge, ScoreRing } from '../components/Charts'
import InterviewTranscriptModal from '../components/InterviewTranscriptModal'
import client from '../api/client'
import { Search, Filter, X, Check, XCircle, Clock, Eye, Briefcase, GraduationCap, Phone, Mail, Download, FileText, ExternalLink, Sparkles, Sliders, AlertCircle, CheckCircle, RefreshCw, ShieldCheck, Video, Mic, Trash2, PlayCircle, Loader, BarChart2 } from 'lucide-react'

export default function CandidatesPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const jobIdParam = searchParams.get('jobId')

  const [applications, setApplications] = useState([])
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedJobId, setSelectedJobId] = useState(jobIdParam || 'all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedApp, setSelectedApp] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)
  const [selectedAppResume, setSelectedAppResume] = useState(null)
  const [loadingResume, setLoadingResume] = useState(false)

  // Phase 5 Matching AI & Explainability State
  const [selectedAppMatch, setSelectedAppMatch] = useState(null)
  const [loadingMatch, setLoadingMatch] = useState(false)
  const [analyzingMatch, setAnalyzingMatch] = useState(false)
  const [showOverrideForm, setShowOverrideForm] = useState(false)
  const [overrideScore, setOverrideScore] = useState('')
  const [overrideReason, setOverrideReason] = useState('')
  const [submittingOverride, setSubmittingOverride] = useState(false)

  // Phase 6: Interview Upload & Transcript State
  const [interviews, setInterviews] = useState([])
  const [loadingInterviews, setLoadingInterviews] = useState(false)
  const [uploadingInterview, setUploadingInterview] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState('')
  const [transcriptModal, setTranscriptModal] = useState(null)  // interview object to show
  const [pollingIds, setPollingIds] = useState(new Set())       // IDs being polled
  const ivFileRef = useRef(null)

  useEffect(() => {
    if (selectedApp?.candidate_id) {
      setLoadingResume(true)
      setSelectedAppResume(null)
      client.get(`/candidates/${selectedApp.candidate_id}/resume`)
        .then(res => setSelectedAppResume(res.data))
        .catch(() => setSelectedAppResume(null))
        .finally(() => setLoadingResume(false))
    } else {
      setSelectedAppResume(null)
    }

    if (selectedApp?.id) {
      setLoadingMatch(true)
      setSelectedAppMatch(null)
      setShowOverrideForm(false)
      setOverrideScore(selectedApp.match_score ? String(selectedApp.match_score) : '')
      setOverrideReason('')
      client.get(`/applications/${selectedApp.id}/match`)
        .then(res => {
          setSelectedAppMatch(res.data)
          setOverrideScore(String(res.data.overall_score))
          if (res.data.override_reason) {
            setOverrideReason(res.data.override_reason)
          }
        })
        .catch(() => setSelectedAppMatch(null))
        .finally(() => setLoadingMatch(false))
    } else {
      setSelectedAppMatch(null)
    }
  }, [selectedApp])

  // Phase 6: Load interviews whenever selected application changes
  useEffect(() => {
    if (selectedApp?.id) {
      setInterviews([])
      setUploadError('')
      setUploadSuccess('')
      setLoadingInterviews(true)
      client.get(`/applications/${selectedApp.id}/interviews`)
        .then(res => setInterviews(res.data || []))
        .catch(() => setInterviews([]))
        .finally(() => setLoadingInterviews(false))
    } else {
      setInterviews([])
    }
  }, [selectedApp])

  // Phase 6: Poll processing interviews until completed/failed
  useEffect(() => {
    const processing = interviews.filter(iv => ['queued','processing'].includes(iv.status))
    if (processing.length === 0) return

    const timer = setInterval(async () => {
      try {
        const updated = await Promise.all(
          processing.map(iv => client.get(`/interviews/${iv.id}`).then(r => r.data))
        )
        setInterviews(prev => {
          const map = Object.fromEntries(updated.map(u => [u.id, u]))
          return prev.map(iv => map[iv.id] ?? iv)
        })
      } catch { /* ignore poll errors */ }
    }, 3000)

    return () => clearInterval(timer)
  }, [interviews])

  // Phase 6: Upload interview file
  const handleInterviewUpload = async (file) => {
    if (!file || !selectedApp?.id) return
    setUploadError('')
    setUploadSuccess('')
    setUploadingInterview(true)
    setUploadProgress(0)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('application_id', selectedApp.id)

    try {
      const res = await client.post('/interviews/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          setUploadProgress(Math.round((e.loaded * 100) / (e.total || 1)))
        }
      })
      setInterviews(prev => [res.data, ...prev])
      setUploadSuccess(`"${file.name}" uploaded — processing in background...`)
      if (ivFileRef.current) ivFileRef.current.value = ''
    } catch (err) {
      setUploadError(err.response?.data?.detail || 'Upload failed. Please try again.')
    } finally {
      setUploadingInterview(false)
      setUploadProgress(0)
    }
  }

  // Phase 6: Delete an interview
  const handleDeleteInterview = async (ivId) => {
    if (!window.confirm('Delete this interview recording? This cannot be undone.')) return
    try {
      await client.delete(`/interviews/${ivId}`)
      setInterviews(prev => prev.filter(iv => iv.id !== ivId))
    } catch (err) {
      alert('Could not delete interview: ' + (err.response?.data?.detail || err.message))
    }
  }

  // Phase 6: Open full transcript modal
  const handleViewTranscript = async (iv) => {
    if (iv.status !== 'completed') return
    try {
      const res = await client.get(`/interviews/${iv.id}/transcript`)
      setTranscriptModal(res.data)
    } catch {
      setTranscriptModal(iv)  // fallback to cached data
    }
  }

  const handleDownloadCandidatePDF = async (candidateId, fileName) => {
    try {
      const response = await client.get(`/candidates/${candidateId}/resume/download`, {
        responseType: 'blob'
      })
      const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = blobUrl
      link.setAttribute('download', fileName || 'Candidate_Resume.pdf')
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      alert('Could not download candidate PDF: ' + (err.response?.data?.detail || err.message))
    }
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      const [appsRes, jobsRes] = await Promise.all([
        client.get('/applications'),
        client.get('/jobs')
      ])
      setApplications(appsRes.data)
      setJobs(jobsRes.data)
    } catch (err) {
      console.error('Failed to load candidate applications:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleStatusChange = async (appId, newStatus) => {
    try {
      setUpdatingId(appId)
      const res = await client.patch(`/applications/${appId}/status`, { status: newStatus })
      setApplications(prev => prev.map(a => a.id === appId ? res.data : a))
      if (selectedApp && selectedApp.id === appId) {
        setSelectedApp(res.data)
      }
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.detail || err.message))
    } finally {
      setUpdatingId(null)
    }
  }

  const handleAnalyzeMatch = async (appId) => {
    try {
      setAnalyzingMatch(true)
      const res = await client.post(`/applications/${appId}/analyze`)
      setSelectedAppMatch(res.data)
      setOverrideScore(String(res.data.overall_score))
      setSelectedApp(prev => prev ? { ...prev, match_score: res.data.overall_score } : null)
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, match_score: res.data.overall_score } : a))
    } catch (err) {
      alert('Failed to analyze match: ' + (err.response?.data?.detail || err.message))
    } finally {
      setAnalyzingMatch(false)
    }
  }

  const handleSaveOverride = async (appId) => {
    if (!overrideReason.trim()) {
      alert('Please enter a documented reason for this manual score override.')
      return
    }
    const scoreVal = parseFloat(overrideScore)
    if (isNaN(scoreVal) || scoreVal < 0 || scoreVal > 100) {
      alert('Please enter a valid override score between 0 and 100.')
      return
    }
    try {
      setSubmittingOverride(true)
      const res = await client.post(`/applications/${appId}/match/override`, {
        override_score: scoreVal,
        reason: overrideReason.trim()
      })
      setSelectedAppMatch(res.data)
      setSelectedApp(prev => prev ? { ...prev, match_score: res.data.overall_score } : null)
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, match_score: res.data.overall_score } : a))
      setShowOverrideForm(false)
    } catch (err) {
      alert('Failed to save score override: ' + (err.response?.data?.detail || err.message))
    } finally {
      setSubmittingOverride(false)
    }
  }

  const filteredApps = applications.filter(app => {
    if (selectedJobId !== 'all' && String(app.job_id) !== String(selectedJobId)) {
      return false
    }
    if (statusFilter !== 'all' && app.status.toLowerCase() !== statusFilter.toLowerCase()) {
      return false
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const name = (app.candidate_name || '').toLowerCase()
      const job = (app.job_title || '').toLowerCase()
      const email = (app.candidate_email || '').toLowerCase()
      const skills = (app.candidate_skills || []).join(' ').toLowerCase()
      return name.includes(q) || job.includes(q) || email.includes(q) || skills.includes(q)
    }
    return true
  })

  // Metrics
  const totalCount = applications.length
  const shortlistedCount = applications.filter(a => a.status === 'Shortlisted').length
  const reviewingCount = applications.filter(a => a.status === 'Reviewing').length
  const pendingCount = applications.filter(a => a.status === 'Pending').length

  return (
    <div className="app-layout">
      <Sidebar role="recruiter" />
      <div className="main-content">
        <Topbar title="Candidate Review" subtitle="Inspect candidates, match scores, and hiring decisions" />

        <div className="page-content">
          {/* Header */}
          <div className="flex items-center justify-between" style={{ marginBottom: 24 }}>
            <div>
              <h1 className="page-title">Candidates & Applications</h1>
              <p className="page-subtitle">
                {totalCount} applicants · {shortlistedCount} shortlisted · {reviewingCount} reviewing
              </p>
            </div>
            {selectedJobId !== 'all' && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedJobId('all')}
              >
                Clear Job Filter
              </button>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid-4" style={{ marginBottom: 24 }}>
            <div className="stat-card">
              <div className="stat-value" style={{ color: '#3d6eff' }}>{totalCount}</div>
              <div className="stat-label">Total Applications</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: '#10b981' }}>{shortlistedCount}</div>
              <div className="stat-label">Shortlisted</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: '#06b6d4' }}>{reviewingCount}</div>
              <div className="stat-label">In Review</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: '#f59e0b' }}>{pendingCount}</div>
              <div className="stat-label">Pending Screen</div>
            </div>
          </div>

          {/* Controls Bar: Search + Job Filter + Status Filter */}
          <div className="glass-card" style={{ padding: '16px 20px', marginBottom: 24, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search */}
            <div className="topbar-search" style={{ flex: 1, minWidth: 220 }}>
              <Search size={16} color="var(--text-muted)" />
              <input
                placeholder="Search candidate by name, skill, or role..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Job Filter Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Job:</span>
              <select
                className="form-input"
                style={{ padding: '6px 12px', fontSize: '0.85rem', width: 'auto', background: 'var(--bg-glass)' }}
                value={selectedJobId}
                onChange={e => setSelectedJobId(e.target.value)}
              >
                <option value="all">All Jobs ({jobs.length})</option>
                {jobs.map(j => (
                  <option key={j.id} value={j.id}>{j.title}</option>
                ))}
              </select>
            </div>

            {/* Status Filter Buttons */}
            <div className="flex gap-1">
              {['all', 'Pending', 'Reviewing', 'Shortlisted', 'Rejected'].map(st => (
                <button
                  key={st}
                  className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setStatusFilter(st)}
                  style={{ textTransform: 'capitalize' }}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Candidates Table / List */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div className="spinner" style={{ margin: '0 auto 16px' }} />
              <p style={{ color: 'var(--text-muted)' }}>Loading applicants...</p>
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)' }}>No applications match the current filters.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Applied Job</th>
                    <th>Experience</th>
                    <th>Skills Match</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApps.map(app => {
                    const initials = (app.candidate_name || 'C')
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)

                    return (
                      <tr key={app.id}>
                        {/* Candidate Name & Email */}
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="avatar" style={{ width: 36, height: 36, fontSize: '0.8rem', background: 'var(--grad-brand)' }}>
                              {initials}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                {app.candidate_name}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {app.candidate_email}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Job Title */}
                        <td>
                          <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                            {app.job_title}
                          </div>
                        </td>

                        {/* Experience */}
                        <td>
                          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                            {app.candidate_experience || '1-2 years'}
                          </span>
                        </td>

                        {/* Skills / Match Score */}
                        <td>
                          <div className="flex items-center gap-2">
                            <span style={{
                              fontWeight: 700,
                              fontFamily: 'var(--font-display)',
                              color: (app.match_score >= 80) ? '#10b981' : (app.match_score >= 65 ? '#f59e0b' : '#3d6eff')
                            }}>
                              {app.match_score > 0 ? `${Math.round(app.match_score)}%` : 'Screening'}
                            </span>
                            <div className="flex gap-1" style={{ flexWrap: 'wrap', maxWidth: 220 }}>
                              {app.candidate_skills?.slice(0, 3).map(sk => (
                                <span key={sk} className="skill-tag" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>{sk}</span>
                              ))}
                              {(app.candidate_skills?.length || 0) > 3 && (
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                  +{app.candidate_skills.length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td>
                          <StatusBadge status={app.status} />
                        </td>

                        {/* Quick Decision Actions */}
                        <td>
                          <div className="flex items-center gap-1">
                            {/* Inspect */}
                            <button
                              className="btn btn-ghost btn-sm"
                              style={{ padding: '6px' }}
                              title="View Profile"
                              onClick={() => setSelectedApp(app)}
                            >
                              <Eye size={15} />
                            </button>

                            {/* Shortlist button */}
                            {app.status !== 'Shortlisted' && (
                              <button
                                className="btn btn-sm"
                                style={{
                                  padding: '4px 8px', fontSize: '0.72rem',
                                  background: 'rgba(16, 185, 129, 0.15)',
                                  color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)'
                                }}
                                disabled={updatingId === app.id}
                                onClick={() => handleStatusChange(app.id, 'Shortlisted')}
                              >
                                Shortlist
                              </button>
                            )}

                            {/* Reject button */}
                            {app.status !== 'Rejected' && (
                              <button
                                className="btn btn-sm"
                                style={{
                                  padding: '4px 8px', fontSize: '0.72rem',
                                  background: 'rgba(244, 63, 94, 0.15)',
                                  color: '#f43f5e', border: '1px solid rgba(244, 63, 94, 0.3)'
                                }}
                                disabled={updatingId === app.id}
                                onClick={() => handleStatusChange(app.id, 'Rejected')}
                              >
                                Reject
                              </button>
                            )}

                            {/* Hold / Reviewing */}
                            {app.status !== 'Reviewing' && (
                              <button
                                className="btn btn-ghost btn-sm"
                                style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                                disabled={updatingId === app.id}
                                onClick={() => handleStatusChange(app.id, 'Reviewing')}
                              >
                                Review
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Candidate Detail Modal Drawer */}
      {selectedApp && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 20
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto', padding: 32, position: 'relative' }}>
            {/* Header */}
            <div className="flex items-center justify-between" style={{ marginBottom: 24, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 16 }}>
              <div className="flex items-center gap-3">
                <div className="avatar" style={{ width: 48, height: 48, fontSize: '1.1rem', background: 'var(--grad-brand)' }}>
                  {selectedApp.candidate_name?.charAt(0) || 'C'}
                </div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', margin: 0 }}>{selectedApp.candidate_name}</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                    Applied for <strong style={{ color: 'var(--text-primary)' }}>{selectedApp.job_title}</strong>
                  </p>
                </div>
              </div>
              <button
                className="btn btn-icon btn-ghost"
                onClick={() => setSelectedApp(null)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Phase 5 — AI Match & Explainability Card */}
            <div style={{
              padding: '20px',
              background: 'linear-gradient(135deg, rgba(61,110,255,0.07) 0%, rgba(16,185,129,0.05) 100%)',
              border: '1px solid rgba(61,110,255,0.25)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 20
            }}>
              {/* Card Header */}
              <div className="flex items-center justify-between" style={{ marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                <div className="flex items-center gap-2">
                  <div style={{
                    width: 32, height: 32, borderRadius: '8px',
                    background: 'var(--grad-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
                  }}>
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Job–Candidate Matching AI
                    </h4>
                    <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                      Objective Multi-Factor Fit & Explainability
                    </span>
                  </div>
                </div>

                {/* Score and Quick Actions */}
                <div className="flex items-center gap-2">
                  {selectedAppMatch?.is_overridden && (
                    <span className="badge" style={{
                      background: 'rgba(245, 158, 11, 0.15)',
                      color: '#f59e0b',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      fontSize: '0.72rem',
                      fontWeight: 600
                    }}>
                      Overridden by Recruiter
                    </span>
                  )}
                  <div style={{
                    fontSize: '1.45rem',
                    fontWeight: 800,
                    fontFamily: 'var(--font-display)',
                    color: (selectedAppMatch?.overall_score || selectedApp.match_score) >= 80 ? '#10b981' : ((selectedAppMatch?.overall_score || selectedApp.match_score) >= 65 ? '#f59e0b' : '#3d6eff')
                  }}>
                    {selectedAppMatch ? `${Math.round(selectedAppMatch.overall_score)}%` : (selectedApp.match_score > 0 ? `${Math.round(selectedApp.match_score)}%` : 'Pending')}
                  </div>
                  <button
                    className="btn btn-secondary btn-sm flex items-center gap-1"
                    title="Re-run AI Matching"
                    disabled={analyzingMatch || loadingMatch}
                    onClick={() => handleAnalyzeMatch(selectedApp.id)}
                    style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                  >
                    <RefreshCw size={13} className={analyzingMatch ? 'spin' : ''} />
                    {analyzingMatch ? 'Analyzing...' : 'Re-analyze'}
                  </button>
                  <button
                    className="btn btn-ghost btn-sm flex items-center gap-1"
                    title="Manual Score Override"
                    onClick={() => setShowOverrideForm(!showOverrideForm)}
                    style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                  >
                    <Sliders size={13} />
                    Override
                  </button>
                </div>
              </div>

              {/* Recruiter Score Override Panel (Collapsible) */}
              {showOverrideForm && (
                <div style={{
                  padding: '14px 16px',
                  background: 'var(--bg-card)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: 16
                }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f59e0b', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Sliders size={14} /> Recruiter Manual Score Calibration
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
                    <div style={{ width: 140 }}>
                      <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                        New Score (0-100)%
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        className="form-input"
                        style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                        value={overrideScore}
                        onChange={e => setOverrideScore(e.target.value)}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 220 }}>
                      <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                        Documented Justification / Notes
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Demonstrated advanced systems design during live technical interview"
                        className="form-input"
                        style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                        value={overrideReason}
                        onChange={e => setOverrideReason(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: '0.75rem' }}
                      onClick={() => setShowOverrideForm(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: '0.75rem' }}
                      disabled={submittingOverride}
                      onClick={() => handleSaveOverride(selectedApp.id)}
                    >
                      {submittingOverride ? 'Saving...' : 'Save Override'}
                    </button>
                  </div>
                </div>
              )}

              {/* If overridden, show previous reason */}
              {selectedAppMatch?.is_overridden && selectedAppMatch?.override_reason && !showOverrideForm && (
                <div style={{
                  padding: '8px 12px',
                  background: 'rgba(245, 158, 11, 0.08)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.76rem',
                  color: 'var(--text-secondary)',
                  marginBottom: 14,
                  borderLeft: '3px solid #f59e0b'
                }}>
                  <strong>Recruiter Override Note:</strong> {selectedAppMatch.override_reason}
                </div>
              )}

              {/* Component Score Progress Bars (4 Factors) */}
              {loadingMatch ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div className="spinner" style={{ margin: '0 auto 8px', width: 20, height: 20 }} />
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Calculating explainable match scores...</p>
                </div>
              ) : selectedAppMatch ? (
                <div>
                  <div style={{
                    fontSize: '0.72rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--text-muted)',
                    marginBottom: 8,
                    fontWeight: 700
                  }}>
                    Scoring Components (0.45×Skills + 0.20×Exp + 0.20×Projects + 0.15×Coverage)
                  </div>

                  <div className="grid-2" style={{ gap: '10px 16px', marginBottom: 16 }}>
                    {/* Skills (45%) */}
                    <div>
                      <div className="flex justify-between" style={{ fontSize: '0.75rem', marginBottom: 4 }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Skills Match (45%)</span>
                        <strong style={{ color: 'var(--text-primary)' }}>{selectedAppMatch.skills_score}%</strong>
                      </div>
                      <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.min(100, selectedAppMatch.skills_score)}%`, background: 'var(--brand-400)', borderRadius: 3 }} />
                      </div>
                    </div>

                    {/* Experience (20%) */}
                    <div>
                      <div className="flex justify-between" style={{ fontSize: '0.75rem', marginBottom: 4 }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Experience Match (20%)</span>
                        <strong style={{ color: 'var(--text-primary)' }}>{selectedAppMatch.experience_score}%</strong>
                      </div>
                      <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.min(100, selectedAppMatch.experience_score)}%`, background: '#10b981', borderRadius: 3 }} />
                      </div>
                    </div>

                    {/* Projects (20%) */}
                    <div>
                      <div className="flex justify-between" style={{ fontSize: '0.75rem', marginBottom: 4 }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Project Evidence (20%)</span>
                        <strong style={{ color: 'var(--text-primary)' }}>{selectedAppMatch.projects_score}%</strong>
                      </div>
                      <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.min(100, selectedAppMatch.projects_score)}%`, background: '#8b5cf6', borderRadius: 3 }} />
                      </div>
                    </div>

                    {/* Coverage (15%) */}
                    <div>
                      <div className="flex justify-between" style={{ fontSize: '0.75rem', marginBottom: 4 }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Requirement Coverage (15%)</span>
                        <strong style={{ color: 'var(--text-primary)' }}>{selectedAppMatch.coverage_score}%</strong>
                      </div>
                      <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.min(100, selectedAppMatch.coverage_score)}%`, background: '#06b6d4', borderRadius: 3 }} />
                      </div>
                    </div>
                  </div>

                  {/* Itemized Explainability Matrix */}
                  {selectedAppMatch.components?.skills_matrix && (
                    <div style={{ marginBottom: 14 }}>
                      <div style={{
                        fontSize: '0.72rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'var(--text-muted)',
                        marginBottom: 8,
                        fontWeight: 700
                      }}>
                        Requirement Explainability Matrix
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {selectedAppMatch.components.skills_matrix.map((item, idx) => {
                          const isMatched = item.status === 'matched'
                          const isUnclear = item.status === 'unclear'
                          const bg = isMatched ? 'rgba(16,185,129,0.12)' : (isUnclear ? 'rgba(245,158,11,0.12)' : 'rgba(244,63,94,0.12)')
                          const border = isMatched ? 'rgba(16,185,129,0.3)' : (isUnclear ? 'rgba(245,158,11,0.3)' : 'rgba(244,63,94,0.3)')
                          const textCol = isMatched ? '#10b981' : (isUnclear ? '#f59e0b' : '#f43f5e')
                          const icon = isMatched ? <Check size={13} /> : (isUnclear ? <AlertCircle size={13} /> : <X size={13} />)

                          return (
                            <div key={idx} style={{
                              padding: '8px 12px',
                              background: bg,
                              border: `1px solid ${border}`,
                              borderRadius: 'var(--radius-sm)',
                              display: 'flex',
                              alignItems: 'flex-start',
                              justifyContent: 'space-between',
                              gap: 12
                            }}>
                              <div style={{ flex: 1 }}>
                                <div className="flex items-center gap-2" style={{ marginBottom: 2 }}>
                                  <span style={{ fontWeight: 700, fontSize: '0.8rem', color: textCol, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                    {icon} {item.skill}
                                  </span>
                                  <span style={{
                                    fontSize: '0.65rem',
                                    textTransform: 'uppercase',
                                    color: 'var(--text-muted)',
                                    background: '#f1f5f9',
                                    padding: '1px 5px',
                                    borderRadius: 3
                                  }}>
                                    {item.category}
                                  </span>
                                </div>
                                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                                  {item.evidence}
                                </div>
                              </div>
                              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: textCol, textTransform: 'capitalize' }}>
                                {item.status}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Natural Language AI Narrative */}
                  {selectedAppMatch.explanation && (
                    <div style={{
                      padding: '12px 14px',
                      background: 'var(--bg-card)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.78rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.5,
                      marginBottom: 12,
                      border: '1px solid var(--border-subtle)'
                    }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Sparkles size={13} style={{ color: 'var(--brand-400)' }} /> AI Evaluation Summary
                      </div>
                      <p style={{ margin: 0, whiteSpace: 'pre-line' }}>
                        {selectedAppMatch.explanation.split('Responsible AI Notice:')[0].trim()}
                      </p>
                    </div>
                  )}

                  {/* Responsible AI Notice */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 12px',
                    background: 'rgba(61,110,255,0.06)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.72rem',
                    color: 'var(--brand-300)',
                    border: '1px solid rgba(61,110,255,0.15)'
                  }}>
                    <ShieldCheck size={16} style={{ flexShrink: 0 }} />
                    <span>
                      <strong>Responsible AI Guardrails:</strong> Name, gender, age, contact, and photo are excluded from scoring.
                      This score provides objective decision support and is not an automated hiring outcome.
                    </span>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                    Match AI has not analyzed this application yet.
                  </p>
                  <button
                    className="btn btn-primary btn-sm flex items-center gap-1"
                    style={{ margin: '0 auto', fontSize: '0.75rem' }}
                    onClick={() => handleAnalyzeMatch(selectedApp.id)}
                  >
                    <Sparkles size={13} /> Run AI Matching Analysis
                  </button>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                  CONTACT INFORMATION
                </div>
                <div style={{ fontSize: '0.88rem', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <span className="flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                    <Mail size={14} /> {selectedApp.candidate_email || 'No email provided'}
                  </span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                  EDUCATION & EXPERIENCE
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
                  {selectedApp.candidate_education || 'Degree in Computer Science'} · {selectedApp.candidate_experience || '1-2 years experience'}
                </p>
              </div>

              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>
                  VERIFIED SKILLS
                </div>
                <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                  {selectedApp.candidate_skills?.map(s => (
                    <span key={s} className="skill-tag">{s}</span>
                  ))}
                </div>
              </div>

              {/* Resume AI Evidence Card */}
              <div style={{
                padding: '16px 18px',
                background: selectedAppResume ? 'rgba(61,110,255,0.06)' : 'var(--bg-card)',
                border: `1px solid ${selectedAppResume ? 'rgba(61,110,255,0.25)' : 'var(--border-subtle)'}`,
                borderRadius: 'var(--radius-md)'
              }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                  <div className="flex items-center gap-2">
                    <FileText size={16} style={{ color: 'var(--brand-400)' }} />
                    <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Resume Evidence & AI Extraction
                    </span>
                  </div>
                  {selectedAppResume && (
                    <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                      {selectedAppResume.model_version}
                    </span>
                  )}
                </div>

                {loadingResume ? (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Checking uploaded resume evidence...</p>
                ) : selectedAppResume ? (
                  <div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
                      Evidence File: <strong style={{ color: 'var(--text-primary)' }}>{selectedAppResume.file_name}</strong>
                    </p>
                    {selectedAppResume.extracted_json?.summary && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: 12, lineHeight: 1.4 }}>
                        "{selectedAppResume.extracted_json.summary.slice(0, 180)}..."
                      </p>
                    )}
                    <button
                      className="btn btn-secondary btn-sm flex items-center gap-1"
                      onClick={() => handleDownloadCandidatePDF(selectedApp.candidate_id, selectedAppResume.file_name)}
                    >
                      <Download size={13} /> Download Original PDF Evidence
                    </button>
                  </div>
                ) : (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                    No PDF resume uploaded yet for this candidate.
                  </p>
                )}
              </div>

              {selectedApp.notes && (
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                    RECRUITER EVALUATION NOTES
                  </div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', background: 'var(--bg-card)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', margin: 0 }}>
                    {selectedApp.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Decision Bar */}
            <div style={{
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: 20, display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap'
            }}>
              {/* Phase 8: Navigate to unified report */}
              <button
                id={`view-report-${selectedApp?.id}`}
                className="btn btn-sm"
                style={{
                  marginRight: 'auto',
                  background: 'rgba(61,110,255,0.12)',
                  border: '1px solid rgba(61,110,255,0.35)',
                  color: 'var(--brand-400)',
                  fontWeight: 600,
                }}
                onClick={() => navigate(`/recruiter/report?applicationId=${selectedApp.id}`)}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <BarChart2 size={15} />
                  <span>View Full AI Report</span>
                </span>
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleStatusChange(selectedApp.id, 'Hold')}
              >
                Put On Hold
              </button>
              <button
                className="btn btn-sm"
                style={{ background: '#f43f5e', color: 'white' }}
                onClick={() => handleStatusChange(selectedApp.id, 'Rejected')}
              >
                Reject Candidate
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => handleStatusChange(selectedApp.id, 'Shortlisted')}
              >
                Shortlist Candidate
              </button>
            </div>


            {/* ── Phase 6: Interview Panel ─────────────────────────── */}
            <div className="iv-section-card" style={{ marginTop: 24 }}>
              <div className="iv-section-card-header">
                <Video size={16} style={{ color: 'var(--brand-primary)' }} />
                <span className="iv-section-card-title">Interview Recordings</span>
                <span style={{
                  marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--text-muted)',
                  fontWeight: 500
                }}>
                  {interviews.length} uploaded
                </span>
              </div>

              {/* Upload Zone */}
              <div
                className={`iv-upload-zone${uploadingInterview ? ' drag-over' : ''}`}
                style={{ marginBottom: 14 }}
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  e.preventDefault()
                  const file = e.dataTransfer.files[0]
                  if (file) handleInterviewUpload(file)
                }}
              >
                <input
                  ref={ivFileRef}
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,audio/mpeg,audio/wav,audio/mp4,audio/ogg,audio/flac,audio/aac,.mp4,.webm,.mov,.avi,.mp3,.wav,.m4a,.ogg,.flac,.aac"
                  onChange={e => handleInterviewUpload(e.target.files[0])}
                  disabled={uploadingInterview}
                />
                <div className="iv-upload-icon">
                  {uploadingInterview
                    ? <Loader size={28} className="iv-spin" />
                    : <Mic size={28} />
                  }
                </div>
                <p className="iv-upload-label">
                  {uploadingInterview ? 'Uploading...' : 'Drop interview file here or click to browse'}
                </p>
                <p className="iv-upload-hint">Video: MP4, WebM, MOV · Audio: MP3, WAV, M4A · Max 500 MB</p>
                <div className="iv-upload-types">
                  {['mp4','webm','mp3','wav','m4a','mov'].map(t => (
                    <span key={t} className="iv-type-chip">{t}</span>
                  ))}
                </div>
                {uploadingInterview && (
                  <div className="iv-progress-bar-wrap">
                    <div className="iv-progress-bar-fill" style={{ width: `${uploadProgress}%` }} />
                  </div>
                )}
              </div>

              {/* Upload feedback */}
              {uploadSuccess && (
                <div className="iv-upload-success">
                  <CheckCircle size={14} /> {uploadSuccess}
                </div>
              )}
              {uploadError && (
                <div className="iv-upload-error">
                  <AlertCircle size={14} /> {uploadError}
                </div>
              )}

              {/* Interview list */}
              {loadingInterviews ? (
                <div className="iv-empty-state">
                  <Loader size={18} className="iv-spin" style={{ margin: '0 auto 6px' }} />
                  Loading interviews...
                </div>
              ) : interviews.length === 0 ? (
                <div className="iv-empty-state">
                  No interviews uploaded yet for this application.
                </div>
              ) : (
                interviews.map(iv => (
                  <div key={iv.id} className="iv-item">
                    <div className="iv-item-icon">
                      {iv.file_type?.startsWith('video/') ? <Video size={16} /> : <Mic size={16} />}
                    </div>
                    <div className="iv-item-info">
                      <div className="iv-item-name" title={iv.original_filename}>
                        {iv.original_filename}
                      </div>
                      <div className="iv-item-meta">
                        {(iv.file_size_bytes / (1024*1024)).toFixed(1)} MB
                        {iv.duration_seconds ? ` · ${Math.floor(iv.duration_seconds/60)}:${String(Math.floor(iv.duration_seconds%60)).padStart(2,'0')}` : ''}
                      </div>
                    </div>
                    <div className="iv-item-actions">
                      {iv.status === 'completed' && iv.communication_score != null && (
                        <span className="iv-comm-badge" title="AI Communication Quality Score (Phase 7)" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Mic size={12} />
                          <span>{iv.communication_score}%</span>
                        </span>
                      )}
                      <span className={`iv-status-badge ${iv.status}`}>
                        {iv.status === 'processing' || iv.status === 'queued'
                          ? <><Loader size={10} className="iv-spin" /> {iv.status}</>
                          : iv.status}
                      </span>
                      <button
                        className="iv-btn-view-transcript"
                        disabled={iv.status !== 'completed'}
                        onClick={() => handleViewTranscript(iv)}
                        title={iv.status !== 'completed' ? 'Available when processing completes' : 'View transcript'}
                      >
                        <FileText size={12} /> Transcript
                      </button>
                      <button
                        className="iv-btn-delete"
                        onClick={() => handleDeleteInterview(iv.id)}
                        title="Delete interview"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      )}

      {/* Phase 6: Transcript Viewer Modal */}
      {transcriptModal && (
        <InterviewTranscriptModal
          interview={transcriptModal}
          onClose={() => setTranscriptModal(null)}
        />
      )}
    </div>
  )
}
