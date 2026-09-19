import { useTheme } from '../context/ThemeContext'

// ── Theme-aware colour helpers ──────────────────
export function useChartColors() {
  const { isDark } = useTheme()
  return {
    tickFill:      isDark ? '#a8b4d4' : '#64748b',
    labelFill:     isDark ? '#cbd5e1' : '#334155',
    gridStroke:    isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
    polarGrid:     isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0',
    ringText:      isDark ? '#f8faff' : '#0f172a',
    tooltipBg:     isDark ? 'rgba(15,22,66,0.98)' : '#ffffff',
    tooltipBorder: isDark ? 'rgba(255,255,255,0.15)' : '#e2e8f0',
    tooltipText:   isDark ? '#f8faff' : '#0f172a',
    tooltipSub:    isDark ? '#94a3b8' : '#64748b',
  }
}

// ── Score Ring ─────────────────────────────────
export function ScoreRing({ score, size = 120, strokeWidth = 10, label }) {
  const { ringText } = useChartColors()
  const radius = (size - strokeWidth) / 2
  const circ = 2 * Math.PI * radius
  const filled = (score / 100) * circ

  return (
    <div className="score-ring-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <linearGradient id="scoreGradGreen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="scoreGradAmber" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>
        {/* Background track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
        />
        {/* Filled arc */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke="url(#scoreGrad)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circ}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dasharray 1s cubic-bezier(0.16,1,0.3,1)' }}
        />
        {/* Center text — theme-aware */}
        <text
          x={size / 2} y={size / 2}
          textAnchor="middle" dominantBaseline="middle"
          fill={ringText}
          fontSize={size * 0.22}
          fontFamily="Inter, -apple-system, sans-serif"
          fontWeight="800"
        >
          {score}%
        </text>
      </svg>
      {label && <div className="score-ring-label">{label}</div>}
    </div>
  )
}

// ── Skill match bar ────────────────────────────
export function SkillMatchBar({ label, value, max = 100 }) {
  const pct = (value / max) * 100
  const color = pct >= 80 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#f43f5e'
  return (
    <div className="metric-bar-row">
      <div className="metric-bar-label">{label}</div>
      <div className="progress-bar" style={{ flex: 1 }}>
        <div
          className="progress-fill"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}aa)` }}
        />
      </div>
      <div className="metric-bar-value" style={{ color }}>{value}%</div>
    </div>
  )
}

// ── Status badge ───────────────────────────────
export function StatusBadge({ status }) {
  const map = {
    'Shortlisted': 'badge-success',
    'Reviewing':   'badge-brand',
    'Pending':     'badge-warning',
    'Rejected':    'badge-danger',
    'Hold':        'badge-muted',
    'New':         'badge-cyan',
    'Active':      'badge-success',
    'Closed':      'badge-muted',
    'Draft':       'badge-muted',
  }
  return <span className={`badge ${map[status] || 'badge-muted'}`}>{status}</span>
}

// ── Sparkline ──────────────────────────────────
export function Sparkline({ data, color = '#3d6eff', height = 40, width = 120 }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((v - min) / (max - min || 1)) * (height - 8) - 4
    return `${x},${y}`
  })
  const path = 'M' + pts.join(' L')
  const area = path + ` L${width},${height} L0,${height} Z`
  const gradId = `spk${color.replace('#', '')}`

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
