import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  X, User, Building2, Sliders, Phone, Mail, MapPin, Globe,
  Briefcase, CheckCircle2, AlertCircle, Loader2, Sparkles,
  ExternalLink, Calendar, Clock, ShieldCheck
} from 'lucide-react'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function RecruiterProfileModal({ isOpen, onClose, onProfileUpdated }) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('personal') // 'personal' | 'company' | 'hiring'
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Form State
  const [formData, setFormData] = useState({
    name: user?.name || 'Priya Mehta',
    email: user?.email || 'priya.recruiter@example.com',
    phone: '+91 98112 34567',
    title: 'Lead Technical Recruiter',
    department: 'Engineering Talent',
    timezone: 'Asia/Kolkata (IST)',
    linkedin_url: 'https://linkedin.com/in/recruiter-priya',
    calendly_url: 'https://calendly.com/priya-hiresense',
    company_name: 'NeuralStack AI',
    company_website: 'https://neuralstack.ai',
    company_size: '51-200 employees',
    industry: 'AI & Machine Learning',
    address: 'Level 7, Cyber Green Tower, DLF Cyber City, Gurugram, India',
    bio: 'Building the next generation of multimodal AI foundation models and scalable enterprise intelligence.',
    work_policy: 'Hybrid (2-3 days)',
    auto_match_threshold: 75,
    notify_on_new_applicant: true,
    auto_generate_ai_reports: true,
    default_interview_format: 'Live Coding & System Design'
  })

  // Load profile from backend
  useEffect(() => {
    if (!isOpen) return

    async function fetchProfile() {
      try {
        setLoading(true)
        setErrorMsg('')
        const res = await client.get('/recruiters/me/profile')
        if (res.data) {
          const d = res.data
          const prefs = d.hiring_preferences || {}
          setFormData({
            name: d.name || user?.name || '',
            email: d.email || user?.email || '',
            phone: d.phone || '',
            title: d.title || 'Lead Technical Recruiter',
            department: d.department || 'Engineering Talent',
            timezone: d.timezone || 'Asia/Kolkata (IST)',
            linkedin_url: d.linkedin_url || '',
            calendly_url: d.calendly_url || '',
            company_name: d.company_name || 'NeuralStack AI',
            company_website: d.company_website || 'https://neuralstack.ai',
            company_size: d.company_size || '51-200 employees',
            industry: d.industry || 'AI & Machine Learning',
            address: d.address || '',
            bio: d.bio || '',
            work_policy: d.work_policy || 'Hybrid (2-3 days)',
            auto_match_threshold: prefs.auto_match_threshold ?? 75,
            notify_on_new_applicant: prefs.notify_on_new_applicant ?? true,
            auto_generate_ai_reports: prefs.auto_generate_ai_reports ?? true,
            default_interview_format: prefs.default_interview_format || 'Live Coding & System Design'
          })
        }
      } catch (err) {
        console.error('Failed to load recruiter profile', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [isOpen, user])

  if (!isOpen) return null

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      setErrorMsg('')
      setSuccessMsg('')

      const payload = {
        name: formData.name,
        phone: formData.phone,
        title: formData.title,
        department: formData.department,
        timezone: formData.timezone,
        linkedin_url: formData.linkedin_url,
        calendly_url: formData.calendly_url,
        company_name: formData.company_name,
        company_website: formData.company_website,
        company_size: formData.company_size,
        industry: formData.industry,
        address: formData.address,
        bio: formData.bio,
        work_policy: formData.work_policy,
        hiring_preferences: {
          auto_match_threshold: Number(formData.auto_match_threshold),
          notify_on_new_applicant: Boolean(formData.notify_on_new_applicant),
          auto_generate_ai_reports: Boolean(formData.auto_generate_ai_reports),
          default_interview_format: formData.default_interview_format
        }
      }

      const res = await client.put('/recruiters/me/profile', payload)
      setSuccessMsg('Recruiter & company profile saved successfully!')
      if (onProfileUpdated) {
        onProfileUpdated(res.data)
      }
      setTimeout(() => setSuccessMsg(''), 3500)
    } catch (err) {
      console.error('Failed to save profile', err)
      setErrorMsg(err.response?.data?.detail || 'Failed to save profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const initials = (formData.name || 'Priya Mehta')
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(5, 8, 15, 0.82)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: 20,
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={onClose}
    >
      <div
        id="recruiter-profile-modal-container"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 720,
          maxHeight: '90vh',
          background: '#0D1424',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 20,
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.85), 0 0 30px rgba(59, 130, 246, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header Strip */}
        <div style={{
          padding: '24px 28px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #FFFFFF, #CBD5E1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: 800,
              color: '#000000',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
            }}>
              {initials}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                  {formData.name || 'Recruiter Profile'}
                </h2>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  color: '#FFFFFF',
                  padding: '2px 8px',
                  borderRadius: 20,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}>
                  Verified Recruiter
                </span>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#94A3B8', marginTop: 3 }}>
                {formData.title} · {formData.company_name}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            title="Close"
            id="btn-close-recruiter-profile"
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#94A3B8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseOver={e => {
              e.currentTarget.style.color = '#FFFFFF'
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
            }}
            onMouseOut={e => {
              e.currentTarget.style.color = '#94A3B8'
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          padding: '0 28px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(11, 17, 30, 0.5)',
          gap: 20,
        }}>
          {[
            { id: 'personal', label: 'Personal Details', icon: User },
            { id: 'company', label: 'Company Profile', icon: Building2 },
            { id: 'hiring', label: 'Hiring & AI Settings', icon: Sliders },
          ].map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                id={`tab-recruiter-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '14px 0',
                  background: 'none',
                  border: 'none',
                  borderBottom: isActive ? '2px solid #FFFFFF' : '2px solid transparent',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  marginBottom: -1,
                }}
                onMouseOver={e => {
                  if (!isActive) e.currentTarget.style.color = '#CBD5E1'
                }}
                onMouseOut={e => {
                  if (!isActive) e.currentTarget.style.color = '#94A3B8'
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div style={{
          padding: '24px 28px',
          overflowY: 'auto',
          flex: 1,
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <Loader2 size={32} className="iv-spin" style={{ color: '#FFFFFF', margin: '0 auto 12px' }} />
              <p style={{ color: '#94A3B8', fontSize: '0.88rem' }}>Loading recruiter details...</p>
            </div>
          ) : (
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Feedback Alerts */}
              {errorMsg && (
                <div style={{
                  padding: '12px 16px',
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: 10,
                  color: '#F87171',
                  fontSize: '0.84rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <AlertCircle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div style={{
                  padding: '12px 16px',
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: 10,
                  color: '#4ADE80',
                  fontSize: '0.84rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <CheckCircle2 size={16} />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* ── TAB 1: PERSONAL DETAILS ── */}
              {activeTab === 'personal' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input
                        type="text"
                        className="form-input"
                        id="recruiter-input-name"
                        value={formData.name}
                        onChange={e => handleChange('name', e.target.value)}
                        placeholder="e.g. Priya Mehta"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Work Email</label>
                      <input
                        type="email"
                        className="form-input"
                        value={formData.email}
                        disabled
                        style={{ opacity: 0.7, cursor: 'not-allowed' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="form-group">
                      <label className="form-label">Direct Phone Number</label>
                      <input
                        type="text"
                        className="form-input"
                        id="recruiter-input-phone"
                        value={formData.phone}
                        onChange={e => handleChange('phone', e.target.value)}
                        placeholder="e.g. +91 98112 34567"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Job Title / Designation</label>
                      <input
                        type="text"
                        className="form-input"
                        id="recruiter-input-title"
                        value={formData.title}
                        onChange={e => handleChange('title', e.target.value)}
                        placeholder="e.g. Lead Technical Recruiter"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="form-group">
                      <label className="form-label">Department / Unit</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.department}
                        onChange={e => handleChange('department', e.target.value)}
                        placeholder="e.g. Engineering Hiring"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Timezone</label>
                      <select
                        className="form-input"
                        value={formData.timezone}
                        onChange={e => handleChange('timezone', e.target.value)}
                        style={{ background: '#131B2E', color: '#FFFFFF' }}
                      >
                        <option value="Asia/Kolkata (IST)">Asia/Kolkata (IST - GMT+5:30)</option>
                        <option value="America/New_York (EST)">America/New_York (EST - GMT-5:00)</option>
                        <option value="America/Los_Angeles (PST)">America/Los_Angeles (PST - GMT-8:00)</option>
                        <option value="Europe/London (GMT)">Europe/London (GMT / BST)</option>
                        <option value="Asia/Singapore (SGT)">Asia/Singapore (SGT - GMT+8:00)</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="form-group">
                      <label className="form-label">LinkedIn Profile URL</label>
                      <input
                        type="url"
                        className="form-input"
                        value={formData.linkedin_url}
                        onChange={e => handleChange('linkedin_url', e.target.value)}
                        placeholder="https://linkedin.com/in/..."
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Calendly / Meeting Link</label>
                      <input
                        type="url"
                        className="form-input"
                        value={formData.calendly_url}
                        onChange={e => handleChange('calendly_url', e.target.value)}
                        placeholder="https://calendly.com/..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 2: COMPANY PROFILE ── */}
              {activeTab === 'company' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="form-group">
                      <label className="form-label">Company Name</label>
                      <input
                        type="text"
                        className="form-input"
                        id="recruiter-input-company"
                        value={formData.company_name}
                        onChange={e => handleChange('company_name', e.target.value)}
                        placeholder="e.g. NeuralStack AI"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Company Website / Careers</label>
                      <input
                        type="url"
                        className="form-input"
                        value={formData.company_website}
                        onChange={e => handleChange('company_website', e.target.value)}
                        placeholder="https://company.ai"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="form-group">
                      <label className="form-label">Industry & Domain</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.industry}
                        onChange={e => handleChange('industry', e.target.value)}
                        placeholder="e.g. AI & Machine Learning, Enterprise SaaS"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Company Size / Headcount</label>
                      <select
                        className="form-input"
                        value={formData.company_size}
                        onChange={e => handleChange('company_size', e.target.value)}
                        style={{ background: '#131B2E', color: '#FFFFFF' }}
                      >
                        <option value="1-10 employees">1-10 employees (Early Stage)</option>
                        <option value="11-50 employees">11-50 employees (Seed / Series A)</option>
                        <option value="51-200 employees">51-200 employees (Growth Stage)</option>
                        <option value="201-500 employees">201-500 employees (Scale-up)</option>
                        <option value="500+ employees">500+ employees (Enterprise)</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Headquarters / Office Address</label>
                    <input
                      type="text"
                      className="form-input"
                      id="recruiter-input-address"
                      value={formData.address}
                      onChange={e => handleChange('address', e.target.value)}
                      placeholder="e.g. Level 7, Cyber Green Tower, DLF Cyber City, Gurugram, India"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Company Bio & Value Proposition</label>
                    <textarea
                      rows={3}
                      className="form-input"
                      value={formData.bio}
                      onChange={e => handleChange('bio', e.target.value)}
                      placeholder="Brief overview of what makes your company an exciting workplace..."
                      style={{ resize: 'vertical' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Work Policy</label>
                    <div style={{ display: 'flex', gap: 12 }}>
                      {['Remote-first', 'Hybrid (2-3 days)', 'On-site'].map(policy => (
                        <button
                          type="button"
                          key={policy}
                          onClick={() => handleChange('work_policy', policy)}
                          style={{
                            flex: 1,
                            padding: '10px 14px',
                            borderRadius: 10,
                            background: formData.work_policy === policy ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                            border: formData.work_policy === policy ? '1px solid #FFFFFF' : '1px solid rgba(255, 255, 255, 0.08)',
                            color: formData.work_policy === policy ? '#FFFFFF' : '#94A3B8',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {policy}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 3: HIRING & AI SETTINGS ── */}
              {activeTab === 'hiring' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{
                    padding: 18,
                    borderRadius: 14,
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#FFFFFF' }}>
                          Auto-Shortlist Match Threshold
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                          Candidates meeting or exceeding this AI match fit score will be highlighted for immediate review.
                        </div>
                      </div>
                      <div style={{
                        fontSize: '1.2rem',
                        fontWeight: 800,
                        color: '#FFFFFF',
                        background: 'rgba(255, 255, 255, 0.12)',
                        padding: '4px 12px',
                        borderRadius: 8,
                        border: '1px solid rgba(255, 255, 255, 0.25)',
                      }}>
                        {formData.auto_match_threshold}%
                      </div>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="95"
                      step="5"
                      value={formData.auto_match_threshold}
                      onChange={e => handleChange('auto_match_threshold', Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#FFFFFF', cursor: 'pointer', marginTop: 8 }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Default Interview Screening Format</label>
                    <select
                      className="form-input"
                      value={formData.default_interview_format}
                      onChange={e => handleChange('default_interview_format', e.target.value)}
                      style={{ background: '#131B2E', color: '#FFFFFF' }}
                    >
                      <option value="Live Coding & System Design">Live Coding & System Design</option>
                      <option value="Async Video Response (HireSense AI)">Async Video Response (HireSense AI)</option>
                      <option value="Technical Screening + Culture Alignment">Technical Screening + Culture Alignment</option>
                      <option value="Take-Home Project Evaluation">Take-Home Project Evaluation</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      cursor: 'pointer',
                      padding: '12px 16px',
                      borderRadius: 10,
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                    }}>
                      <input
                        type="checkbox"
                        checked={formData.notify_on_new_applicant}
                        onChange={e => handleChange('notify_on_new_applicant', e.target.checked)}
                        style={{ width: 16, height: 16, accentColor: '#FFFFFF' }}
                      />
                      <div>
                        <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#FFFFFF' }}>
                          Instant Notification on Candidate Application
                        </div>
                        <div style={{ fontSize: '0.76rem', color: '#94A3B8' }}>
                          Receive immediate notification when a candidate applies and their AI match fit is evaluated.
                        </div>
                      </div>
                    </label>

                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      cursor: 'pointer',
                      padding: '12px 16px',
                      borderRadius: 10,
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                    }}>
                      <input
                        type="checkbox"
                        checked={formData.auto_generate_ai_reports}
                        onChange={e => handleChange('auto_generate_ai_reports', e.target.checked)}
                        style={{ width: 16, height: 16, accentColor: '#FFFFFF' }}
                      />
                      <div>
                        <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#FFFFFF' }}>
                          Automatic AI Dossier & Speech Synthesis
                        </div>
                        <div style={{ fontSize: '0.76rem', color: '#94A3B8' }}>
                          Automatically compile deep radar charts and speech analytics for submitted interviews.
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 12,
                marginTop: 12,
                paddingTop: 16,
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              }}>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary"
                  style={{ padding: '9px 18px', fontSize: '0.86rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-save-recruiter-profile"
                  disabled={saving}
                  className="btn btn-primary"
                  style={{
                    padding: '9px 24px',
                    fontSize: '0.86rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="iv-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} /> Save Profile Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
