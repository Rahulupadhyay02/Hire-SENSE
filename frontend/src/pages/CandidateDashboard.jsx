import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import { ScoreRing, StatusBadge } from '../components/Charts'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'
import {
  FileText, UploadCloud, CheckCircle, AlertCircle, ExternalLink,
  Download, Edit3, Briefcase, GraduationCap, Code, Globe, Mail, Phone,
  MapPin, Clock, X, ChevronRight, Trash2, RefreshCw, Mic, Video, Loader
} from 'lucide-react'
import InterviewTranscriptModal from '../components/InterviewTranscriptModal'
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis
} from 'recharts'
import { useChartColors } from '../components/Charts'

const progressData = [
  { attempt: 'Att. 1', score: 64, fillerRate: 8.7, wpm: 130, structure: 60 },
  { attempt: 'Att. 2', score: 74, fillerRate: 5.2, wpm: 138, structure: 70 },
  { attempt: 'Att. 3', score: 83, fillerRate: 3.8, wpm: 144, structure: 80 },
  { attempt: 'Att. 4', score: 88, fillerRate: 2.9, wpm: 148, structure: 86 },
]

const radarData = [
  { area: 'Relevance', value: 88 },
  { area: 'Structure', value: 80 },
  { area: 'Fluency', value: 85 },
  { area: 'Technical', value: 90 },
  { area: 'Clarity', value: 82 },
]

const strengthsData = [
  { label: 'Technical accuracy', desc: 'Correct concepts explained in Python + FastAPI questions', icon: '✅' },
  { label: 'Answer relevance', desc: 'Stayed on topic in all 3 questions', icon: '✅' },
  { label: 'Improving filler rate', desc: 'Dropped from 8.7% → 2.9% across attempts', icon: '📈' },
]

const improvementsData = [
  {
    label: 'Filler words',
    current: '2.9%',
    target: '< 2%',
    action: 'Before answering, pause 1-2 seconds. Record yourself and count "um" / "uh".',
    icon: '💬'
  },
  {
    label: 'Answer structure',
    current: 'Medium',
    target: 'Strong',
    action: 'Use STAR format: Situation → Task → Action → Result. End with a measurable result.',
    icon: '📐'
  },
  {
    label: 'Speaking pace',
    current: '148 wpm',
    target: '130-145 wpm',
    action: 'Slightly slower delivery helps clarity. Aim for deliberate pausing between points.',
    icon: '⏱️'
  },
]

function ThemedTooltip({ active, payload, label }) {
  const { tooltipBg, tooltipBorder, tooltipText, tooltipSub } = useChartColors()
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: tooltipBg, border: `1px solid ${tooltipBorder}`,
      borderRadius: 10, padding: '10px 14px', backdropFilter: 'blur(20px)', fontSize: '0.82rem'
    }}>
      <div style={{ fontWeight: 700, color: tooltipText, marginBottom: 6 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2">
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
          <span style={{ color: tooltipSub }}>{p.name}:</span>
          <span style={{ fontWeight: 600, color: tooltipText }}>{p.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function CandidateDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('resume') // Default to Resume AI tab

  // Resume state
  const [resumeData, setResumeData] = useState(null)
  const [loadingResume, setLoadingResume] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

  // Edit Profile Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editPhone, setEditPhone] = useState('')
  const [editEducation, setEditEducation] = useState('')
  const [editExperienceYears, setEditExperienceYears] = useState('')
  const [editSkillsText, setEditSkillsText] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  // Phase 6 & 7: Interview & Communication Metrics state
  const [ivApplications, setIvApplications] = useState([])
  const [ivSelectedAppId, setIvSelectedAppId] = useState('')
  const [ivInterviews, setIvInterviews] = useState([])
  const [ivLoading, setIvLoading] = useState(false)
  const [ivUploading, setIvUploading] = useState(false)
  const [ivProgress, setIvProgress] = useState(0)
  const [ivError, setIvError] = useState('')
  const [ivSuccess, setIvSuccess] = useState('')
  const [ivTranscriptModal, setIvTranscriptModal] = useState(null)
  const ivFileRef = useRef(null)

  // Phase 7: Communication summary & metrics
  const [commSummary, setCommSummary] = useState(null)
  const [loadingCommSummary, setLoadingCommSummary] = useState(false)

  const tabs = [
    { key: 'resume', label: '📄 Resume & Profile' },
    { key: 'dashboard', label: '⬡ Applications' },
    { key: 'feedback', label: '💬 Feedback' },
    { key: 'progress', label: '📈 Progress' },
    { key: 'upload', label: '🎙️ Interview Upload' },
  ]

  // Fetch candidate's resume analysis on load
  useEffect(() => {
    async function fetchResume() {
      try {
        setLoadingResume(true)
        const res = await client.get('/candidates/me/resume')
        if (res.data) {
          setResumeData(res.data)
          initEditForm(res.data)
        }
      } catch (err) {
        // 404 is normal if candidate hasn't uploaded yet
        if (err.response?.status !== 404) {
          console.warn('Could not load resume:', err)
        }
      } finally {
        setLoadingResume(false)
      }
    }
    fetchResume()
  }, [])

  const initEditForm = (analysis) => {
    const ext = analysis?.extracted_json || {}
    setEditPhone(ext.phone || '')
    setEditEducation(
      ext.education?.length ? `${ext.education[0].degree || ''} - ${ext.education[0].institution || ''}`.trim(' -') : ''
    )
    setEditExperienceYears(ext.experience?.length ? `${ext.experience.length} roles documented` : '1-2 years')
    setEditSkillsText((ext.skills || []).join(', '))
  }

  // Load candidate's own applications on mount & when tabs switch
  useEffect(() => {
    client.get('/applications')
      .then(res => {
        const apps = res.data || []
        setIvApplications(apps)
        if (apps.length > 0 && !ivSelectedAppId) {
          setIvSelectedAppId(String(apps[0].id))
        }
      })
      .catch(() => setIvApplications([]))
  }, [])

  // Phase 6: Load interviews for selected application
  useEffect(() => {
    if (!ivSelectedAppId) return
    setIvLoading(true)
    setIvInterviews([])
    client.get(`/applications/${ivSelectedAppId}/interviews`)
      .then(res => setIvInterviews(res.data || []))
      .catch(() => setIvInterviews([]))
      .finally(() => setIvLoading(false))
  }, [ivSelectedAppId])

  // Phase 7: Fetch communication summary for selected application
  const fetchCommSummary = (appId) => {
    if (!appId) return
    setLoadingCommSummary(true)
    client.get(`/applications/${appId}/communication-summary`)
      .then(res => setCommSummary(res.data))
      .catch(() => setCommSummary(null))
      .finally(() => setLoadingCommSummary(false))
  }

  useEffect(() => {
    if (!ivSelectedAppId) return
    fetchCommSummary(ivSelectedAppId)
  }, [ivSelectedAppId])

  // Phase 6 & 7: Auto-poll processing interviews
  useEffect(() => {
    const processing = ivInterviews.filter(iv => ['queued','processing'].includes(iv.status))
    if (processing.length === 0) return
    const timer = setInterval(async () => {
      try {
        const updated = await Promise.all(
          processing.map(iv => client.get(`/interviews/${iv.id}`).then(r => r.data))
        )
        setIvInterviews(prev => {
          const map = Object.fromEntries(updated.map(u => [u.id, u]))
          const next = prev.map(iv => map[iv.id] ?? iv)
          // If any newly completed, reload commSummary
          const newlyCompleted = updated.some(u => u.status === 'completed')
          if (newlyCompleted && ivSelectedAppId) {
            fetchCommSummary(ivSelectedAppId)
          }
          return next
        })
      } catch { /* ignore */ }
    }, 3000)
    return () => clearInterval(timer)
  }, [ivInterviews, ivSelectedAppId])

  // Phase 6: Upload handler
  const handleIvUpload = async (file) => {
    if (!file || !ivSelectedAppId) return
    setIvError('')
    setIvSuccess('')
    setIvUploading(true)
    setIvProgress(0)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('application_id', ivSelectedAppId)
    try {
      const res = await client.post('/interviews/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: e => setIvProgress(Math.round((e.loaded * 100) / (e.total || 1)))
      })
      setIvInterviews(prev => [res.data, ...prev])
      setIvSuccess(`"${file.name}" uploaded! Processing in background...`)
      if (ivFileRef.current) ivFileRef.current.value = ''
    } catch (err) {
      setIvError(err.response?.data?.detail || 'Upload failed. Check file format and size.')
    } finally {
      setIvUploading(false)
      setIvProgress(0)
    }
  }

  // Phase 6: View transcript
  const handleIvTranscript = async (iv) => {
    if (iv.status !== 'completed') return
    try {
      const res = await client.get(`/interviews/${iv.id}/transcript`)
      setIvTranscriptModal(res.data)
    } catch { setIvTranscriptModal(iv) }
  }

  // Handle PDF file selection & upload
  const handleFileUpload = async (file) => {
    setErrorMsg('')
    setSuccessMsg('')

    if (!file) return

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Please upload a valid PDF file (.pdf).')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('File exceeds 10MB maximum size.')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    try {
      setUploading(true)
      setUploadProgress('Uploading PDF resume...')
      setTimeout(() => setUploadProgress('Extracting text & segmenting sections...'), 400)
      setTimeout(() => setUploadProgress('Normalizing skills with HireSense AI taxonomy...'), 900)

      const res = await client.post('/candidates/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      setResumeData(res.data)
      initEditForm(res.data)
      setSuccessMsg('Resume parsed and structured profile generated successfully!')
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to process resume. Please ensure it is a text-searchable PDF.'
      setErrorMsg(msg)
    } finally {
      setUploading(false)
      setUploadProgress('')
    }
  }

  // Handle Download Original PDF Evidence
  const handleDownloadPDF = async () => {
    if (!resumeData?.candidate_id) return
    try {
      const response = await client.get(`/candidates/${resumeData.candidate_id}/resume/download`, {
        responseType: 'blob'
      })
      const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = blobUrl
      link.setAttribute('download', resumeData.file_name || 'Resume.pdf')
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      alert('Could not download original PDF evidence: ' + (err.response?.data?.detail || err.message))
    }
  }

  // Save Candidate Profile Edits (Responsible AI: Candidate-in-the-loop)
  const handleSaveProfile = async (e) => {
    e.preventDefault()
    if (!resumeData?.candidate_id) return

    setSavingProfile(true)
    setErrorMsg('')

    try {
      const skillsArray = editSkillsText
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)

      const updatedPayload = {
        phone: editPhone,
        education: editEducation,
        experience_years: editExperienceYears,
        skills: skillsArray,
        profile_json: {
          ...resumeData.extracted_json,
          phone: editPhone,
          skills: skillsArray,
        }
      }

      await client.put(`/candidates/${resumeData.candidate_id}/profile`, updatedPayload)

      // Refresh local view
      setResumeData(prev => ({
        ...prev,
        extracted_json: {
          ...prev.extracted_json,
          phone: editPhone,
          skills: skillsArray
        }
      }))

      setIsEditModalOpen(false)
      setSuccessMsg('Profile updated and verified by candidate.')
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Could not update profile.')
    } finally {
      setSavingProfile(false)
    }
  }

  // Delete Resume handler
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deletingResume, setDeletingResume] = useState(false)

  const handleDeleteResume = async () => {
    try {
      setDeletingResume(true)
      setErrorMsg('')
      await client.delete('/candidates/resume')
      setResumeData(null)
      setIsDeleteModalOpen(false)
      setSuccessMsg('Resume and extracted candidate profile deleted successfully.')
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Failed to delete resume.')
    } finally {
      setDeletingResume(false)
    }
  }

  // Phase 7: Derived communication metrics
  const latestMetrics = commSummary?.latest_metrics
  const activeRadarData = latestMetrics?.radar?.length ? latestMetrics.radar : radarData
  const activeStrengths = latestMetrics?.strengths?.length
    ? latestMetrics.strengths.map(s => typeof s === 'string' ? { label: s, desc: 'Observable evidence from your interview recording', icon: '✨' } : s)
    : strengthsData
  const activeImprovements = latestMetrics?.improvements?.length ? latestMetrics.improvements : improvementsData
  const activeProgressData = commSummary?.trend?.length
    ? commSummary.trend.map((t, idx) => ({
        attempt: `Att. ${idx + 1}`,
        score: Math.round(t.score || 0),
        fillerRate: t.filler_rate != null ? Number(t.filler_rate) : 0,
        wpm: t.wpm || 0,
        structure: t.structure || 0,
        filename: t.filename || `interview_${t.interview_id}`,
        date: t.date ? new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : `Attempt ${idx + 1}`
      }))
    : progressData

  const selectedAppObj = ivApplications.find(a => String(a.id) === String(ivSelectedAppId))
  const candidateDisplayName = user?.name || resumeData?.extracted_json?.name || 'Candidate'
  const extracted = resumeData?.extracted_json || {}

  return (
    <div className="app-layout">
      <Sidebar role="candidate" />
      <div className="main-content">
        <Topbar
          title="Candidate Portal"
          subtitle="Manage your AI-parsed resume and application progress"
          role="candidate"
        />

        <div className="page-content">
          {/* Welcome header + quick action */}
          <div className="flex items-center justify-between" style={{ marginBottom: 24 }}>
            <div>
              <h1 className="page-title">Welcome back, {candidateDisplayName} 👋</h1>
              <p className="page-subtitle">
                {resumeData
                  ? 'Your profile is active and verified. Recruiters can view your job-ready evidence.'
                  : 'Upload your PDF resume to generate your structured candidate profile and unlock matching scores.'}
              </p>
            </div>
            <button
              className="btn btn-primary"
              id="btn-upload-resume-quick"
              onClick={() => {
                setActiveTab('resume')
                if (fileInputRef.current) fileInputRef.current.click()
              }}
            >
              <UploadCloud size={16} /> Upload New Resume
            </button>
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            accept=".pdf,application/pdf"
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0])
              }
            }}
          />

          {/* Tab Navigation */}
          <div className="flex gap-2" style={{ marginBottom: 24, overflowX: 'auto', paddingBottom: 4 }}>
            {tabs.map(t => (
              <button
                key={t.key}
                id={`tab-${t.key}`}
                className="btn btn-sm"
                onClick={() => setActiveTab(t.key)}
                style={{
                  borderRadius: 'var(--radius-full)',
                  border: activeTab === t.key ? '1px solid var(--border-brand)' : '1px solid var(--border-subtle)',
                  background: activeTab === t.key ? 'rgba(61,110,255,0.12)' : 'transparent',
                  color: activeTab === t.key ? 'var(--brand-400)' : 'var(--text-muted)',
                  fontWeight: 600,
                  whiteSpace: 'nowrap'
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Alert Messages */}
          {errorMsg && (
            <div className="flex items-center gap-2" style={{
              padding: '12px 16px', background: 'rgba(244,63,94,0.12)',
              border: '1px solid rgba(244,63,94,0.3)', borderRadius: 'var(--radius-md)',
              color: '#f43f5e', fontSize: '0.85rem', marginBottom: 20
            }}>
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2" style={{
              padding: '12px 16px', background: 'rgba(16,185,129,0.12)',
              border: '1px solid rgba(16,185,129,0.3)', borderRadius: 'var(--radius-md)',
              color: '#10b981', fontSize: '0.85rem', marginBottom: 20
            }}>
              <CheckCircle size={18} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ══════════════════════════════════════════
              TAB: RESUME & PROFILE (Phase 4 Core)
             ══════════════════════════════════════════ */}
          {activeTab === 'resume' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Drag & Drop Upload Zone */}
              <div
                id="resume-upload-zone"
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setDragOver(false)
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileUpload(e.dataTransfer.files[0])
                  }
                }}
                style={{
                  border: `2px dashed ${dragOver ? 'var(--brand-400)' : 'var(--border-brand)'}`,
                  background: dragOver ? 'rgba(61,110,255,0.1)' : 'rgba(61,110,255,0.03)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '36px 24px',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                  cursor: uploading ? 'wait' : 'pointer'
                }}
                onClick={() => {
                  if (!uploading && fileInputRef.current) {
                    fileInputRef.current.click()
                  }
                }}
              >
                {uploading ? (
                  <div style={{ padding: '16px 0' }}>
                    <div className="spinner" style={{ margin: '0 auto 16px', width: 36, height: 36 }} />
                    <div style={{ fontWeight: 600, color: 'var(--brand-400)', fontSize: '1rem', marginBottom: 6 }}>
                      {uploadProgress || 'Processing PDF...'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Applying section segmentation & skill taxonomy normalization
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{
                      width: 54, height: 54, borderRadius: '50%', background: 'rgba(61,110,255,0.12)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                      color: 'var(--brand-400)'
                    }}>
                      <UploadCloud size={28} />
                    </div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                      {resumeData ? 'Upload a Newer Resume PDF' : 'Upload your Resume PDF for AI Extraction'}
                    </h3>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', maxWidth: 480, margin: '0 auto 16px' }}>
                      Drag and drop your text-based PDF resume here, or click to browse. Max size 10MB.
                    </p>
                    <button
                      className="btn btn-secondary btn-sm"
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (fileInputRef.current) fileInputRef.current.click()
                      }}
                    >
                      Select PDF File
                    </button>
                  </div>
                )}
              </div>

              {/* Structured Profile Display */}
              {loadingResume ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div className="spinner" style={{ margin: '0 auto 12px' }} />
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading candidate profile data...</p>
                </div>
              ) : resumeData ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {/* Candidate Header Summary Card */}
                  <div className="glass-card" style={{ padding: 28, position: 'relative' }}>
                    <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
                      <div className="flex items-center gap-4">
                        <div className="avatar" style={{ width: 56, height: 56, fontSize: '1.3rem', background: 'var(--grad-brand)' }}>
                          {(extracted.name || 'C').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', margin: 0 }}>
                              {extracted.name || candidateDisplayName}
                            </h2>
                            <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>
                              ✓ AI Extracted & Verified
                            </span>
                          </div>
                          <div className="flex items-center gap-4" style={{ marginTop: 6, flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            {extracted.email && (
                              <span className="flex items-center gap-1">
                                <Mail size={14} /> {extracted.email}
                              </span>
                            )}
                            {extracted.phone && (
                              <span className="flex items-center gap-1">
                                <Phone size={14} /> {extracted.phone}
                              </span>
                            )}
                            {extracted.location && (
                              <span className="flex items-center gap-1">
                                <MapPin size={14} /> {extracted.location}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setIsEditModalOpen(true)}
                          title="Candidate in the loop: correct or update fields"
                        >
                          <Edit3 size={14} /> Edit Profile
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={handleDownloadPDF}
                          title="Verify against raw uploaded evidence"
                        >
                          <Download size={14} /> Download Evidence PDF
                        </button>
                      </div>
                    </div>

                    {/* Summary */}
                    {extracted.summary && (
                      <div style={{
                        padding: '14px 18px', background: 'var(--bg-glass)',
                        borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--brand-400)',
                        fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6
                      }}>
                        {extracted.summary}
                      </div>
                    )}

                    {/* Links */}
                    {extracted.links?.length > 0 && (
                      <div className="flex items-center gap-2" style={{ marginTop: 16, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>LINKS:</span>
                        {extracted.links.map((link, idx) => (
                          <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="badge badge-neutral flex items-center gap-1"
                            style={{ textDecoration: 'none', fontSize: '0.75rem', padding: '4px 10px' }}
                          >
                            <Globe size={12} /> {link.name}: {link.url.replace(/^https?:\/\//, '').slice(0, 24)}...
                            <ExternalLink size={10} />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Skills Card */}
                  <div className="glass-card" style={{ padding: 24 }}>
                    <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
                      <div className="flex items-center gap-2">
                        <Code size={18} style={{ color: 'var(--brand-400)' }} />
                        <h3 className="chart-title" style={{ margin: 0 }}>
                          Verified & Normalized Skills ({extracted.skills?.length || 0})
                        </h3>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Normalized via HireSense Skill Taxonomy
                      </span>
                    </div>

                    <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                      {(extracted.skills || []).map((skill, idx) => (
                        <span
                          key={idx}
                          className="skill-tag"
                          style={{
                            padding: '6px 12px', fontSize: '0.82rem', fontWeight: 600,
                            borderRadius: 'var(--radius-full)', background: 'rgba(61,110,255,0.08)',
                            borderColor: 'var(--border-brand)'
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                      {(!extracted.skills || extracted.skills.length === 0) && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No skills extracted yet.</p>
                      )}
                    </div>
                  </div>

                  {/* Two-column layout: Experience & Education */}
                  <div className="grid-2">
                    {/* Work Experience */}
                    <div className="glass-card" style={{ padding: 24 }}>
                      <div className="flex items-center gap-2" style={{ marginBottom: 20 }}>
                        <Briefcase size={18} style={{ color: '#10b981' }} />
                        <h3 className="chart-title" style={{ margin: 0 }}>Work Experience</h3>
                      </div>

                      {extracted.experience?.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                          {extracted.experience.map((exp, idx) => (
                            <div key={idx} style={{
                              paddingBottom: 16,
                              borderBottom: idx < extracted.experience.length - 1 ? '1px solid var(--border-subtle)' : 'none'
                            }}>
                              <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
                                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                                  {exp.role || 'Role'}
                                </div>
                                {exp.duration && (
                                  <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>
                                    <Clock size={11} style={{ marginRight: 4 }} /> {exp.duration}
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: '0.82rem', color: 'var(--brand-400)', fontWeight: 500, marginBottom: 8 }}>
                                {exp.company || 'Company'}
                              </div>
                              {exp.highlights?.length > 0 && (
                                <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                  {exp.highlights.map((hl, hIdx) => (
                                    <li key={hIdx} style={{ marginBottom: 4 }}>{hl}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No work history detected.</p>
                      )}
                    </div>

                    {/* Education & Projects */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                      {/* Education */}
                      <div className="glass-card" style={{ padding: 24 }}>
                        <div className="flex items-center gap-2" style={{ marginBottom: 16 }}>
                          <GraduationCap size={18} style={{ color: '#f59e0b' }} />
                          <h3 className="chart-title" style={{ margin: 0 }}>Education</h3>
                        </div>

                        {extracted.education?.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {extracted.education.map((edu, idx) => (
                              <div key={idx} style={{
                                padding: '12px 14px', background: 'var(--bg-card)',
                                borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)'
                              }}>
                                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                                  {edu.degree || 'Degree'}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                                  {edu.institution || 'University'}
                                </div>
                                {(edu.start_year || edu.end_year) && (
                                  <div style={{ fontSize: '0.75rem', color: 'var(--brand-400)', marginTop: 4 }}>
                                    {edu.start_year ? `${edu.start_year} – ` : ''}{edu.end_year || 'Present'}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No education records found.</p>
                        )}
                      </div>

                      {/* Projects */}
                      {extracted.projects?.length > 0 && (
                        <div className="glass-card" style={{ padding: 24 }}>
                          <div className="flex items-center gap-2" style={{ marginBottom: 16 }}>
                            <Code size={18} style={{ color: '#8b5cf6' }} />
                            <h3 className="chart-title" style={{ margin: 0 }}>Key Projects</h3>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {extracted.projects.map((proj, idx) => (
                              <div key={idx} style={{
                                padding: '12px 14px', background: 'var(--bg-card)',
                                borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)'
                              }}>
                                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.88rem', marginBottom: 4 }}>
                                  {proj.title}
                                </div>
                                {proj.description && (
                                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 8px', lineHeight: 1.4 }}>
                                    {proj.description}
                                  </p>
                                )}
                                {proj.tech_stack?.length > 0 && (
                                  <div className="flex gap-1" style={{ flexWrap: 'wrap' }}>
                                    {proj.tech_stack.map((ts, tIdx) => (
                                      <span key={tIdx} className="skill-tag" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                                        {ts}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Responsible AI Notice */}
                  <div style={{
                    padding: '16px 20px', background: 'rgba(61,110,255,0.06)',
                    border: '1px solid rgba(61,110,255,0.2)', borderRadius: 'var(--radius-lg)',
                    fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5
                  }}>
                    <strong style={{ color: 'var(--brand-400)' }}>🛡️ Responsible AI & Candidate-in-the-Loop</strong> —
                    All information above was parsed directly from your uploaded PDF without hallucinations. If any information
                    was missed or formatted incorrectly by the parser, use the <strong>"Edit Profile"</strong> button above to
                    update your verified data before matching against recruiter job postings.
                  </div>
                </div>
              ) : (
                <div className="glass-card" style={{ padding: '48px 24px', textAlign: 'center' }}>
                  <FileText size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
                  <h3 style={{ fontSize: '1.2rem', marginBottom: 8 }}>No Resume Uploaded Yet</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: 420, margin: '0 auto 20px' }}>
                    Upload your PDF resume above to extract your skills, experience, and education, and unlock automated job match scores.
                  </p>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      if (fileInputRef.current) fileInputRef.current.click()
                    }}
                  >
                    <UploadCloud size={15} /> Select PDF to Upload
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════
              TAB: APPLICATIONS (Original Dashboard)
             ══════════════════════════════════════════ */}
          {activeTab === 'dashboard' && (
            <>
              {/* Stats */}
              <div className="grid-4" style={{ marginBottom: 24 }}>
                {[
                  { label: 'Latest Score', value: '88%', icon: '🎯', color: '#10b981', sub: 'Interview 4 / Att. 4' },
                  { label: 'Applications', value: 3, icon: '📋', color: '#3d6eff', sub: '1 shortlisted' },
                  { label: 'Filler Rate', value: '2.9%', icon: '💬', color: '#f59e0b', sub: 'Was 8.7% — improving' },
                  { label: 'Practice Sessions', value: 4, icon: '🎙️', color: '#8b5cf6', sub: 'Total attempts' },
                ].map(s => (
                  <div key={s.label} className="stat-card">
                    <div style={{ fontSize: '1.4rem', marginBottom: 12 }}>{s.icon}</div>
                    <div className="stat-value" style={{ fontSize: '1.9rem', color: s.color }}>{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>{s.sub}</div>
                  </div>
                ))}
              </div>

              {/* Score ring + radar */}
              <div className="grid-2" style={{ marginBottom: 24 }}>
                <div className="chart-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 36, gap: 20 }}>
                  <ScoreRing score={88} size={160} strokeWidth={14} label="Latest Interview Score" />
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8 }}>Job: Python Developer — Active Application</div>
                    <StatusBadge status="Shortlisted" />
                  </div>
                </div>

                <div className="chart-card">
                  <div className="chart-header"><div className="chart-title">Communication Competency</div></div>
                  <ResponsiveContainer width="100%" height={220}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke={useChartColors().polarGrid} />
                      <PolarAngleAxis dataKey="area" tick={{ fill: useChartColors().labelFill, fontSize: 11 }} />
                      <Radar dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Applications */}
              <div className="glass-card" style={{ padding: 24 }}>
                <div className="chart-title" style={{ marginBottom: 16 }}>My Applications</div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Company / Job</th>
                      <th>Match Score</th>
                      <th>Interview</th>
                      <th>Status</th>
                      <th>Last Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { company: 'TechCorp India', job: 'Python Developer', match: 91, interview: '4 attempts', status: 'Shortlisted', date: '2h ago' },
                      { company: 'DataWorks', job: 'Data Analyst', match: 73, interview: '2 attempts', status: 'Reviewing', date: '3 days ago' },
                      { company: 'Startup Labs', job: 'Backend Dev', match: 68, interview: '1 attempt', status: 'Pending', date: '1 week ago' },
                    ].map((a, i) => (
                      <tr key={i}>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{a.company}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{a.job}</div>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="progress-bar" style={{ width: 80 }}>
                              <div className="progress-fill" style={{ width: `${a.match}%` }} />
                            </div>
                            <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{a.match}%</span>
                          </div>
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>{a.interview}</td>
                        <td><StatusBadge status={a.status} /></td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{a.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ══════════════════════════════════════════
              TAB: FEEDBACK (Phase 7 Communication AI)
             ══════════════════════════════════════════ */}
          {activeTab === 'feedback' && (
            <>
              {/* Application Selector Bar */}
              {ivApplications.length > 0 && (
                <div className="phase7-app-bar">
                  <div className="phase7-app-info">
                    <span className="phase7-app-label">Application:</span>
                    <select
                      className="phase7-app-select"
                      value={ivSelectedAppId}
                      onChange={e => setIvSelectedAppId(e.target.value)}
                    >
                      {ivApplications.map(app => (
                        <option key={app.id} value={app.id}>
                          {app.job_title} (App #{app.id})
                        </option>
                      ))}
                    </select>
                  </div>
                  {commSummary?.latest_communication_score != null && (
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Latest Overall Score:</span>
                      <span className="badge badge-success" style={{ fontSize: '0.88rem', fontWeight: 800 }}>
                        🎙️ {commSummary.latest_communication_score}%
                      </span>
                    </div>
                  )}
                </div>
              )}

              {loadingCommSummary ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <div className="spinner" style={{ margin: '0 auto 14px' }} />
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Loading communication evaluation...</p>
                </div>
              ) : !commSummary || commSummary.total_interviews === 0 ? (
                <div className="phase7-empty-card">
                  <div className="phase7-empty-icon">
                    <Mic size={28} />
                  </div>
                  <h3 className="phase7-empty-title">No Interview Evaluations Yet</h3>
                  <p className="phase7-empty-desc">
                    Submit your interview audio or video recording to receive instant, transparent communication feedback including speaking rate, filler words, STAR response structure, and personalized improvement tips.
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() => setActiveTab('upload')}
                  >
                    <UploadCloud size={16} /> Submit Interview Response
                  </button>
                </div>
              ) : (
                <>
                  {/* Phase 7 Quick Metric Cards */}
                  <div className="phase7-metrics-row">
                    <div className="phase7-metric-card" style={{ borderColor: 'rgba(16,185,129,0.35)' }}>
                      <div className="phase7-metric-top">
                        <span className="phase7-metric-icon">🎙️</span>
                        <span className="phase7-metric-badge" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                          Overall
                        </span>
                      </div>
                      <div className="phase7-metric-val" style={{ color: '#10b981' }}>
                        {commSummary.latest_communication_score ?? latestMetrics?.overall_score ?? 0}%
                      </div>
                      <div className="phase7-metric-lbl">Communication Score</div>
                      <div className="phase7-metric-sub">Weighted composite index</div>
                    </div>

                    <div className="phase7-metric-card">
                      <div className="phase7-metric-top">
                        <span className="phase7-metric-icon">⏱️</span>
                        <span className="phase7-metric-badge" style={{
                          background: (latestMetrics?.wpm ?? 0) >= 120 && (latestMetrics?.wpm ?? 0) <= 165 ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
                          color: (latestMetrics?.wpm ?? 0) >= 120 && (latestMetrics?.wpm ?? 0) <= 165 ? '#10b981' : '#f59e0b'
                        }}>
                          {(latestMetrics?.wpm ?? 0) >= 120 && (latestMetrics?.wpm ?? 0) <= 165 ? 'Optimal' : 'Needs tuning'}
                        </span>
                      </div>
                      <div className="phase7-metric-val">
                        {latestMetrics?.wpm ?? 0} <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>WPM</span>
                      </div>
                      <div className="phase7-metric-lbl">Speaking Pace</div>
                      <div className="phase7-metric-sub">Ideal range: 120–160 WPM</div>
                    </div>

                    <div className="phase7-metric-card">
                      <div className="phase7-metric-top">
                        <span className="phase7-metric-icon">💬</span>
                        <span className="phase7-metric-badge" style={{
                          background: (latestMetrics?.filler_word_rate ?? 0) < 3.5 ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
                          color: (latestMetrics?.filler_word_rate ?? 0) < 3.5 ? '#10b981' : '#f59e0b'
                        }}>
                          {(latestMetrics?.filler_word_rate ?? 0) < 3.5 ? 'Low' : 'Noticeable'}
                        </span>
                      </div>
                      <div className="phase7-metric-val" style={{ color: (latestMetrics?.filler_word_rate ?? 0) < 3.5 ? '#10b981' : '#f59e0b' }}>
                        {latestMetrics?.filler_word_rate ?? 0}%
                      </div>
                      <div className="phase7-metric-lbl">Filler Word Rate</div>
                      <div className="phase7-metric-sub">{latestMetrics?.filler_count ?? 0} total filler words found</div>
                    </div>

                    <div className="phase7-metric-card">
                      <div className="phase7-metric-top">
                        <span className="phase7-metric-icon">📐</span>
                        <span className="phase7-metric-badge" style={{ background: 'rgba(61,110,255,0.12)', color: 'var(--brand-400)' }}>
                          STAR
                        </span>
                      </div>
                      <div className="phase7-metric-val" style={{ color: 'var(--brand-400)' }}>
                        {latestMetrics?.structure_score ?? 0}<span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>/100</span>
                      </div>
                      <div className="phase7-metric-lbl">Answer Structure</div>
                      <div className="phase7-metric-sub">Context → Task → Action → Result</div>
                    </div>

                    <div className="phase7-metric-card">
                      <div className="phase7-metric-top">
                        <span className="phase7-metric-icon">🎯</span>
                        <span className="phase7-metric-badge" style={{ background: 'rgba(139,92,246,0.12)', color: '#8b5cf6' }}>
                          Skills
                        </span>
                      </div>
                      <div className="phase7-metric-val" style={{ color: '#8b5cf6' }}>
                        {latestMetrics?.relevance_score ?? 0}<span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>/100</span>
                      </div>
                      <div className="phase7-metric-lbl">Job Skill Relevance</div>
                      <div className="phase7-metric-sub">Alignment with required skills</div>
                    </div>
                  </div>

                  {/* Competency Radar + What Went Well */}
                  <div className="grid-2" style={{ marginBottom: 24 }}>
                    {/* Radar Chart */}
                    <div className="chart-card">
                      <div className="chart-header">
                        <div>
                          <div className="chart-title">Competency Radar</div>
                          <div className="chart-subtitle">5-dimensional communication breakdown</div>
                        </div>
                      </div>
                      <ResponsiveContainer width="100%" height={260}>
                        <RadarChart data={activeRadarData}>
                          <PolarGrid stroke={useChartColors().polarGrid} />
                          <PolarAngleAxis dataKey="area" tick={{ fill: useChartColors().labelFill, fontSize: 11 }} />
                          <Radar dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2.5} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* What Went Well */}
                    <div className="glass-card" style={{ padding: 24, borderColor: 'rgba(16,185,129,0.25)' }}>
                      <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
                        <div className="flex items-center gap-2">
                          <span style={{ fontSize: '1.2rem' }}>✨</span>
                          <div className="chart-title">What Went Well</div>
                        </div>
                        <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>
                          {activeStrengths.length} highlights
                        </span>
                      </div>
                      {activeStrengths.map((s, i) => (
                        <div key={i} style={{
                          padding: '14px 16px', marginBottom: 10,
                          background: 'rgba(16,185,129,0.06)',
                          border: '1px solid rgba(16,185,129,0.2)',
                          borderRadius: 'var(--radius-lg)'
                        }}>
                          <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
                            <span>{s.icon || '✨'}</span>
                            <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{s.label}</span>
                          </div>
                          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{s.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Areas to Improve */}
                  <div className="glass-card" style={{ padding: 24, borderColor: 'rgba(245,158,11,0.25)', marginBottom: 24 }}>
                    <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize: '1.2rem' }}>🎯</span>
                        <div className="chart-title">Areas to Improve & Coaching Tips</div>
                      </div>
                      <span className="badge badge-warning" style={{ fontSize: '0.72rem' }}>
                        {activeImprovements.length} action items
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                      {activeImprovements.map((item, i) => (
                        <div key={i} style={{
                          padding: '16px 18px',
                          background: 'rgba(245,158,11,0.06)',
                          border: '1px solid rgba(245,158,11,0.2)',
                          borderRadius: 'var(--radius-lg)'
                        }}>
                          <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                            <div className="flex items-center gap-2">
                              <span>{item.icon || '💡'}</span>
                              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{item.label}</span>
                            </div>
                            <div className="flex gap-1">
                              <span className="badge badge-warning" style={{ fontSize: '0.72rem' }}>Now: {item.current}</span>
                              <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>Goal: {item.target}</span>
                            </div>
                          </div>
                          <div style={{
                            padding: '10px 14px',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: 8, fontSize: '0.82rem', color: 'var(--text-muted)',
                            borderLeft: '3px solid rgba(245,158,11,0.5)',
                            lineHeight: 1.45
                          }}>
                            💡 {item.action}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Responsible AI notice */}
                  <div style={{
                    padding: '16px 20px',
                    background: 'rgba(61,110,255,0.06)',
                    border: '1px solid rgba(61,110,255,0.2)',
                    borderRadius: 'var(--radius-lg)',
                    fontSize: '0.84rem', color: 'var(--text-secondary)'
                  }}>
                    <strong style={{ color: 'var(--brand-400)' }}>ℹ️ About this feedback</strong> — All feedback is based strictly on observable speech metrics and text evidence extracted from your interview recording.
                    No personality or character assumptions are made. This data is designed for constructive practice and skill development.
                  </div>
                </>
              )}
            </>
          )}

          {/* ══════════════════════════════════════════
              TAB: PROGRESS (Phase 7 Longitudinal Trends)
             ══════════════════════════════════════════ */}
          {activeTab === 'progress' && (
            <>
              {/* Application Selector Bar */}
              {ivApplications.length > 0 && (
                <div className="phase7-app-bar">
                  <div className="phase7-app-info">
                    <span className="phase7-app-label">Application:</span>
                    <select
                      className="phase7-app-select"
                      value={ivSelectedAppId}
                      onChange={e => setIvSelectedAppId(e.target.value)}
                    >
                      {ivApplications.map(app => (
                        <option key={app.id} value={app.id}>
                          {app.job_title} (App #{app.id})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-3">
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      Attempts logged: <strong>{activeProgressData.length}</strong>
                    </span>
                    {activeProgressData.length >= 2 && (
                      <span className="badge badge-success" style={{ fontWeight: 800 }}>
                        {activeProgressData[activeProgressData.length - 1].score >= activeProgressData[0].score ? '↑' : '↓'}{' '}
                        {Math.abs(activeProgressData[activeProgressData.length - 1].score - activeProgressData[0].score)} pts overall
                      </span>
                    )}
                  </div>
                </div>
              )}

              {loadingCommSummary ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <div className="spinner" style={{ margin: '0 auto 14px' }} />
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Loading attempt history & progress...</p>
                </div>
              ) : !commSummary || commSummary.total_interviews === 0 ? (
                <div className="phase7-empty-card">
                  <div className="phase7-empty-icon">
                    <Clock size={28} />
                  </div>
                  <h3 className="phase7-empty-title">No Attempt History Yet</h3>
                  <p className="phase7-empty-desc">
                    Each time you upload an interview recording, HireSense tracks your improvement over time across speaking pace, filler rate reduction, and overall communication quality.
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() => setActiveTab('upload')}
                  >
                    <UploadCloud size={16} /> Submit Your First Recording
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid-2" style={{ marginBottom: 24 }}>
                    <div className="chart-card">
                      <div className="chart-header">
                        <div>
                          <div className="chart-title">Score Improvement</div>
                          <div className="chart-subtitle">Across {activeProgressData.length} interview attempts</div>
                        </div>
                        {activeProgressData.length >= 2 && (
                          <span className="badge badge-success">
                            {activeProgressData[activeProgressData.length - 1].score >= activeProgressData[0].score ? '↑ +' : '↓ -'}
                            {Math.abs(activeProgressData[activeProgressData.length - 1].score - activeProgressData[0].score)} pts
                          </span>
                        )}
                      </div>
                      <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={activeProgressData}>
                          <defs>
                            <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke={useChartColors().gridStroke} />
                          <XAxis dataKey="attempt" tick={{ fill: useChartColors().tickFill, fontSize: 11 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: useChartColors().tickFill, fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                          <Tooltip content={<ThemedTooltip />} />
                          <Area type="monotone" dataKey="score" name="Score" stroke="#10b981" fill="url(#scoreGrad)" strokeWidth={2.5} dot={{ fill: '#10b981', r: 5, strokeWidth: 0 }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="chart-card">
                      <div className="chart-header">
                        <div>
                          <div className="chart-title">Filler Rate Trend</div>
                          <div className="chart-subtitle">Lower is better · Continuous fluency tracking</div>
                        </div>
                        {activeProgressData.length >= 2 && (
                          <span className={`badge ${activeProgressData[activeProgressData.length - 1].fillerRate <= activeProgressData[0].fillerRate ? 'badge-success' : 'badge-warning'}`}>
                            {activeProgressData[activeProgressData.length - 1].fillerRate <= activeProgressData[0].fillerRate ? '↓' : '↑'}{' '}
                            {Math.abs(Number((activeProgressData[activeProgressData.length - 1].fillerRate - activeProgressData[0].fillerRate).toFixed(1)))}%
                          </span>
                        )}
                      </div>
                      <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={activeProgressData}>
                          <CartesianGrid strokeDasharray="3 3" stroke={useChartColors().gridStroke} />
                          <XAxis dataKey="attempt" tick={{ fill: useChartColors().tickFill, fontSize: 11 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: useChartColors().tickFill, fontSize: 11 }} axisLine={false} tickLine={false} />
                          <Tooltip content={<ThemedTooltip />} />
                          <Line type="monotone" dataKey="fillerRate" name="Filler %" stroke="#f59e0b" strokeWidth={2.5} dot={{ fill: '#f59e0b', r: 5, strokeWidth: 0 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Attempt history table */}
                  <div className="table-container">
                    <div style={{ padding: '20px 20px 0' }}>
                      <div className="chart-title">Attempt History</div>
                    </div>
                    <div style={{ padding: 20 }}>
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Attempt</th>
                            <th>Recorded</th>
                            <th>Overall Score</th>
                            <th>Filler Rate</th>
                            <th>Speaking Rate</th>
                            <th>Structure Score</th>
                            <th>Change</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activeProgressData.map((d, i) => (
                            <tr key={i}>
                              <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{d.attempt}</td>
                              <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{d.date}</td>
                              <td>
                                <div className="flex items-center gap-2">
                                  <div className="progress-bar" style={{ width: 80 }}>
                                    <div className="progress-fill" style={{
                                      width: `${d.score}%`,
                                      background: 'linear-gradient(90deg, #10b981, #06b6d4)'
                                    }} />
                                  </div>
                                  <span style={{ fontWeight: 700, color: '#10b981' }}>{d.score}%</span>
                                </div>
                              </td>
                              <td style={{ color: d.fillerRate < 4 ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
                                {d.fillerRate}%
                              </td>
                              <td>{d.wpm} wpm</td>
                              <td>{d.structure}%</td>
                              <td>
                                {i > 0 && (
                                  <span className={`stat-change ${d.score >= activeProgressData[i-1].score ? 'up' : 'down'}`}>
                                    {d.score >= activeProgressData[i-1].score ? '↑' : '↓'} {Math.abs(d.score - activeProgressData[i-1].score)} pts
                                  </span>
                                )}
                                {i === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>baseline</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {/* ══════════════════════════════════════════
              TAB: INTERVIEW UPLOAD (Phase 6)
             ══════════════════════════════════════════ */}
          {activeTab === 'upload' && (
            <div style={{ maxWidth: 680 }}>
              <div className="cd-interview-card">
                <div className="cd-interview-card-header">
                  <div className="cd-interview-card-icon">
                    <Mic size={20} />
                  </div>
                  <div>
                    <div className="cd-interview-card-title">Submit Interview Recording</div>
                    <div className="cd-interview-card-sub">
                      Upload your audio or video response — AI will generate a transcript automatically
                    </div>
                  </div>
                </div>

                {/* Application Selector */}
                {ivApplications.length === 0 ? (
                  <div className="iv-empty-state">
                    No active job applications found. Apply for a job first to submit an interview.
                  </div>
                ) : (
                  <>
                    <div className="form-group" style={{ marginBottom: 14 }}>
                      <label className="form-label" style={{ fontSize: '0.78rem' }}>
                        Select Job Application
                      </label>
                      <select
                        className="iv-app-select"
                        value={ivSelectedAppId}
                        onChange={e => setIvSelectedAppId(e.target.value)}
                      >
                        {ivApplications.map(app => (
                          <option key={app.id} value={app.id}>
                            {app.job_title} — {app.status}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Drag-drop Upload Zone */}
                    <div
                      className={`iv-upload-zone${ivUploading ? ' drag-over' : ''}`}
                      style={{ marginBottom: 14 }}
                      onDragOver={e => e.preventDefault()}
                      onDrop={e => {
                        e.preventDefault()
                        handleIvUpload(e.dataTransfer.files[0])
                      }}
                    >
                      <input
                        ref={ivFileRef}
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,audio/mpeg,audio/wav,audio/mp4,audio/ogg,audio/flac,audio/aac,.mp4,.webm,.mov,.avi,.mp3,.wav,.m4a,.ogg,.flac,.aac"
                        onChange={e => handleIvUpload(e.target.files[0])}
                        disabled={ivUploading}
                      />
                      <div className="iv-upload-icon">
                        {ivUploading ? <Loader size={28} className="iv-spin" /> : <Mic size={28} />}
                      </div>
                      <p className="iv-upload-label">
                        {ivUploading ? `Uploading... ${ivProgress}%` : 'Drop your interview file here or click to browse'}
                      </p>
                      <p className="iv-upload-hint">Video: MP4, WebM, MOV · Audio: MP3, WAV, M4A, FLAC · Max 500 MB</p>
                      <div className="iv-upload-types">
                        {['mp4','webm','mp3','wav','m4a','mov','flac'].map(t => (
                          <span key={t} className="iv-type-chip">{t}</span>
                        ))}
                      </div>
                      {ivUploading && (
                        <div className="iv-progress-bar-wrap">
                          <div className="iv-progress-bar-fill" style={{ width: `${ivProgress}%` }} />
                        </div>
                      )}
                    </div>

                    {ivSuccess && (
                      <div className="iv-upload-success">
                        <CheckCircle size={14} /> {ivSuccess}
                      </div>
                    )}
                    {ivError && (
                      <div className="iv-upload-error">
                        <AlertCircle size={14} /> {ivError}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* AI processing notice */}
              <div style={{
                padding: '12px 16px', marginBottom: 20,
                background: 'rgba(61,110,255,0.06)',
                border: '1px solid rgba(61,110,255,0.18)',
                borderRadius: 12,
                fontSize: '0.82rem', color: 'var(--text-secondary)'
              }}>
                🧠 <strong style={{ color: 'var(--brand-400)' }}>AI Processing</strong> — Speech-to-text
                transcription runs in the background. Status updates automatically every few seconds.
                <br />
                ⚠️ <strong>Note:</strong> AI transcripts may contain errors — always review before use.
              </div>

              {/* Interview History for selected application */}
              {ivSelectedAppId && (
                <div className="iv-section-card">
                  <div className="iv-section-card-header">
                    <FileText size={16} style={{ color: 'var(--brand-primary)' }} />
                    <span className="iv-section-card-title">Your Uploaded Interviews</span>
                    <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {ivInterviews.length} recordings
                    </span>
                  </div>

                  {ivLoading ? (
                    <div className="iv-empty-state">
                      <Loader size={18} className="iv-spin" style={{ margin: '0 auto 6px' }} />
                      Loading...
                    </div>
                  ) : ivInterviews.length === 0 ? (
                    <div className="iv-empty-state">
                      No recordings uploaded for this application yet.
                    </div>
                  ) : (
                    ivInterviews.map(iv => (
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
                            {iv.duration_seconds
                              ? ` · ${Math.floor(iv.duration_seconds/60)}:${String(Math.floor(iv.duration_seconds%60)).padStart(2,'0')}`
                              : ''}
                          </div>
                        </div>
                        <div className="iv-item-actions">
                          <span className={`iv-status-badge ${iv.status}`}>
                            {['queued','processing'].includes(iv.status)
                              ? <><Loader size={10} className="iv-spin" /> {iv.status}</>
                              : iv.status}
                          </span>
                          <button
                            className="iv-btn-view-transcript"
                            disabled={iv.status !== 'completed'}
                            onClick={() => handleIvTranscript(iv)}
                            title={iv.status !== 'completed' ? 'Available after processing completes' : 'View transcript'}
                          >
                            <FileText size={12} /> Transcript
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Phase 6: Transcript Modal */}
      {ivTranscriptModal && (
        <InterviewTranscriptModal
          interview={ivTranscriptModal}
          onClose={() => setIvTranscriptModal(null)}
        />
      )}

      {/* ══════════════════════════════════════════
          MODAL: Candidate-in-the-Loop Profile Correction
         ══════════════════════════════════════════ */}
      {isEditModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000, padding: 20
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: 540, padding: 32 }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
              <div className="flex items-center gap-2">
                <Edit3 size={18} style={{ color: 'var(--brand-400)' }} />
                <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>
                  Edit & Verify Candidate Profile
                </h3>
              </div>
              <button className="btn btn-icon btn-ghost" onClick={() => setIsEditModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 20 }}>
              Human-in-the-loop: Review and correct any details that were missed or misformatted by the AI resume parser.
            </p>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="+91 9876543210"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Education (Degree & Institution)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="B.Tech Computer Science - IIT Delhi"
                  value={editEducation}
                  onChange={(e) => setEditEducation(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Experience Bracket</label>
                <select
                  className="form-input form-select"
                  value={editExperienceYears}
                  onChange={(e) => setEditExperienceYears(e.target.value)}
                >
                  <option value="Fresher (< 1 year)">Fresher (&lt; 1 year)</option>
                  <option value="1-2 years">1-2 years</option>
                  <option value="3-5 years">3-5 years</option>
                  <option value="5+ years">5+ years</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Verified Skills (comma-separated)</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Python, FastAPI, Docker, Kubernetes, PostgreSQL, React"
                  value={editSkillsText}
                  onChange={(e) => setEditSkillsText(e.target.value)}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                  Add or remove skills to ensure accurate matching with job criteria.
                </span>
              </div>

              <div className="flex gap-2 justify-end" style={{ marginTop: 12 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={savingProfile}
                >
                  {savingProfile ? 'Saving Changes...' : 'Save & Verify Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
