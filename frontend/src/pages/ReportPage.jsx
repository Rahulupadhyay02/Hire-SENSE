import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import { ScoreRing, SkillMatchBar, StatusBadge } from '../components/Charts'
import { useNavigate } from 'react-router-dom'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line
} from 'recharts'

const candidate = {
  name: 'Priya Mehta',
  role: 'Python Developer',
  email: 'priya.mehta@example.com',
  phone: '+91 9876543210',
  education: 'B.Tech Computer Science, IIT Bombay (2024)',
  experience: '2 years',
  skills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'Git', 'REST APIs'],
  matchScore: 91,
  resumeHighlights: [
    'Built an ML pipeline for fraud detection — 94% accuracy',
    '2 years Python backend at TechStartup (REST APIs, PostgreSQL)',
    'Open-source contributor: FastAPI plugin (250+ GitHub stars)',
  ],
  components: { skills: 93, experience: 88, projects: 90, requirements: 92 },
}

const interviewMetrics = {
  wordCount: 382,
  fillerCount: 11,
  fillerRate: 2.9,
  speakingRate: 148,
  longPauses: 2,
  relevance: 'High',
  structure: 'Strong',
  technicalCoverage: 'High',
}

const questionAnalysis = [
  {
    q: 'Tell me about your FastAPI experience.',
    score: 94, relevance: 'High', structure: 'Strong',
    feedback: 'Clear STAR structure. Mentioned specific project with measurable outcome.',
    transcript: 'I used FastAPI extensively for the backend of our fraud detection system...',
  },
  {
    q: 'How do you approach database optimization?',
    score: 82, relevance: 'High', structure: 'Medium',
    feedback: 'Good technical depth. Could clarify the result/outcome more explicitly.',
    transcript: 'For database optimization, I start by analyzing slow queries using EXPLAIN...',
  },
  {
    q: 'Describe a challenging project.',
    score: 78, relevance: 'Medium', structure: 'Medium',
    feedback: 'Relevant example chosen. Action described well. Result could be quantified.',
    transcript: 'One of the most challenging projects was a real-time data pipeline...',
  },
]

const radarData = [
  { area: 'Skills', value: 93 },
  { area: 'Experience', value: 88 },
  { area: 'Projects', value: 90 },
  { area: 'Education', value: 85 },
  { area: 'Requirements', value: 92 },
]

const communicationHistory = [
  { attempt: 'Attempt 1', fillerRate: 8.7, score: 68 },
  { attempt: 'Attempt 2', fillerRate: 5.2, score: 78 },
  { attempt: 'Attempt 3', fillerRate: 2.9, score: 91 },
]

import { useChartColors } from '../components/Charts'

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
          {p.name}: <strong style={{ color: tooltipText }}>{p.value}{p.name === 'fillerRate' ? '%' : ''}</strong>
        </div>
      ))}
    </div>
  )
}

export default function ReportPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = ['overview', 'resume', 'matching', 'interview', 'decision']

  return (
    <div className="app-layout">
      <Sidebar role="recruiter" />
      <div className="main-content">
        <Topbar title="AI Candidate Report" subtitle="Priya Mehta · Python Developer" />

        <div className="page-content">
          {/* Header */}
          <div className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="candidate-avatar" style={{ width: 72, height: 72, fontSize: '1.6rem', background: 'linear-gradient(135deg, #3d6eff, #8b5cf6)' }}>
                  PM
                </div>
                <div>
                  <div className="flex items-center gap-3" style={{ marginBottom: 6 }}>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem' }}>{candidate.name}</h2>
                    <StatusBadge status="Shortlisted" />
                    <span className="badge badge-brand">AI Report Ready</span>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {candidate.role} · {candidate.experience} experience · {candidate.education}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    📧 {candidate.email} · 📱 {candidate.phone}
                  </div>
                </div>
              </div>

              {/* Overall Score */}
              <div style={{ textAlign: 'center' }}>
                <ScoreRing score={91} size={110} strokeWidth={10} label="Overall Match" />
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  vs. Python Developer role
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2" style={{ marginTop: 24, borderTop: '1px solid var(--border-subtle)', paddingTop: 20 }}>
              {tabs.map(t => (
                <button
                  key={t}
                  id={`tab-${t}`}
                  onClick={() => setActiveTab(t)}
                  className="btn btn-sm"
                  style={{
                    borderRadius: 'var(--radius-full)',
                    border: activeTab === t ? '1px solid var(--border-brand)' : '1px solid var(--border-subtle)',
                    background: activeTab === t ? 'rgba(61,110,255,0.15)' : 'transparent',
                    color: activeTab === t ? 'var(--brand-400)' : 'var(--text-muted)',
                    textTransform: 'capitalize', fontWeight: 600
                  }}
                >
                  {t === 'overview' ? '⬡ Overview' :
                   t === 'resume' ? '📄 Resume' :
                   t === 'matching' ? '🎯 Matching' :
                   t === 'interview' ? '🎙️ Interview' : '⚖️ Decision'}
                </button>
              ))}
            </div>
          </div>

          {/* Tab: Overview */}
          {activeTab === 'overview' && (
            <>
              <div className="grid-4" style={{ marginBottom: 24 }}>
                {[
                  { label: 'Skills Match', value: 93, icon: '🛠️', color: '#3d6eff' },
                  { label: 'Experience', value: 88, icon: '📅', color: '#10b981' },
                  { label: 'Projects', value: 90, icon: '📁', color: '#8b5cf6' },
                  { label: 'Requirements', value: 92, icon: '✅', color: '#f59e0b' },
                ].map(c => (
                  <div key={c.label} className="stat-card" style={{ textAlign: 'center', paddingTop: 28 }}>
                    <ScoreRing score={c.value} size={90} strokeWidth={8} label={c.label} />
                  </div>
                ))}
              </div>

              <div className="grid-2" style={{ marginBottom: 24 }}>
                <div className="chart-card">
                  <div className="chart-header"><div className="chart-title">Competency Radar</div></div>
                  <ResponsiveContainer width="100%" height={220}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke={useChartColors().polarGrid} />
                      <PolarAngleAxis dataKey="area" tick={{ fill: useChartColors().labelFill, fontSize: 11 }} />
                      <Radar dataKey="value" stroke="#3d6eff" fill="#3d6eff" fillOpacity={0.15} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-card">
                  <div className="chart-header">
                    <div className="chart-title">Interview Progress</div>
                    <div className="chart-subtitle">Across 3 attempts</div>
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={communicationHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke={useChartColors().gridStroke} />
                      <XAxis dataKey="attempt" tick={{ fill: useChartColors().tickFill, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: useChartColors().tickFill, fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                      <Tooltip content={<ThemedTooltip />} />
                      <Line type="monotone" dataKey="score" name="Score" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', strokeWidth: 0, r: 5 }} />
                      <Line type="monotone" dataKey="fillerRate" name="fillerRate" stroke="#f59e0b" strokeWidth={2.5} dot={{ fill: '#f59e0b', strokeWidth: 0, r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Resume Highlights */}
              <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
                <div className="chart-title" style={{ marginBottom: 16 }}>📄 Resume Highlights</div>
                {candidate.resumeHighlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-3" style={{ padding: '12px 0', borderBottom: i < candidate.resumeHighlights.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--brand-500)', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{h}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Tab: Interview */}
          {activeTab === 'interview' && (
            <>
              {/* Metrics */}
              <div className="grid-4" style={{ marginBottom: 24 }}>
                {[
                  { label: 'Word Count', value: interviewMetrics.wordCount, icon: '📝', sub: 'words total', color: '#3d6eff' },
                  { label: 'Filler Rate', value: `${interviewMetrics.fillerRate}%`, icon: '💬', sub: `${interviewMetrics.fillerCount} filler words`, color: '#10b981' },
                  { label: 'Speaking Rate', value: `${interviewMetrics.speakingRate}`, icon: '🎙️', sub: 'words per minute', color: '#8b5cf6' },
                  { label: 'Long Pauses', value: interviewMetrics.longPauses, icon: '⏸', sub: 'detected', color: '#f59e0b' },
                ].map(m => (
                  <div key={m.label} className="stat-card">
                    <div style={{ fontSize: '1.4rem', marginBottom: 12 }}>{m.icon}</div>
                    <div className="stat-value" style={{ fontSize: '1.8rem', background: `linear-gradient(135deg, ${m.color}, ${m.color}88)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      {m.value}
                    </div>
                    <div className="stat-label">{m.label}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{m.sub}</div>
                  </div>
                ))}
              </div>

              {/* Question Analysis */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {questionAnalysis.map((qa, i) => (
                  <div key={i} className="glass-card" style={{ padding: 24 }}>
                    <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
                      <div className="flex items-center gap-3">
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%',
                          background: 'var(--grad-brand)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.8rem', fontWeight: 800, color: '#fff', flexShrink: 0
                        }}>Q{i + 1}</div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{qa.q}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="badge badge-brand">Relevance: {qa.relevance}</span>
                        <span className="badge badge-purple">Structure: {qa.structure}</span>
                        <div style={{
                          fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem',
                          background: 'var(--grad-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                        }}>
                          {qa.score}%
                        </div>
                      </div>
                    </div>

                    {/* Transcript snippet */}
                    <div style={{
                      padding: '12px 16px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 8, marginBottom: 12,
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.7
                    }}>
                      "{qa.transcript}..."
                    </div>

                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: '0.82rem' }}>💡</span>
                      <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>{qa.feedback}</span>
                    </div>

                    {/* Score bar */}
                    <div className="flex items-center gap-3" style={{ marginTop: 14 }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', width: 60 }}>Score</span>
                      <div className="progress-bar" style={{ flex: 1 }}>
                        <div className="progress-fill" style={{ width: `${qa.score}%` }} />
                      </div>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--brand-400)' }}>{qa.score}%</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Responsible AI Notice */}
              <div style={{
                marginTop: 20, padding: '16px 20px',
                background: 'rgba(245,158,11,0.06)',
                border: '1px solid rgba(245,158,11,0.2)',
                borderRadius: 'var(--radius-lg)',
                fontSize: '0.84rem', color: 'var(--text-secondary)',
                display: 'flex', gap: 12, alignItems: 'flex-start'
              }}>
                <span style={{ fontSize: '1.1rem' }}>⚠️</span>
                <div>
                  <strong style={{ color: '#f59e0b' }}>AI Limitations Notice</strong> — Interview analysis is based on observable speech and text evidence only.
                  No personality, honesty, emotion or mental-state claims are made. Recruiter review and human decision required.
                  Original transcript remains available as evidence.
                </div>
              </div>
            </>
          )}

          {/* Tab: Matching */}
          {activeTab === 'matching' && (
            <>
              <div className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
                <div className="flex items-center gap-4" style={{ marginBottom: 24 }}>
                  <ScoreRing score={91} size={120} strokeWidth={10} label="Overall Match" />
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 8 }}>Match Formula</h3>
                    <div style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.85rem',
                      color: 'var(--brand-400)', padding: '14px 18px',
                      background: 'rgba(61,110,255,0.06)',
                      border: '1px solid rgba(61,110,255,0.2)',
                      borderRadius: 10, lineHeight: 2
                    }}>
                      Overall = 0.45 × Skills (93%) + 0.20 × Experience (88%) + 0.20 × Projects (90%) + 0.15 × Requirements (92%)<br />
                      = 0.45×93 + 0.20×88 + 0.20×90 + 0.15×92 = <strong>91.25%</strong>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 10 }}>
                      ⚠️ Scoring weights are starting defaults — validate with real users and revise after testing.
                    </div>
                  </div>
                </div>

                {/* Skill match detail */}
                <div className="chart-title" style={{ marginBottom: 16 }}>Skill-by-Skill Evidence</div>
                {[
                  { skill: 'Python', status: '✓', evidence: 'Primary language — 2 years + open-source projects', match: 96 },
                  { skill: 'FastAPI', status: '✓', evidence: 'FastAPI plugin author (250+ stars) — confirmed proficiency', match: 98 },
                  { skill: 'PostgreSQL', status: '✓', evidence: 'Used in fraud detection backend — query optimization mentioned', match: 88 },
                  { skill: 'Docker', status: '✓', evidence: 'Listed as skill — no dedicated project mentioned', match: 72 },
                  { skill: 'Machine Learning', status: '⚠', evidence: 'Adjacent — ML fraud model built but not primary focus', match: 68 },
                  { skill: 'Git', status: '⚠', evidence: 'GitHub profile present — contribution depth unclear', match: 60 },
                ].map(s => (
                  <div key={s.skill} style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    padding: '12px 0', borderBottom: '1px solid var(--border-subtle)'
                  }}>
                    <div style={{ width: 32, textAlign: 'center', fontSize: '1rem' }}>{s.status}</div>
                    <div style={{ width: 110, fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{s.skill}</div>
                    <div style={{ flex: 1, fontSize: '0.82rem', color: 'var(--text-muted)' }}>{s.evidence}</div>
                    <div className="flex items-center gap-2" style={{ width: 160 }}>
                      <div className="progress-bar" style={{ flex: 1 }}>
                        <div className="progress-fill" style={{
                          width: `${s.match}%`,
                          background: s.match >= 80 ? 'linear-gradient(90deg,#10b981,#06b6d4)' : 'linear-gradient(90deg,#f59e0b,#f43f5e)'
                        }} />
                      </div>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', width: 40, textAlign: 'right' }}>{s.match}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Tab: Decision */}
          {activeTab === 'decision' && (
            <div className="glass-card" style={{ padding: 32, borderColor: 'var(--border-brand)' }}>
              <div className="flex items-center gap-3" style={{ marginBottom: 24 }}>
                <span style={{ fontSize: '1.5rem' }}>⚖️</span>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)' }}>Human Review Decision</h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    AI provides evidence. You make the decision. All actions are logged.
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="grid-3" style={{ marginBottom: 28 }}>
                {[
                  { label: 'Resume AI', status: '✅ Complete', color: '#10b981' },
                  { label: 'Match Score', status: '✅ 91% — Excellent', color: '#10b981' },
                  { label: 'Interview AI', status: '✅ Analyzed', color: '#10b981' },
                ].map(s => (
                  <div key={s.label} style={{
                    padding: '16px', background: 'rgba(16,185,129,0.06)',
                    border: `1px solid ${s.color}33`,
                    borderRadius: 'var(--radius-lg)', textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6 }}>{s.label}</div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: s.color }}>{s.status}</div>
                  </div>
                ))}
              </div>

              {/* Notes */}
              <div className="form-group" style={{ marginBottom: 24 }}>
                <label className="form-label">Recruiter Notes (optional)</label>
                <textarea
                  id="recruiter-notes"
                  className="form-input form-textarea"
                  placeholder="Add any notes about this candidate before making a decision..."
                />
              </div>

              <div className="flex gap-3">
                <button className="btn btn-primary btn-lg" id="decision-shortlist" style={{ flex: 1 }}>
                  ✅ Shortlist Candidate
                </button>
                <button className="btn btn-secondary btn-lg" id="decision-hold" style={{ flex: 1 }}>
                  ⏸ Put on Hold
                </button>
                <button className="btn btn-danger" id="decision-reject" style={{ flex: 1 }}>
                  ✕ Reject
                </button>
              </div>

              <div style={{ marginTop: 16, fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                Decision will be logged with timestamp, recruiter ID, and AI evidence snapshot.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
