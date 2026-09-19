import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import { StatusBadge } from '../components/Charts'
import client from '../api/client'
import { Plus, X, Briefcase, Users, CheckCircle, Target, AlertCircle } from 'lucide-react'

export default function JobsPage() {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    title: '',
    experience: '1-3 years',
    requiredSkills: '',
    preferredSkills: '',
    description: '',
    status: 'active'
  })

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const res = await client.get('/jobs')
      setJobs(res.data)
    } catch (err) {
      console.error('Failed to load jobs:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  const handleCreateJob = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.title.trim() || !form.description.trim()) {
      setError('Please provide a job title and description.')
      return
    }

    const reqSkills = form.requiredSkills
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)

    if (reqSkills.length === 0) {
      setError('Please provide at least one required skill (comma-separated).')
      return
    }

    const prefSkills = form.preferredSkills
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)

    setCreating(true)
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        experience: form.experience.trim(),
        required_skills: reqSkills,
        preferred_skills: prefSkills,
        status: form.status
      }
      const res = await client.post('/jobs', payload)
      setJobs(prev => [res.data, ...prev])
      setShowModal(false)
      setForm({
        title: '',
        experience: '1-3 years',
        requiredSkills: '',
        preferredSkills: '',
        description: '',
        status: 'active'
      })
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create job posting.')
    } finally {
      setCreating(false)
    }
  }

  const filteredJobs = jobs.filter(j => {
    if (statusFilter === 'all') return true
    return j.status.toLowerCase() === statusFilter.toLowerCase()
  })

  // Summary Metrics
  const activeJobsCount = jobs.filter(j => j.status.toLowerCase() === 'active').length
  const totalAppsCount = jobs.reduce((acc, j) => acc + (j.applications_count || 0), 0)
  const totalShortlisted = jobs.reduce((acc, j) => acc + (j.shortlisted_count || 0), 0)
  const avgMatch = jobs.length > 0
    ? Math.round(jobs.reduce((acc, j) => acc + (j.avg_match_score || 0), 0) / (jobs.filter(j => j.avg_match_score > 0).length || 1))
    : 0

  return (
    <div className="app-layout">
      <Sidebar role="recruiter" />
      <div className="main-content">
        <Topbar title="Job Postings" subtitle="Manage open roles and applicant pipelines" />

        <div className="page-content">
          {/* Header */}
          <div className="flex items-center justify-between" style={{ marginBottom: 28 }}>
            <div>
              <h1 className="page-title">Job Postings</h1>
              <p className="page-subtitle">
                {jobs.length} jobs · {activeJobsCount} active · {totalAppsCount} total applications
              </p>
            </div>
            <button
              className="btn btn-primary"
              id="btn-new-job"
              onClick={() => {
                setError('')
                setShowModal(true)
              }}
            >
              <Plus size={16} /> Create New Job
            </button>
          </div>

          {/* Stats row */}
          <div className="grid-4" style={{ marginBottom: 28 }}>
            {[
              { label: 'Active Jobs', value: activeJobsCount, icon: <Briefcase size={20} />, color: '#3d6eff' },
              { label: 'Total Applications', value: totalAppsCount, icon: <Users size={20} />, color: '#10b981' },
              { label: 'Shortlisted', value: totalShortlisted, icon: <CheckCircle size={20} />, color: '#8b5cf6' },
              { label: 'Avg Match Score', value: `${avgMatch || 75}%`, icon: <Target size={20} />, color: '#f59e0b' },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div className="stat-icon" style={{ background: `${s.color}22`, color: s.color, marginBottom: 12 }}>
                  {s.icon}
                </div>
                <div className="stat-value" style={{ fontSize: '2rem', color: s.color }}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2" style={{ marginBottom: 20 }}>
            {['all', 'active', 'draft', 'closed'].map(f => (
              <button
                key={f}
                className={`btn btn-sm ${statusFilter === f ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setStatusFilter(f)}
                style={{ textTransform: 'capitalize' }}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Job Cards */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div className="spinner" style={{ margin: '0 auto 16px' }} />
              <p style={{ color: 'var(--text-muted)' }}>Loading open roles...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>No jobs found in this view.</p>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowModal(true)}>
                + Create your first job
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {filteredJobs.map(job => (
                <div key={job.id} className="glass-card" style={{ padding: 24 }}>
                  <div className="flex items-center justify-between">
                    <div style={{ flex: 1 }}>
                      <div className="flex items-center gap-3" style={{ marginBottom: 8 }}>
                        <div style={{
                          width: 42, height: 42, borderRadius: 'var(--radius-md)',
                          background: 'rgba(37, 99, 235, 0.12)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#2563eb'
                        }}>
                          <Briefcase size={20} />
                        </div>
                        <div>
                          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                            {job.title}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            Experience: {job.experience} · Status: <span style={{ textTransform: 'capitalize' }}>{job.status}</span>
                          </div>
                        </div>
                        <StatusBadge status={job.status} />
                      </div>

                      {/* Skills */}
                      <div className="flex gap-2" style={{ flexWrap: 'wrap', marginBottom: 14 }}>
                        {job.required_skills?.map(sk => (
                          <span key={sk} className="skill-tag">{sk}</span>
                        ))}
                      </div>

                      {/* Stats row */}
                      <div className="flex gap-6">
                        <div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                            {job.applications_count || 0}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Applications</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#10b981' }}>
                            {job.shortlisted_count || 0}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Shortlisted</div>
                        </div>
                        {job.avg_match_score > 0 && (
                          <div>
                            <div style={{
                              fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-display)',
                              background: 'var(--grad-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                            }}>
                              {job.avg_match_score}%
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Avg Match</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        className="btn btn-secondary btn-sm"
                        id={`btn-candidates-${job.id}`}
                        onClick={() => navigate(`/recruiter/candidates?jobId=${job.id}`)}
                      >
                        View Candidates ({job.applications_count || 0})
                      </button>
                    </div>
                  </div>

                  {/* Application progress bar */}
                  {job.applications_count > 0 && (
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
                      <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Shortlist rate</span>
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#10b981' }}>
                          {Math.round((job.shortlisted_count / job.applications_count) * 100)}%
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{
                          width: `${Math.round((job.shortlisted_count / job.applications_count) * 100)}%`,
                          background: 'linear-gradient(90deg, #10b981, #06b6d4)'
                        }} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Job Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 20
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: 560, padding: 32, position: 'relative' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem' }}>
                Create New Job Posting
              </div>
              <button
                className="btn btn-icon btn-ghost"
                onClick={() => setShowModal(false)}
                style={{ padding: 6 }}
              >
                <X size={18} />
              </button>
            </div>

            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', marginBottom: 16,
                background: 'rgba(244, 63, 94, 0.12)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                borderRadius: 'var(--radius-md)',
                color: '#fb7185', fontSize: '0.85rem'
              }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateJob} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Job Title *</label>
                <input
                  className="form-input"
                  placeholder="e.g. Senior Python Developer"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              <div className="grid-2" style={{ gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Experience Required</label>
                  <input
                    className="form-input"
                    placeholder="e.g. 2+ years"
                    value={form.experience}
                    onChange={e => setForm({ ...form, experience: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-input"
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                    style={{ background: 'var(--bg-card)' }}
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Required Skills * (comma-separated)</label>
                <input
                  className="form-input"
                  placeholder="Python, FastAPI, SQL, Docker"
                  value={form.requiredSkills}
                  onChange={e => setForm({ ...form, requiredSkills: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Preferred Skills (comma-separated)</label>
                <input
                  className="form-input"
                  placeholder="Redis, Celery, AWS, Kubernetes"
                  value={form.preferredSkills}
                  onChange={e => setForm({ ...form, preferredSkills: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Job Description *</label>
                <textarea
                  className="form-input"
                  rows={4}
                  placeholder="Describe the responsibilities, team, and expected outcomes..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  required
                />
              </div>

              <div className="flex justify-end gap-3" style={{ marginTop: 8 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={creating}
                >
                  {creating ? 'Publishing...' : 'Publish Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
