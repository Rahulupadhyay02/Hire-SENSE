import { useState, useEffect } from 'react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import { ScoreRing, Sparkline, StatusBadge, useChartColors } from '../components/Charts'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, Users, Briefcase, CheckCircle, Clock, ArrowUpRight, ClipboardList, CheckCircle2, Target } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'

// ── Mock Data ──────────────────────────────────
const applicationsTrend = [
  { week: 'W1', apps: 12, shortlisted: 4, rejected: 5 },
  { week: 'W2', apps: 19, shortlisted: 7, rejected: 8 },
  { week: 'W3', apps: 15, shortlisted: 5, rejected: 6 },
  { week: 'W4', apps: 28, shortlisted: 11, rejected: 10 },
  { week: 'W5', apps: 22, shortlisted: 9, rejected: 8 },
  { week: 'W6', apps: 34, shortlisted: 14, rejected: 12 },
  { week: 'W7', apps: 29, shortlisted: 12, rejected: 10 },
  { week: 'W8', apps: 41, shortlisted: 18, rejected: 14 },
]

const stageData = [
  { name: 'New', value: 38, color: '#06b6d4' },
  { name: 'Reviewing', value: 24, color: '#3d6eff' },
  { name: 'Shortlisted', value: 18, color: '#10b981' },
  { name: 'Hold', value: 9,  color: '#f59e0b' },
  { name: 'Rejected', value: 23, color: '#f43f5e' },
]

const skillDemand = [
  { skill: 'Python', demand: 88 },
  { skill: 'React', demand: 76 },
  { skill: 'FastAPI', demand: 62 },
  { skill: 'SQL', demand: 71 },
  { skill: 'ML/AI', demand: 55 },
  { skill: 'Docker', demand: 49 },
  { skill: 'AWS', demand: 43 },
]

const recentCandidates = [
  { name: 'Priya Mehta', role: 'Python Developer', score: 91, status: 'Shortlisted', skills: ['Python', 'FastAPI', 'SQL'], time: '2h ago' },
  { name: 'Arjun Kumar', role: 'Full Stack Dev', score: 78, status: 'Reviewing', skills: ['React', 'Node', 'MongoDB'], time: '4h ago' },
  { name: 'Sneha Patel', role: 'ML Engineer', score: 85, status: 'Shortlisted', skills: ['Python', 'TensorFlow', 'SQL'], time: '6h ago' },
  { name: 'Rohit Joshi', role: 'Backend Dev', score: 62, status: 'Pending', skills: ['Java', 'Spring', 'MySQL'], time: '1d ago' },
  { name: 'Ananya Singh', role: 'Data Analyst', score: 73, status: 'Reviewing', skills: ['Python', 'Tableau', 'SQL'], time: '1d ago' },
]

const activeJobs = [
  { title: 'Senior Python Developer', apps: 34, score: 82 },
  { title: 'ML Engineer', apps: 21, score: 75 },
  { title: 'Full Stack Dev (React)', apps: 48, score: 68 },
  { title: 'Data Analyst', apps: 17, score: 79 },
]

const sparkData = [12, 19, 15, 28, 22, 34, 29, 41]

// ── Custom Tooltip (theme-aware) ────────────────
function ThemedTooltip({ active, payload, label }) {
  const { tooltipBg, tooltipBorder, tooltipText, tooltipSub } = useChartColors()
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: tooltipBg,
      border: `1px solid ${tooltipBorder}`,
      borderRadius: 10, padding: '10px 14px',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
    }}>
      <div style={{ fontWeight: 700, marginBottom: 6, color: tooltipText, fontFamily: 'var(--font-display)' }}>
        {label}
      </div>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2" style={{ fontSize: '0.82rem' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
          <span style={{ color: tooltipSub }}>{p.name}:</span>
          <span style={{ fontWeight: 600, color: tooltipText }}>{p.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function RecruiterDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { tickFill, gridStroke } = useChartColors()

  const [stats, setStats] = useState({
    totalApps: 140,
    shortlisted: 52,
    activeJobs: 4,
    avgMatch: 75,
  })

  useEffect(() => {
    async function loadStats() {
      try {
        const [jobsRes, appsRes] = await Promise.all([
          client.get('/jobs'),
          client.get('/applications')
        ])
        const jobsList = jobsRes.data || []
        const appsList = appsRes.data || []
        const activeJ = jobsList.filter(j => j.status?.toLowerCase() === 'active').length
        const shortl = appsList.filter(a => a.status === 'Shortlisted').length
        const avgM = appsList.length > 0
          ? Math.round(appsList.reduce((acc, a) => acc + (a.match_score || 0), 0) / appsList.length)
          : 75

        setStats({
          totalApps: appsList.length,
          shortlisted: shortl,
          activeJobs: activeJ,
          avgMatch: avgM,
        })
      } catch (err) {
        console.warn('Using default demo metrics:', err)
      }
    }
    loadStats()
  }, [])

  const statCards = [
    {
      label: 'Total Applications',
      value: String(stats.totalApps),
      change: '+18%',
      up: true,
      icon: ClipboardList,
      grad: 'var(--grad-brand)',
      data: sparkData,
      sparkColor: '#3d6eff'
    },
    {
      label: 'Shortlisted',
      value: String(stats.shortlisted),
      change: '+24%',
      up: true,
      icon: CheckCircle2,
      grad: 'var(--grad-emerald)',
      data: [4,7,5,11,9,14,12,18],
      sparkColor: '#10b981'
    },
    {
      label: 'Active Jobs',
      value: String(stats.activeJobs),
      change: '+2',
      up: true,
      icon: Briefcase,
      grad: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
      data: [3,4,5,5,6,7,7,8],
      sparkColor: '#8b5cf6'
    },
    {
      label: 'Avg Match Score',
      value: `${stats.avgMatch}%`,
      change: '-2%',
      up: false,
      icon: Target,
      grad: 'var(--grad-amber)',
      data: [71,74,78,75,73,76,78,76],
      sparkColor: '#f59e0b'
    },
  ]

  return (
    <div className="app-layout">
      <Sidebar role="recruiter" />
      <div className="main-content">
        <Topbar title="Dashboard" subtitle="Thu, 11 Sep 2026" role="recruiter" />

        <div className="page-content">
          {/* Header */}
          <div className="flex items-center justify-between" style={{ marginBottom: 28 }}>
            <div>
              <h1 className="page-title">Good morning, {user?.name ? user.name.split(' ')[0] : 'Recruiter'}</h1>
              <p className="page-subtitle">You have <strong style={{ color: 'var(--brand-400)' }}>{stats.totalApps} candidates</strong> in your hiring pipeline.</p>
            </div>
            <button className="btn btn-primary" id="btn-post-job" onClick={() => navigate('/recruiter/jobs')}>
              + Post New Job
            </button>
          </div>

          {/* Stat Cards */}
          <div className="grid-4" style={{ marginBottom: 28 }}>
            {statCards.map((s, i) => {
              const Icon = s.icon
              return (
                <div key={i} className="stat-card">
                  <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
                    <div className="stat-icon" style={{ background: s.grad.replace('var(--grad-brand)', 'linear-gradient(135deg,#3d6eff,#8b5cf6)'), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                      <Icon size={20} />
                    </div>
                    <Sparkline data={s.data} color={s.sparkColor} />
                  </div>
                  <div className="stat-value" style={{ background: s.grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {s.value}
                  </div>
                  <div className="stat-label">{s.label}</div>
                  <div className={`stat-change ${s.up ? 'up' : 'down'}`}>
                    {s.up ? '↑' : '↓'} {s.change} this week
                  </div>
                </div>
              )
            })}
          </div>

          {/* Charts Row 1 */}
          <div className="grid-2" style={{ marginBottom: 24 }}>
            {/* Applications Trend */}
            <div className="chart-card">
              <div className="chart-header">
                <div>
                  <div className="chart-title">Application Trend</div>
                  <div className="chart-subtitle">Weekly applications, shortlisted & rejected</div>
                </div>
                <span className="badge badge-brand">Last 8 weeks</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={applicationsTrend}>
                  <defs>
                    <linearGradient id="gradApps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#3d6eff" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3d6eff" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradShort" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis dataKey="week" tick={{ fill: tickFill, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: tickFill, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ThemedTooltip />} />
                  <Area type="monotone" dataKey="apps" name="Applications" stroke="#3d6eff" fill="url(#gradApps)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="shortlisted" name="Shortlisted" stroke="#10b981" fill="url(#gradShort)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Pipeline Stage Pie */}
            <div className="chart-card">
              <div className="chart-header">
                <div>
                  <div className="chart-title">Candidate Pipeline</div>
                  <div className="chart-subtitle">Distribution across hiring stages</div>
                </div>
                <span className="badge badge-muted">112 total</span>
              </div>
              <div className="flex items-center gap-8" style={{ height: 220 }}>
                <ResponsiveContainer width="55%" height="100%">
                  <PieChart>
                    <Pie
                      data={stageData}
                      cx="50%" cy="50%"
                      innerRadius={55} outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {stageData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v, n) => [v, n]}
                      contentStyle={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-default)',
                        borderRadius: 10, fontSize: 12,
                        color: 'var(--text-primary)'
                      }}
                      itemStyle={{ color: 'var(--text-primary)' }}
                      labelStyle={{ color: 'var(--text-primary)', fontWeight: 700 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {stageData.map(s => (
                    <div key={s.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{s.value}</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          ({Math.round(s.value / 112 * 100)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid-2" style={{ marginBottom: 24 }}>
            {/* Skill Demand Bar */}
            <div className="chart-card">
              <div className="chart-header">
                <div>
                  <div className="chart-title">Top Skills in Demand</div>
                  <div className="chart-subtitle">Across all active job postings</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={skillDemand} layout="vertical">
                  <defs>
                    <linearGradient id="gradBar" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#3d6eff" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} horizontal={false} />
                  <XAxis type="number" tick={{ fill: tickFill, fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <YAxis type="category" dataKey="skill" tick={{ fill: tickFill, fontSize: 11 }} axisLine={false} tickLine={false} width={55} />
                  <Tooltip content={<ThemedTooltip />} />
                  <Bar dataKey="demand" name="Match %" fill="url(#gradBar)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Active Jobs */}
            <div className="chart-card">
              <div className="chart-header">
                <div>
                  <div className="chart-title">Active Job Postings</div>
                  <div className="chart-subtitle">Applications and avg match score</div>
                </div>
                <button className="btn btn-secondary btn-sm" id="btn-view-jobs" onClick={() => navigate('/recruiter/jobs')}>
                  View All
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {activeJobs.map((job, i) => (
                  <div key={i} style={{
                    padding: '12px 14px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: 10,
                    border: '1px solid var(--border-subtle)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}
                    onMouseOver={e => e.currentTarget.style.borderColor = 'var(--border-brand)'}
                    onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                    onClick={() => navigate('/recruiter/candidates')}
                  >
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{job.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{job.apps} applications</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-display)',
                        background: 'var(--grad-brand)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                      }}>
                        {job.score}%
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>avg match</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Candidates Table */}
          <div className="table-container">
            <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div className="chart-title">Recent Candidates</div>
                <div className="chart-subtitle">Latest applications across all jobs</div>
              </div>
              <button className="btn btn-secondary btn-sm" id="btn-all-candidates" onClick={() => navigate('/recruiter/candidates')}>
                View All Candidates
              </button>
            </div>
            <div style={{ padding: 20 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Role Applied</th>
                    <th>Skills</th>
                    <th>Match Score</th>
                    <th>Status</th>
                    <th>Applied</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCandidates.map((c, i) => (
                    <tr key={i}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="candidate-avatar" style={{ width: 36, height: 36, fontSize: '0.85rem' }}>
                            {c.name.charAt(0)}
                          </div>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</span>
                        </div>
                      </td>
                      <td>{c.role}</td>
                      <td>
                        <div className="flex gap-1" style={{ flexWrap: 'wrap' }}>
                          {c.skills.slice(0, 2).map(sk => (
                            <span key={sk} className="skill-tag">{sk}</span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="progress-bar" style={{ width: 80 }}>
                            <div className="progress-fill" style={{
                              width: `${c.score}%`,
                              background: c.score >= 80 ? 'linear-gradient(90deg,#10b981,#06b6d4)' : c.score >= 70 ? 'linear-gradient(90deg,#3d6eff,#8b5cf6)' : 'linear-gradient(90deg,#f59e0b,#f43f5e)'
                            }} />
                          </div>
                          <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{c.score}%</span>
                        </div>
                      </td>
                      <td><StatusBadge status={c.status} /></td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{c.time}</td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
                          id={`btn-view-${i}`}
                          onClick={() => navigate('/recruiter/report')}
                        >
                          View Report
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
