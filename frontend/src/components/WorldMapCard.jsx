import { useState } from 'react'

export default function WorldMapCard() {
  const [showMap, setShowMap] = useState(true)
  const [hoveredRegion, setHoveredRegion] = useState(null)

  const regionalStats = [
    { name: 'North America (US & Canada)', members: 298, pending: 210 },
    { name: 'India & South Asia', members: 192, pending: 175 },
    { name: 'Western Europe (UK & Germany)', members: 94, pending: 78 },
    { name: 'Southeast Asia (Singapore)', members: 38, pending: 36 },
    { name: 'Latin America (Brazil)', members: 20, pending: 20 },
  ]

  return (
    <div style={{ background: '#161924', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 14, padding: 16, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ fontSize: '0.94rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>Countries Hired In</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', color: '#94A3B8' }}>
          <span>Show Map</span>
          <label className="ios-toggle">
            <input
              type="checkbox"
              checked={showMap}
              onChange={(e) => setShowMap(e.target.checked)}
            />
            <span className="ios-slider"></span>
          </label>
        </div>
      </div>

      {/* Map or List View */}
      {showMap ? (
        <div style={{ position: 'relative', width: '100%', minHeight: '190px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {hoveredRegion && (
            <div
              style={{
                position: 'absolute',
                top: 6,
                right: 8,
                background: '#1E2232',
                border: '1px solid rgba(37, 99, 235, 0.4)',
                borderRadius: '8px',
                padding: '4px 10px',
                fontSize: '0.74rem',
                color: '#FFFFFF',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                pointerEvents: 'none',
                zIndex: 10
              }}
            >
              <div style={{ fontWeight: 600, color: '#FFFFFF' }}>{hoveredRegion.name}</div>
              <div>Members: {hoveredRegion.members} | Pending: {hoveredRegion.pending}</div>
            </div>
          )}

          {/* High-fidelity Vector World Map */}
          <svg
            viewBox="0 0 1000 480"
            style={{ width: '100%', height: 'auto', maxHeight: '180px', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))' }}
          >
            <defs>
              <linearGradient id="activeBlueGradMap" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#1D4ED8" />
              </linearGradient>
              <filter id="glowMap" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Inactive continents base outlines (Dark charcoal #202433) */}
            <g fill="#202433" stroke="#2B3145" strokeWidth="0.75">
              <path d="M310,25 Q350,15 375,35 Q360,95 320,80 Z" />
              <path d="M120,40 Q180,25 240,45 Q210,70 140,65 Z" />
              <path d="M165,195 Q195,215 220,240 Q195,245 170,205 Z" />
              <path d="M470,165 Q540,160 570,220 Q560,330 510,360 Q465,300 450,220 Z" />
              <path d="M600,55 Q780,45 880,95 Q820,160 670,165 Q590,140 600,55 Z" />
              <path d="M200,455 Q500,440 800,455 Q500,475 200,455 Z" />
            </g>

            {/* Active Highlighted Countries (Vivid Electric Blue #2563EB) */}
            <g filter="url(#glowMap)" style={{ cursor: 'pointer' }}>
              {/* North America */}
              <path
                d="M100,70 Q240,60 280,100 Q260,170 170,190 Q120,160 95,110 Z"
                fill="url(#activeBlueGradMap)"
                stroke="#60A5FA"
                strokeWidth="1"
                onMouseEnter={() => setHoveredRegion(regionalStats[0])}
                onMouseLeave={() => setHoveredRegion(null)}
              />

              {/* South America */}
              <path
                d="M230,245 Q310,240 330,295 Q305,395 250,380 Q220,310 230,245 Z"
                fill="url(#activeBlueGradMap)"
                stroke="#60A5FA"
                strokeWidth="1"
                onMouseEnter={() => setHoveredRegion(regionalStats[4])}
                onMouseLeave={() => setHoveredRegion(null)}
              />

              {/* Western Europe */}
              <path
                d="M455,100 Q515,95 530,140 Q495,165 460,145 Z"
                fill="url(#activeBlueGradMap)"
                stroke="#60A5FA"
                strokeWidth="1"
                onMouseEnter={() => setHoveredRegion(regionalStats[2])}
                onMouseLeave={() => setHoveredRegion(null)}
              />

              {/* India / South Asia */}
              <path
                d="M660,175 Q720,180 735,225 Q690,290 665,260 Q650,210 660,175 Z"
                fill="url(#activeBlueGradMap)"
                stroke="#60A5FA"
                strokeWidth="1"
                onMouseEnter={() => setHoveredRegion(regionalStats[1])}
                onMouseLeave={() => setHoveredRegion(null)}
              />

              {/* Southeast Asia */}
              <path
                d="M745,260 Q800,270 820,310 Q770,325 745,285 Z"
                fill="url(#activeBlueGradMap)"
                stroke="#60A5FA"
                strokeWidth="1"
                onMouseEnter={() => setHoveredRegion(regionalStats[3])}
                onMouseLeave={() => setHoveredRegion(null)}
              />

              {/* Australia */}
              <path
                d="M780,335 Q880,330 900,390 Q840,430 780,395 Z"
                fill="url(#activeBlueGradMap)"
                stroke="#60A5FA"
                strokeWidth="1"
                onMouseEnter={() => setHoveredRegion({ name: 'Australia & ANZ', members: 42, pending: 28 })}
                onMouseLeave={() => setHoveredRegion(null)}
              />
            </g>

            {/* Glowing Map Hub Markers */}
            <circle cx="180" cy="130" r="4" fill="#FFFFFF" filter="url(#glowMap)" />
            <circle cx="490" cy="120" r="3.5" fill="#FFFFFF" filter="url(#glowMap)" />
            <circle cx="690" cy="225" r="4" fill="#FFFFFF" filter="url(#glowMap)" />
            <circle cx="780" cy="285" r="3.5" fill="#FFFFFF" filter="url(#glowMap)" />
            <circle cx="280" cy="300" r="3" fill="#FFFFFF" filter="url(#glowMap)" />
          </svg>
        </div>
      ) : (
        /* List breakdown view */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '6px 0', minHeight: '190px' }}>
          {regionalStats.map(r => (
            <div
              key={r.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                background: '#11131C',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.05)'
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 500, color: '#E2E8F0' }}>{r.name}</div>
              <div style={{ display: 'flex', gap: '12px', fontSize: '0.78rem' }}>
                <span style={{ color: '#60A5FA', fontWeight: 600 }}>{r.members} active</span>
                <span style={{ color: '#94A3B8' }}>{r.pending} pending</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer Stats Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FFFFFF', boxShadow: '0 0 8px rgba(255, 255, 255, 0.6)' }} />
          <span style={{ fontSize: '0.76rem', color: '#94A3B8' }}>Engagement Team Member</span>
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFFFFF' }}>642</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#94A3B8' }} />
          <span style={{ fontSize: '0.76rem', color: '#94A3B8' }}>Pending Hires</span>
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFFFFF' }}>519</span>
        </div>
      </div>
    </div>
  )
}
