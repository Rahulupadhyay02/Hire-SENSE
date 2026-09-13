import { useState } from 'react'
import { X, Copy, Check, Clock, MessageSquare, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'

export default function InterviewTranscriptModal({ interview, onClose }) {
  const [copied, setCopied] = useState(false)
  const [expandedSegments, setExpandedSegments] = useState(true)

  if (!interview) return null

  const segments = interview.transcript_segments || []
  const transcript = interview.transcript || ''
  const duration = interview.duration_seconds

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  function formatFileSize(bytes) {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(transcript)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* ignore */ }
  }

  return (
    <div className="iv-modal-overlay" onClick={onClose}>
      <div className="iv-modal-panel" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="iv-modal-header">
          <div className="iv-modal-title-area">
            <MessageSquare size={20} className="iv-modal-icon" />
            <div>
              <h3 className="iv-modal-title">Interview Transcript</h3>
              <p className="iv-modal-subtitle">{interview.original_filename}</p>
            </div>
          </div>
          <button className="iv-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Meta strip */}
        <div className="iv-modal-meta">
          <span className="iv-meta-chip">
            <Clock size={12} />
            {duration ? formatTime(duration) : 'Unknown duration'}
          </span>
          <span className="iv-meta-chip">
            {formatFileSize(interview.file_size_bytes)}
          </span>
          <span className="iv-meta-chip iv-meta-type">
            {interview.file_type}
          </span>
          <span className="iv-meta-chip iv-meta-segs">
            {segments.length} segments
          </span>
        </div>

        {/* Responsible AI Notice */}
        <div className="iv-ai-notice">
          <AlertCircle size={14} className="iv-ai-notice-icon" />
          <span>
            <strong>AI-Generated Transcript:</strong> Speech recognition may contain errors.
            Always review the transcript for accuracy before making decisions.
          </span>
        </div>

        {/* Scrollable content */}
        <div className="iv-modal-body">
          {/* Phase 7: Communication Quality Metrics Strip */}
          {(interview.metrics_json || interview.communication_score != null) && (
            <div className="iv-section" style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px',
              marginBottom: 20
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--brand-primary)' }}>
                  🎙️ Phase 7 Communication Scorecard
                </span>
                <span style={{
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  color: '#10b981',
                  background: 'rgba(16, 185, 129, 0.1)',
                  padding: '2px 10px',
                  borderRadius: 12
                }}>
                  Overall: {interview.communication_score || interview.metrics_json?.overall_score}%
                </span>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                gap: 10,
                textAlign: 'center'
              }}>
                <div style={{ background: 'var(--bg-card)', padding: '10px 8px', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {interview.metrics_json?.wpm ?? '—'} <span style={{ fontSize: '0.72rem', fontWeight: 500, color: 'var(--text-muted)' }}>WPM</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>Speaking Pace</div>
                </div>
                <div style={{ background: 'var(--bg-card)', padding: '10px 8px', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: (interview.metrics_json?.filler_word_rate ?? 0) < 4 ? '#10b981' : '#f59e0b' }}>
                    {interview.metrics_json?.filler_word_rate ?? 0}%
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>Filler Rate</div>
                </div>
                <div style={{ background: 'var(--bg-card)', padding: '10px 8px', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#3d6eff' }}>
                    {interview.metrics_json?.structure_score ?? '—'}/100
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>STAR Structure</div>
                </div>
                <div style={{ background: 'var(--bg-card)', padding: '10px 8px', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#8b5cf6' }}>
                    {interview.metrics_json?.clarity_score ?? '—'}/100
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>Clarity Score</div>
                </div>
                <div style={{ background: 'var(--bg-card)', padding: '10px 8px', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#06b6d4' }}>
                    {interview.metrics_json?.relevance_score ?? '—'}/100
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>Skill Relevance</div>
                </div>
              </div>
            </div>
          )}
          {/* Full transcript */}
          <div className="iv-section">
            <div className="iv-section-header">
              <h4 className="iv-section-title">Full Transcript</h4>
              <button className="iv-copy-btn" onClick={handleCopy}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="iv-transcript-text">
              {transcript || <span className="iv-empty">No transcript available.</span>}
            </div>
          </div>

          {/* Timestamped segments */}
          {segments.length > 0 && (
            <div className="iv-section">
              <div
                className="iv-section-header iv-section-header-clickable"
                onClick={() => setExpandedSegments(v => !v)}
              >
                <h4 className="iv-section-title">Timeline ({segments.length} segments)</h4>
                {expandedSegments ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
              {expandedSegments && (
                <div className="iv-segments-list">
                  {segments.map((seg, i) => (
                    <div key={i} className="iv-segment-row">
                      <span className="iv-segment-time">
                        {formatTime(seg.start)} – {formatTime(seg.end)}
                      </span>
                      <p className="iv-segment-text">{seg.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
