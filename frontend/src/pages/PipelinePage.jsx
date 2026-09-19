import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import { useNavigate } from 'react-router-dom'
import {
  Briefcase,
  ClipboardList,
  FileText,
  Target,
  Mic,
  BarChart2,
  Scale,
  CheckCircle2,
} from 'lucide-react'

const stages = [
  { label: 'Job Posted', icon: Briefcase, count: 8, color: '#3d6eff' },
  { label: 'Applied', icon: ClipboardList, count: 140, color: '#06b6d4' },
  { label: 'Resume AI', icon: FileText, count: 120, color: '#8b5cf6' },
  { label: 'Matched', icon: Target, count: 98, color: '#ec4899' },
  { label: 'Interview', icon: Mic, count: 52, color: '#f59e0b' },
  { label: 'AI Report', icon: BarChart2, count: 41, color: '#10b981' },
  { label: 'Human Review', icon: Scale, count: 35, color: '#14b8a6' },
  { label: 'Decision', icon: CheckCircle2, count: 28, color: '#10b981' },
]

const pipelineCandidates = [
  { name: 'Priya Mehta', stage: 'Human Review', score: 91, job: 'Python Dev', avatar: 'PM', color: '#3d6eff' },
  { name: 'Sneha Patel', stage: 'Human Review', score: 85, job: 'ML Engineer', avatar: 'SP', color: '#8b5cf6' },
  { name: 'Arjun Kumar', stage: 'AI Report', score: 78, job: 'Full Stack', avatar: 'AK', color: '#06b6d4' },
  { name: 'Ananya Singh', stage: 'Interview', score: 73, job: 'Data Analyst', avatar: 'AS', color: '#ec4899' },
  { name: 'Rohit Joshi', stage: 'Matched', score: 62, job: 'Backend Dev', avatar: 'RJ', color: '#f59e0b' },
  { name: 'Vikram Rao', stage: 'Resume AI', score: 55, job: 'Python Dev', avatar: 'VR', color: '#14b8a6' },
]

const stageOrder = ['Job Posted', 'Applied', 'Resume AI', 'Matched', 'Interview', 'AI Report', 'Human Review', 'Decision']

export default function PipelinePage() {
  const navigate = useNavigate()

  return (
    <div className="app-layout">
      <Sidebar role="recruiter" />
      <div className="main-content">
        <Topbar title="Hiring Pipeline" subtitle="Track all candidates through the process" />

        <div className="page-content">
          <div className="flex items-center justify-between" style={{ marginBottom: 28 }}>
            <div>
              <h1 className="page-title">Hiring Pipeline</h1>
              <p className="page-subtitle">End-to-end view across all jobs · 140 total candidates</p>
            </div>
          </div>

          {/* Funnel Visualization */}
          <div className="chart-card" style={{ marginBottom: 24 }}>
            <div className="chart-header">
              <div className="chart-title">Hiring Funnel</div>
              <div className="chart-subtitle">Candidate drop-off across stages</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {stages.map((s, i) => {
                const pct = (s.count / 140) * 100
                const w = 30 + (s.count / 140) * 70
                  const Icon = s.icon
                  return (
                    <div key={s.label} className="flex items-center gap-4">
                      <div style={{ width: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={16} color={s.color} />
                      </div>
                    <div style={{ width: 110, fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{s.label}</div>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        height: 32,
                        width: `${w}%`,
                        background: `linear-gradient(90deg, ${s.color}dd, ${s.color}55)`,
                        borderRadius: 'var(--radius-md)',
                        display: 'flex', alignItems: 'center', paddingLeft: 12,
                        transition: 'width 1s cubic-bezier(0.16,1,0.3,1)',
                        position: 'relative',
                        boxShadow: `0 0 20px ${s.color}22`
                      }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>{s.count}</span>
                      </div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{Math.round(pct)}%</span>
                      {i > 0 && (
                        <span style={{ fontSize: '0.72rem', color: '#f43f5e' }}>
                          −{stages[i-1].count - s.count} dropped
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Kanban-style pipeline */}
          <div style={{ marginBottom: 16 }}>
            <div className="chart-title" style={{ marginBottom: 16 }}>Candidate Positions</div>
          </div>

          <div style={{ overflowX: 'auto', paddingBottom: 16 }}>
            <div style={{ display: 'flex', gap: 16, minWidth: 900 }}>
              {['Matched', 'Interview', 'AI Report', 'Human Review'].map(stage => {
                const inStage = pipelineCandidates.filter(c => c.stage === stage)
                return (
                  <div key={stage} style={{
                    flex: 1, minWidth: 200,
                    background: '#f1f5f9',
                    border: '1px solid #e2e8f0',
                    borderRadius: 'var(--radius-xl)',
                    padding: '16px'
                  }}>
                    <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{stage}</div>
                      <span className="badge badge-muted">{inStage.length || 8}</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {inStage.map(c => (
                        <div key={c.name} style={{
                          padding: '12px', background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: 'var(--radius-lg)',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                          cursor: 'pointer', transition: 'all 0.2s'
                        }}
                          onMouseOver={e => {
                            e.currentTarget.style.borderColor = '#93c5fd'
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'
                          }}
                          onMouseOut={e => {
                            e.currentTarget.style.borderColor = '#e2e8f0'
                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.03)'
                          }}
                          onClick={() => navigate('/recruiter/report')}
                        >
                          <div className="flex items-center gap-2" style={{ marginBottom: 8 }}>
                            <div style={{
                              width: 30, height: 30, borderRadius: '50%',
                              background: `linear-gradient(135deg, ${c.color}, ${c.color}88)`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '0.7rem', fontWeight: 800, color: '#fff', flexShrink: 0
                            }}>
                              {c.avatar}
                            </div>
                            <div>
                              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{c.job}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="progress-bar" style={{ flex: 1 }}>
                              <div className="progress-fill" style={{
                                width: `${c.score}%`,
                                background: `linear-gradient(90deg, ${c.color}, ${c.color}88)`
                              }} />
                            </div>
                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: c.color }}>{c.score}%</span>
                          </div>
                        </div>
                      ))}

                      {/* Placeholder cards */}
                      {[...Array(Math.max(0, 2 - inStage.length))].map((_, i) => (
                        <div key={i} style={{
                          padding: '20px', background: 'rgba(255,255,255,0.015)',
                          border: '1px dashed var(--border-subtle)',
                          borderRadius: 'var(--radius-lg)',
                          textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)'
                        }}>
                          + candidates
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
