import { useTheme } from '../context/ThemeContext'

// ── Theme-aware colour helpers ──────────────────
export function useChartColors() {
  const { isDark } = useTheme()
  return {
    isDark,
    tickFill:      isDark ? '#94A3B8' : '#475569',
    labelFill:     isDark ? '#CBD5E1' : '#1E293B',
    gridStroke:    isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
    polarGrid:     isDark ? 'rgba(255,255,255,0.12)' : '#CBD5E1',
    ringText:      isDark ? '#FFFFFF' : '#0F172A',
    tooltipBg:     isDark ? '#101726' : '#FFFFFF',
    tooltipBorder: isDark ? 'rgba(255,255,255,0.15)' : '#CBD5E1',
    tooltipText:   isDark ? '#FFFFFF' : '#0F172A',
    tooltipSub:    isDark ? '#94A3B8' : '#64748B',
    radarStroke:   isDark ? '#818CF8' : '#4F46E5',
    radarFill:     isDark ? '#6366F1' : '#6366F1',
    primary:       isDark ? '#3B82F6' : '#2563EB',
    emerald:       isDark ? '#10B981' : '#059669',
    amber:         isDark ? '#F59E0B' : '#D97706',
    violet:        isDark ? '#A855F7' : '#7C3AED',
  }
}

// ── Score Ring ─────────────────────────────────
export function ScoreRing({ score, size = 120, strokeWidth = 10, label, textColor }) {
  const { ringText, gridStroke } = useChartColors()
  const radius = (size - strokeWidth) / 2
  const circ = 2 * Math.PI * radius
  const filled = (score / 100) * circ

  // Select gradient based on score value
  const gradId = score >= 80 ? 'scoreGradGreen' : score >= 60 ? 'scoreGradAmber' : 'scoreGradBlue'

  return (
    <div className="score-ring-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="scoreGradBlue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
          <linearGradient id="scoreGradGreen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="scoreGradAmber" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
        </defs>
        {/* Background track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={gridStroke}
          strokeWidth={strokeWidth}
        />
        {/* Filled arc */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={`url(#${gradId})`}
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
          fill={textColor || ringText}
          fontSize={size * 0.22}
          fontFamily="Inter, -apple-system, sans-serif"
          fontWeight="800"
        >
          {score}%
        </text>
      </svg>
      {label && <div className="score-ring-label" style={{ color: 'var(--text-muted)' }}>{label}</div>}
    </div>
  )
}

// ── Skill match bar ────────────────────────────
export function SkillMatchBar({ label, value, max = 100 }) {
  const pct = (value / max) * 100
  const color = pct >= 80 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#f43f5e'
  return (
    <div className="metric-bar-row">
      <div className="metric-bar-label" style={{ color: 'var(--text-primary)' }}>{label}</div>
      <div className="progress-bar" style={{ flex: 1, background: 'var(--border-subtle)' }}>
        <div
          className="progress-fill"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}aa)` }}
        />
      </div>
      <div className="metric-bar-value" style={{ color, fontWeight: 700 }}>{value}%</div>
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
