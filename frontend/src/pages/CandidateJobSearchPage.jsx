import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'
import {
  Search, Briefcase, Building2, MapPin, Clock, CheckCircle2,
  Sparkles, X, Filter, ChevronRight, Check, AlertCircle,
  FileText, User, Mail, Phone, GraduationCap, Award, Send,
  ArrowRight, ShieldCheck, RefreshCw, Star
} from 'lucide-react'

export default function CandidateJobSearchPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [jobs, setJobs] = useState([])
  const [myApplications, setMyApplications] = useState([])
  const [candidateProfile, setCandidateProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedExperience, setSelectedExperience] = useState('all')
  const [matchMySkillsOnly, setMatchMySkillsOnly] = useState(false)
  const [expandedJobId, setExpandedJobId] = useState(null)

  // Application Modal state
  const [applyingJob, setApplyingJob] = useState(null)
  const [applicantName, setApplicantName] = useState('')
  const [applicantEmail, setApplicantEmail] = useState('')
  const [applicantPhone, setApplicantPhone] = useState('')
  const [applicantExp, setApplicantExp] = useState('')
  const [applicantEdu, setApplicantEdu] = useState('')
  const [applicantSkills, setApplicantSkills] = useState([])
  const [newSkillInput, setNewSkillInput] = useState('')
  const [applicantNotes, setApplicantNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [applyError, setApplyError] = useState('')

  // Success Confirmation state
  const [submissionSuccess, setSubmissionSuccess] = useState(null)

  // Load jobs, existing applications, and candidate profile
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [jobsRes, appsRes, resumeRes] = await Promise.all([
        client.get('/jobs').catch(() => ({ data: [] })),
        client.get('/applications').catch(() => ({ data: [] })),
        client.get('/resume/me').catch(() => ({ data: null }))
      ])

      const activeJobs = (jobsRes.data || []).filter(j => j.status === 'active' || !j.status)
      setJobs(activeJobs)
      setMyApplications(appsRes.data || [])

      // Candidate profile from resume or user
      const resume = resumeRes.data
      const skills = resume?.extracted_json?.skills || (user?.skills) || ['Python', 'FastAPI', 'React', 'SQL', 'Git']
      const exp = resume?.extracted_json?.experience_years || '2 years'
      const edu = resume?.extracted_json?.education?.[0]?.degree || 'B.Tech Computer Science'

      setCandidateProfile({
        name: user?.name || 'Candidate',
        email: user?.email || '',
        phone: user?.phone || '+91 9876543210',
        skills,
        experience: exp,
        education: edu,
        resumeFileName: resume?.file_name || null
      })
    } catch (err) {
      console.warn('Error loading candidate job search data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Open apply modal and pre-fill details
  const handleOpenApply = (job) => {
    setApplyingJob(job)
    setApplyError('')
    setApplicantName(user?.name || candidateProfile?.name || '')
    setApplicantEmail(user?.email || candidateProfile?.email || '')
    setApplicantPhone(candidateProfile?.phone || '+91 9876543210')
    setApplicantExp(candidateProfile?.experience || job.experience || '2 years')
    setApplicantEdu(candidateProfile?.education || 'B.Tech Computer Science')
    setApplicantSkills([...(candidateProfile?.skills || [])])
    setApplicantNotes(`I am excited to apply for the ${job.title} position at ${job.company_name}. My background in ${job.required_skills?.slice(0, 2).join(' and ')} aligns closely with your team's objectives.`)
  }

  const handleAddSkill = () => {
    if (newSkillInput.trim() && !applicantSkills.includes(newSkillInput.trim())) {
      setApplicantSkills([...applicantSkills, newSkillInput.trim()])
      setNewSkillInput('')
    }
  }

  const handleRemoveSkill = (skillToRemove) => {
    setApplicantSkills(applicantSkills.filter(s => s !== skillToRemove))
  }

  // Submit application with real-time deep AI analysis
  const handleSubmitApplication = async (e) => {
    e.preventDefault()
    if (!applyingJob) return

    try {
      setSubmitting(true)
      setApplyError('')

      const payload = {
        job_id: applyingJob.id,
        notes: applicantNotes || null,
        skills: applicantSkills,
        experience_years: applicantExp,
        education: applicantEdu,
        phone: applicantPhone
      }

      const res = await client.post('/applications', payload)
      const newApp = res.data

      // Update local applications list
      setMyApplications(prev => [newApp, ...prev])

      // Set submission success state for celebration modal
      setSubmissionSuccess({
        job: applyingJob,
        application: newApp,
        score: Math.round(newApp.match_score || 85)
      })

      setApplyingJob(null)
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to submit application. Please try again.'
      setApplyError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  // Skill matching helper
  const candidateSkillsLower = (candidateProfile?.skills || []).map(s => s.toLowerCase())

  const calculateSkillMatch = (jobSkills = []) => {
    if (!jobSkills.length) return { matched: 0, total: 0, percentage: 0, matchedSkills: [] }
    const matchedSkills = jobSkills.filter(js =>
      candidateSkillsLower.some(cs => cs.includes(js.toLowerCase()) || js.toLowerCase().includes(cs))
    )
    const percentage = Math.round((matchedSkills.length / jobSkills.length) * 100)
    return {
      matched: matchedSkills.length,
      total: jobSkills.length,
      percentage,
      matchedSkills
    }
  }

  // Filtered jobs
  const filteredJobs = jobs.filter(job => {
    // Search query matches title or company or skills
    const q = searchQuery.toLowerCase().trim()
    const matchesQuery = !q ||
      job.title?.toLowerCase().includes(q) ||
      job.company_name?.toLowerCase().includes(q) ||
      job.description?.toLowerCase().includes(q) ||
      (job.required_skills || []).some(s => s.toLowerCase().includes(q))

    // Experience filter
    let matchesExp = true
    if (selectedExperience === 'entry') matchesExp = (job.experience || '').includes('0-1') || (job.experience || '').includes('1')
    else if (selectedExperience === 'mid') matchesExp = (job.experience || '').includes('2') || (job.experience || '').includes('3')
    else if (selectedExperience === 'senior') matchesExp = (job.experience || '').includes('4') || (job.experience || '').includes('5')

    // Skill matching filter
    const skillMatch = calculateSkillMatch(job.required_skills)
    const matchesSkills = !matchMySkillsOnly || skillMatch.matched > 0

    return matchesQuery && matchesExp && matchesSkills
  })

  return (
    <div className="app-layout">
      <Sidebar role="candidate" />
      <div className="main-content">
        <Topbar
          title="Find Jobs"
          subtitle="Explore open roles and apply with AI match intelligence"
        />

        <div className="page-content">

          {/* ── Page Header ─────────────────────────────────────────────────── */}
          <div style={{ marginBottom: 28 }}>
            <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Briefcase size={26} style={{ color: '#FFFFFF' }} />
                  Discover Verified Job Postings
                </h1>
                <p className="page-subtitle">
                  Browse open positions posted by recruiters. Apply with your complete profile and receive instant deep AI match scoring.
                </p>
              </div>

              {candidateProfile?.skills?.length > 0 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 14px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: 20
                }}>
                  <Sparkles size={15} color="#FFFFFF" />
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                    Matching against your {candidateProfile.skills.length} verified skills
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ── Search & Filter Controls ───────────────────────────────────── */}
          <div className="glass-card" style={{
            padding: '18px 24px',
            marginBottom: 28,
            background: 'rgba(16, 23, 38, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 'var(--radius-lg)'
          }}>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Search Bar */}
              <div style={{
                flex: 1, minWidth: 280,
                position: 'relative',
                display: 'flex', alignItems: 'center'
              }}>
                <Search size={18} style={{ position: 'absolute', left: 14, color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search by job title, company (e.g. NeuralStack, DeepVision), or skills..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 42px',
                    background: '#0D111A',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: 10,
                    color: '#FFFFFF',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    style={{ position: 'absolute', right: 12, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Experience Filter */}
              <select
                value={selectedExperience}
                onChange={e => setSelectedExperience(e.target.value)}
                style={{
                  padding: '12px 16px',
                  background: '#0D111A',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: 10,
                  color: '#FFFFFF',
                  fontSize: '0.88rem',
                  outline: 'none',
                  cursor: 'pointer',
                  minWidth: 160
                }}
              >
                <option value="all">All Experience</option>
                <option value="entry">Entry Level (0-1 yrs)</option>
                <option value="mid">Mid Level (2-3 yrs)</option>
                <option value="senior">Senior (4+ yrs)</option>
              </select>

              {/* Match My Skills Toggle Button */}
              <button
                className="btn btn-sm"
                onClick={() => setMatchMySkillsOnly(!matchMySkillsOnly)}
                style={{
                  padding: '11px 18px',
                  background: matchMySkillsOnly ? '#FFFFFF' : 'rgba(255, 255, 255, 0.05)',
                  border: matchMySkillsOnly ? '1px solid #FFFFFF' : '1px solid rgba(255, 255, 255, 0.12)',
                  color: matchMySkillsOnly ? '#000000' : 'var(--text-secondary)',
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontWeight: 600,
                  borderRadius: 10
                }}
              >
                <Star size={15} fill={matchMySkillsOnly ? '#000000' : 'none'} />
                <span>Match My Skills</span>
              </button>
            </div>

            {/* Quick Skills Pills */}
            {candidateProfile?.skills?.length > 0 && (
              <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>QUICK FILTER:</span>
                {candidateProfile.skills.slice(0, 6).map(skill => (
                  <button
                    key={skill}
                    onClick={() => setSearchQuery(searchQuery === skill ? '' : skill)}
                    style={{
                      background: searchQuery.toLowerCase() === skill.toLowerCase() ? '#FFFFFF' : 'rgba(255, 255, 255, 0.04)',
                      border: searchQuery.toLowerCase() === skill.toLowerCase() ? '1px solid #FFFFFF' : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: 14,
                      padding: '3px 10px',
                      fontSize: '0.74rem',
                      color: searchQuery.toLowerCase() === skill.toLowerCase() ? '#000000' : 'var(--text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Job Postings List ──────────────────────────────────────────── */}
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[1, 2, 3].map(i => (
                <div key={i} className="glass-card" style={{ padding: 24, height: 180 }}>
                  <div style={{ width: '40%', height: 24, background: 'rgba(255,255,255,0.05)', borderRadius: 6, marginBottom: 12 }} />
                  <div style={{ width: '60%', height: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 6, marginBottom: 16 }} />
                  <div style={{ width: '80%', height: 14, background: 'rgba(255,255,255,0.02)', borderRadius: 6 }} />
                </div>
              ))}
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="glass-card" style={{ padding: '60px 24px', textAlign: 'center' }}>
              <Building2 size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px', opacity: 0.4 }} />
              <h3 style={{ color: '#FFFFFF', marginBottom: 8 }}>No Matching Jobs Found</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: 460, margin: '0 auto 20px' }}>
                We couldn't find any job postings matching your current search criteria. Try clearing your search query or skill filter.
              </p>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => { setSearchQuery(''); setSelectedExperience('all'); setMatchMySkillsOnly(false) }}
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {filteredJobs.map(job => {
                const appliedApp = myApplications.find(a => a.job_id === job.id)
                const isExpanded = expandedJobId === job.id
                const skillMatch = calculateSkillMatch(job.required_skills)
                const companyInitials = (job.company_name || 'HireSense Partner')
                  .split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

                return (
                  <div
                    key={job.id}
                    className="glass-card"
                    style={{
                      padding: 24,
                      borderRadius: 'var(--radius-lg)',
                      background: 'rgba(16, 23, 38, 0.75)',
                      border: appliedApp ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                  >
                    {/* Top Row: Company Badge, Title, Experience, Actions */}
                    <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
                      <div className="flex items-center gap-4">
                        {/* Company Logo Avatar */}
                        <div style={{
                          width: 52, height: 52, borderRadius: 14,
                          background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF', flexShrink: 0
                        }}>
                          {companyInitials}
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '0.02em' }}>
                              {job.company_name || 'HireSense Partner'}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>•</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              Posted by {job.recruiter_name || 'Priya (Recruiter)'} (Recruiter ID #{job.recruiter_id})
                            </span>
                          </div>

                          <h3 style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '1.3rem',
                            fontWeight: 700,
                            color: '#FFFFFF',
                            margin: 0
                          }}>
                            {job.title}
                          </h3>
                        </div>
                      </div>

                      {/* Right Action / Status */}
                      <div className="flex items-center gap-3">
                        {appliedApp ? (
                          <div style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '8px 16px',
                            background: 'rgba(16, 185, 129, 0.12)',
                            border: '1px solid rgba(16, 185, 129, 0.35)',
                            borderRadius: 10
                          }}>
                            <CheckCircle2 size={16} color="#10b981" />
                            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#10b981' }}>
                              Applied ({appliedApp.status}) · {Math.round(appliedApp.match_score || 0)}% Match
                            </span>
                          </div>
                        ) : (
                          <button
                            className="btn btn-primary"
                            style={{
                              padding: '10px 22px',
                              fontWeight: 700,
                              fontSize: '0.88rem',
                              display: 'flex', alignItems: 'center', gap: 8,
                              borderRadius: 10,
                              boxShadow: '0 4px 18px rgba(61, 110, 255, 0.3)'
                            }}
                            onClick={() => handleOpenApply(job)}
                          >
                            <Sparkles size={16} />
                            <span>Apply Now</span>
                            <ArrowRight size={15} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Metadata & Skill Match Bar */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 16,
                      flexWrap: 'wrap',
                      padding: '12px 16px',
                      background: 'rgba(0, 0, 0, 0.25)',
                      borderRadius: 8,
                      marginBottom: 16
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        <Clock size={14} color="var(--text-muted)" />
                        <span>Experience: <strong style={{ color: '#FFFFFF' }}>{job.experience || '1+ years'}</strong></span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        <MapPin size={14} color="var(--text-muted)" />
                        <span>Location: <strong style={{ color: '#FFFFFF' }}>Remote / Hybrid</strong></span>
                      </div>

                      {/* Skill Match Indicator */}
                      {skillMatch.total > 0 && (
                        <div style={{
                          marginLeft: 'auto',
                          display: 'flex', alignItems: 'center', gap: 8,
                          background: skillMatch.percentage >= 75 ? 'rgba(16, 185, 129, 0.12)' : (skillMatch.percentage >= 50 ? 'rgba(245, 158, 11, 0.12)' : 'rgba(61, 110, 255, 0.12)'),
                          border: `1px solid ${skillMatch.percentage >= 75 ? 'rgba(16, 185, 129, 0.3)' : (skillMatch.percentage >= 50 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(61, 110, 255, 0.3)')}`,
                          padding: '4px 10px',
                          borderRadius: 20
                        }}>
                          <Sparkles size={13} color={skillMatch.percentage >= 75 ? '#10b981' : (skillMatch.percentage >= 50 ? '#f59e0b' : '#3d6eff')} />
                          <span style={{
                            fontSize: '0.78rem', fontWeight: 700,
                            color: skillMatch.percentage >= 75 ? '#10b981' : (skillMatch.percentage >= 50 ? '#f59e0b' : '#60A5FA')
                          }}>
                            {skillMatch.matched}/{skillMatch.total} Required Skills Matched ({skillMatch.percentage}%)
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Job Description Preview / Expanded */}
                    <div style={{ marginBottom: 16 }}>
                      <p style={{
                        color: 'var(--text-secondary)',
                        fontSize: '0.88rem',
                        lineHeight: 1.6,
                        margin: 0
                      }}>
                        {isExpanded ? job.description : `${job.description.slice(0, 180)}...`}
                      </p>
                      {job.description.length > 180 && (
                        <button
                          onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                          style={{
                            background: 'none', border: 'none', padding: 0, marginTop: 6,
                            color: '#FFFFFF', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer'
                          }}
                        >
                          {isExpanded ? 'Show less' : 'Read full job description'}
                        </button>
                      )}
                    </div>

                    {/* Required Skills Chips */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>REQUIRED SKILLS:</span>
                      {(job.required_skills || []).map(skill => {
                        const isMatched = skillMatch.matchedSkills.includes(skill)
                        return (
                          <span
                            key={skill}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                              padding: '4px 10px',
                              borderRadius: 6,
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              background: isMatched ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                              border: isMatched ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                              color: isMatched ? '#10b981' : 'var(--text-secondary)'
                            }}
                          >
                            {isMatched && <Check size={12} style={{ strokeWidth: 3 }} />}
                            {skill}
                          </span>
                        )
                      })}

                      {job.preferred_skills?.length > 0 && (
                        <>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginLeft: 8 }}>PREFERRED:</span>
                          {job.preferred_skills.map(skill => (
                            <span key={skill} className="skill-tag" style={{ fontSize: '0.72rem', padding: '3px 8px' }}>
                              {skill}
                            </span>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

        </div>
      </div>

      {/* ── Complete Application Modal ─────────────────────────────────────── */}
      {applyingJob && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 20
        }}>
          <div className="glass-card" style={{
            width: '100%', maxWidth: 650, maxHeight: '90vh', overflowY: 'auto',
            padding: 32, position: 'relative',
            background: '#101726',
            border: '1px solid rgba(61, 110, 255, 0.3)',
            borderRadius: 'var(--radius-xl)'
          }}>
            {/* Modal Header */}
            <div className="flex items-center justify-between" style={{ marginBottom: 20, borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: 16 }}>
              <div>
                <div style={{ fontSize: '0.78rem', color: '#FFFFFF', fontWeight: 700, textTransform: 'uppercase' }}>
                  {applyingJob.company_name}
                </div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: '#FFFFFF', margin: '4px 0 0' }}>
                  Apply to {applyingJob.title}
                </h2>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  Application will be analyzed by HireSense AI and delivered to recruiter ID #{applyingJob.recruiter_id}
                </div>
              </div>

              <button
                onClick={() => setApplyingJob(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {applyError && (
              <div style={{
                padding: '12px 16px',
                background: 'rgba(244, 63, 94, 0.15)',
                border: '1px solid rgba(244, 63, 94, 0.4)',
                borderRadius: 8,
                color: '#f43f5e',
                fontSize: '0.85rem',
                marginBottom: 20,
                display: 'flex', alignItems: 'center', gap: 8
              }}>
                <AlertCircle size={16} />
                <span>{applyError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitApplication}>
              {/* Personal Information */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>
                  CANDIDATE CONTACT DETAILS
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={applicantName}
                      onChange={e => setApplicantName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Email Address</label>
                    <input
                      type="email"
                      className="form-input"
                      value={applicantEmail}
                      onChange={e => setApplicantEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 10 }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Phone Number</label>
                    <input
                      type="text"
                      className="form-input"
                      value={applicantPhone}
                      onChange={e => setApplicantPhone(e.target.value)}
                      placeholder="+91 9876543210"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Total Experience</label>
                    <input
                      type="text"
                      className="form-input"
                      value={applicantExp}
                      onChange={e => setApplicantExp(e.target.value)}
                      placeholder="e.g. 2 years"
                    />
                  </div>
                </div>

                <div style={{ marginTop: 10 }}>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Education / Degree</label>
                  <input
                    type="text"
                    className="form-input"
                    value={applicantEdu}
                    onChange={e => setApplicantEdu(e.target.value)}
                    placeholder="e.g. B.Tech Computer Science, IIT Bombay"
                  />
                </div>
              </div>

              {/* Verified Skills Editor */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>
                  VERIFIED APPLICATION SKILLS
                </label>
                <div style={{
                  display: 'flex', flexWrap: 'wrap', gap: 8,
                  padding: 12, background: 'rgba(0,0,0,0.25)', borderRadius: 8,
                  border: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: 8
                }}>
                  {applicantSkills.map(skill => (
                    <span
                      key={skill}
                      style={{
                        background: 'rgba(255, 255, 255, 0.12)',
                        color: '#FFFFFF',
                        border: '1px solid rgba(255, 255, 255, 0.25)',
                        padding: '3px 8px', borderRadius: 6, fontSize: '0.78rem',
                        display: 'flex', alignItems: 'center', gap: 6
                      }}
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', padding: 0 }}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Add new skill input */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    placeholder="Add an additional skill (e.g. Docker, PostgreSQL)..."
                    value={newSkillInput}
                    onChange={e => setNewSkillInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill() } }}
                    className="form-input"
                    style={{ flex: 1, fontSize: '0.84rem' }}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleAddSkill}
                  >
                    Add Skill
                  </button>
                </div>
              </div>

              {/* Resume Evidence Attachment */}
              <div style={{
                padding: '14px 16px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 8,
                marginBottom: 20
              }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText size={18} color="#FFFFFF" />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#FFFFFF' }}>
                        {candidateProfile?.resumeFileName || 'Candidate Profile Evidence'}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Verified resume evidence on file will be analyzed by HireSense matching engine
                      </div>
                    </div>
                  </div>
                  <span className="badge badge-brand" style={{ fontSize: '0.72rem' }}>Active Evidence</span>
                </div>
              </div>

              {/* Cover Pitch */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  APPLICATION PITCH / NOTES TO RECRUITER
                </label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={applicantNotes}
                  onChange={e => setApplicantNotes(e.target.value)}
                  placeholder="Share a short pitch explaining your interest and relevance for this position..."
                  style={{ width: '100%', resize: 'vertical', fontSize: '0.85rem' }}
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-between" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: 16 }}>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setApplyingJob(null)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                  style={{
                    padding: '10px 24px',
                    fontWeight: 700,
                    display: 'flex', alignItems: 'center', gap: 8
                  }}
                >
                  {submitting ? (
                    <>
                      <RefreshCw size={16} className="spin" />
                      <span>Running Deep AI Analysis…</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>Submit Application & Run AI Analysis</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Submission Success & AI Analysis Confirmation Modal ────────────── */}
      {submissionSuccess && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 20
        }}>
          <div className="glass-card" style={{
            width: '100%', maxWidth: 540,
            padding: 36, textAlign: 'center',
            background: '#101726',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: '0 0 32px rgba(16, 185, 129, 0.2)'
          }}>
            {/* Animated Check Icon */}
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '2px solid #10b981',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
              color: '#10b981'
            }}>
              <CheckCircle2 size={38} />
            </div>

            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: '#FFFFFF', marginBottom: 8 }}>
              Application Delivered & Analyzed!
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: 24 }}>
              Your application for <strong style={{ color: '#FFFFFF' }}>{submissionSuccess.job.title}</strong> at <strong style={{ color: '#FFFFFF' }}>{submissionSuccess.job.company_name}</strong> has been received.
            </p>

            {/* AI Fit Snapshot */}
            <div style={{
              padding: '16px 20px',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: 12,
              border: '1px solid rgba(255, 255, 255, 0.08)',
              marginBottom: 24,
              textAlign: 'left'
            }}>
              <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  INSTANT AI MATCH FIT
                </span>
                <span style={{
                  fontSize: '1.25rem', fontWeight: 800,
                  fontFamily: 'var(--font-display)',
                  color: submissionSuccess.score >= 80 ? '#10b981' : '#f59e0b'
                }}>
                  {submissionSuccess.score}% Match
                </span>
              </div>

              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheck size={16} color="#10b981" />
                <span>
                  Delivered directly to recruiter <strong style={{ color: '#FFFFFF' }}>{submissionSuccess.job.recruiter_name}</strong> (User ID #{submissionSuccess.job.recruiter_id})
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-3">
              <button
                className="btn btn-secondary"
                onClick={() => setSubmissionSuccess(null)}
              >
                Browse More Jobs
              </button>
              <button
                className="btn btn-primary"
                onClick={() => navigate('/candidate')}
              >
                Go to My Applications
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
