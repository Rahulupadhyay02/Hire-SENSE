import { useState, useId } from 'react'
import { Plus, Trash2, Sliders, RefreshCw, Sparkles, AlertTriangle, CheckCircle, Info } from 'lucide-react'

export const DEFAULT_CRITERIA = [
  { id: 'skills', label: 'Skills', weight: 45, description: 'Core technical stack & programming capabilities', color: '#3B82F6' },
  { id: 'experience', label: 'Experience', weight: 20, description: 'Years of hands-on professional tenure & seniority', color: '#10B981' },
  { id: 'projects', label: 'Projects', weight: 20, description: 'Practical portfolio & applied engineering evidence', color: '#8B5CF6' },
  { id: 'requirements', label: 'Requirements', weight: 15, description: 'Mandatory job prerequisite coverage', color: '#F59E0B' },
]

const PRESETS = [
  {
    name: 'Balanced Default',
    weights: { skills: 45, experience: 20, projects: 20, requirements: 15 }
  },
  {
    name: 'Skills-Heavy (60%)',
    weights: { skills: 60, experience: 10, projects: 20, requirements: 10 }
  },
  {
    name: 'Seniority-Focused',
    weights: { skills: 30, experience: 40, projects: 20, requirements: 10 }
  },
  {
    name: 'Project-Centric',
    weights: { skills: 35, experience: 15, projects: 40, requirements: 10 }
  }
]

export default function MatchFormulaEditor({ value, onChange, compact = false }) {
  const [newLabel, setNewLabel] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const inputId = useId()

  // Initialize criteria from value or defaults
  const criteria = (value?.criteria && value.criteria.length > 0)
    ? value.criteria.map(c => ({
        ...c,
        color: c.color || (
          c.id === 'skills' ? '#3B82F6' :
          c.id === 'experience' ? '#10B981' :
          c.id === 'projects' ? '#8B5CF6' :
          c.id === 'requirements' ? '#F59E0B' : '#EC4899'
        )
      }))
    : DEFAULT_CRITERIA

  const totalWeight = criteria.reduce((sum, c) => sum + (Number(c.weight) || 0), 0)
  const isBalanced = totalWeight === 100

  const updateCriteriaList = (newList) => {
    onChange({ criteria: newList })
  }

  const handleWeightChange = (index, newWeight) => {
    const val = Math.max(0, Math.min(100, Number(newWeight) || 0))
    const updated = [...criteria]
    updated[index] = { ...updated[index], weight: val }
    updateCriteriaList(updated)
  }

  const handleAddCustomCriterion = (e) => {
    e.preventDefault()
    if (!newLabel.trim()) return

    const id = newLabel.trim().toLowerCase().replace(/\s+/g, '_')
    const exists = criteria.some(c => c.id === id)
    if (exists) {
      alert('A criterion with this name already exists.')
      return
    }

    const newCriterion = {
      id,
      label: newLabel.trim(),
      weight: 10,
      description: 'Custom recruiter evaluation criterion',
      color: '#EC4899',
      isCustom: true
    }

    updateCriteriaList([...criteria, newCriterion])
    setNewLabel('')
    setShowAddForm(false)
  }

  const handleDeleteCriterion = (index) => {
    if (criteria.length <= 1) {
      alert('You must retain at least one evaluation factor.')
      return
    }
    const updated = criteria.filter((_, i) => i !== index)
    updateCriteriaList(updated)
  }

  const handleApplyPreset = (preset) => {
    const updated = criteria.map(c => ({
      ...c,
      weight: preset.weights[c.id] !== undefined ? preset.weights[c.id] : 0
    }))
    updateCriteriaList(updated)
  }

  const handleAutoBalance = () => {
    if (criteria.length === 0) return
    const sum = criteria.reduce((s, c) => s + (Number(c.weight) || 0), 0)
    if (sum === 0) {
      const equalShare = Math.floor(100 / criteria.length)
      const remainder = 100 - (equalShare * criteria.length)
      const updated = criteria.map((c, i) => ({
        ...c,
        weight: equalShare + (i === 0 ? remainder : 0)
      }))
      updateCriteriaList(updated)
      return
    }

    let allocated = 0
    const scaled = criteria.map((c, idx) => {
      if (idx === criteria.length - 1) {
        return { ...c, weight: Math.max(0, 100 - allocated) }
      }
      const w = Math.round((c.weight / sum) * 100)
      allocated += w
      return { ...c, weight: w }
    })
    updateCriteriaList(scaled)
  }

  const handleResetDefaults = () => {
    updateCriteriaList(DEFAULT_CRITERIA)
  }

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: 'var(--radius-lg, 12px)',
      padding: compact ? '16px' : '22px',
      position: 'relative'
    }}>
      {/* Header & Autonomous badge */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: 'rgba(255, 255, 255, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#FFFFFF'
            }}>
              <Sliders size={16} />
            </div>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.05rem',
              fontWeight: 700,
              color: '#FFFFFF',
              margin: 0
            }}>
              Recruiter Match Formula & Weights
            </h3>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: 4, marginBottom: 0 }}>
            You are the boss of this job's evaluation. Tune factor percentages or add custom criteria. All candidates will be scored strictly by your formula.
          </p>
        </div>

        {/* Total weight badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 12px',
          borderRadius: 20,
          background: isBalanced ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
          border: `1px solid ${isBalanced ? 'rgba(16, 185, 129, 0.35)' : 'rgba(245, 158, 11, 0.35)'}`,
          color: isBalanced ? '#10B981' : '#F59E0B',
          fontSize: '0.8rem',
          fontWeight: 700,
          whiteSpace: 'nowrap'
        }}>
          {isBalanced ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
          <span>{totalWeight}% / 100% Total</span>
        </div>
      </div>

      {/* Segmented Distribution Bar */}
      <div style={{
        height: 10,
        width: '100%',
        borderRadius: 5,
        background: 'rgba(255, 255, 255, 0.08)',
        display: 'flex',
        overflow: 'hidden',
        marginBottom: 16
      }}>
        {criteria.map((c) => {
          const widthPct = totalWeight > 0 ? (c.weight / totalWeight) * 100 : 0
          if (widthPct <= 0) return null
          return (
            <div
              key={c.id}
              style={{
                width: `${widthPct}%`,
                height: '100%',
                background: c.color,
                transition: 'width 0.2s ease',
                position: 'relative'
              }}
              title={`${c.label}: ${c.weight}%`}
            />
          )
        })}
      </div>

      {/* Quick Presets Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
        <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Presets:
        </span>
        {PRESETS.map(preset => (
          <button
            key={preset.name}
            type="button"
            className="btn btn-secondary btn-sm"
            style={{
              fontSize: '0.74rem',
              padding: '4px 10px',
              borderRadius: 6,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
            onClick={() => handleApplyPreset(preset)}
          >
            {preset.name}
          </button>
        ))}
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          style={{
            fontSize: '0.74rem',
            padding: '4px 10px',
            borderRadius: 6,
            background: 'rgba(59, 130, 246, 0.1)',
            borderColor: 'rgba(59, 130, 246, 0.3)',
            color: '#60A5FA',
            marginLeft: 'auto'
          }}
          onClick={handleAutoBalance}
        >
          <Sparkles size={12} style={{ marginRight: 4 }} />
          Auto-Balance to 100%
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          style={{
            fontSize: '0.74rem',
            padding: '4px 10px',
            borderRadius: 6,
            background: 'rgba(255, 255, 255, 0.05)'
          }}
          onClick={handleResetDefaults}
          title="Reset to 45% Skills, 20% Exp, 20% Proj, 15% Req"
        >
          <RefreshCw size={12} style={{ marginRight: 4 }} />
          Reset Defaults
        </button>
      </div>

      {/* Criteria Card List (CRUD Table/Rows) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        {criteria.map((item, index) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 14,
              padding: '12px 14px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: 8
            }}
          >
            {/* Factor Label & Info */}
            <div style={{ minWidth: 160, flex: '0 0 auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
                <span style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '0.88rem' }}>
                  {item.label}
                </span>
                {item.isCustom && (
                  <span style={{
                    fontSize: '0.65rem',
                    background: 'rgba(236, 72, 153, 0.15)',
                    color: '#F472B6',
                    padding: '2px 6px',
                    borderRadius: 4,
                    fontWeight: 600
                  }}>
                    Custom
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: 2, paddingLeft: 16 }}>
                {item.description}
              </div>
            </div>

            {/* Slider */}
            <div style={{ flex: 1, margin: '0 10px', display: 'flex', alignItems: 'center' }}>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={item.weight}
                onChange={(e) => handleWeightChange(index, e.target.value)}
                style={{
                  width: '100%',
                  cursor: 'pointer',
                  accentColor: item.color
                }}
              />
            </div>

            {/* Number Input & Percentage */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ position: 'relative', width: 68 }}>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={item.weight}
                  onChange={(e) => handleWeightChange(index, e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 20px 6px 8px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: 6,
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    textAlign: 'right'
                  }}
                />
                <span style={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94A3B8',
                  fontSize: '0.75rem',
                  pointerEvents: 'none'
                }}>
                  %
                </span>
              </div>

              {/* Delete Criterion Action (CRUD Delete) */}
              <button
                type="button"
                onClick={() => handleDeleteCriterion(index)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748B',
                  cursor: 'pointer',
                  padding: 6,
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#EF4444'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#64748B'}
                title={`Remove ${item.label} factor`}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Custom Criterion Row (CRUD Create) */}
      {!showAddForm ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{
              fontSize: '0.78rem',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px dashed rgba(255, 255, 255, 0.2)'
            }}
            onClick={() => setShowAddForm(true)}
          >
            <Plus size={14} /> Add Custom Evaluation Factor
          </button>
          {!isBalanced && (
            <span style={{ fontSize: '0.75rem', color: '#F59E0B', display: 'flex', alignItems: 'center', gap: 4 }}>
              <AlertTriangle size={13} /> Sum is {totalWeight}%. Click "Auto-Balance" or adjust sliders to equal 100%.
            </span>
          )}
        </div>
      ) : (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 14px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 8,
          border: '1px solid rgba(255, 255, 255, 0.15)'
        }}>
          <label htmlFor={inputId} className="sr-only">New Criterion Name</label>
          <input
            id={inputId}
            type="text"
            className="form-input"
            placeholder="e.g. Certifications, System Architecture, Domain Knowledge..."
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            style={{ flex: 1, fontSize: '0.85rem', padding: '6px 12px' }}
            autoFocus
          />
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleAddCustomCriterion}
            disabled={!newLabel.trim()}
          >
            Add Factor
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setShowAddForm(false)
              setNewLabel('')
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}
