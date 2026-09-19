import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Briefcase,
  ArrowRight,
  CheckCircle2,
  Users,
  Target,
  Mic,
  Scale,
  FileText,
  TrendingUp,
  ShieldCheck,
  Building2,
  Code2,
  Cpu,
  Layers,
  ChevronRight,
  Sliders,
  Sparkles,
  Lock,
  ExternalLink,
  Award,
  BookOpen,
  Activity,
  Check,
  Clock,
  Play,
  Volume2
} from 'lucide-react'

const topTierCompanies = [
  {
    id: 'stripe',
    name: 'Stripe',
    logo: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C17.652.88 15.08 0 12.396 0 7.396 0 3.738 2.533 3.738 7.086c0 4.498 3.518 6.223 7.574 7.64 2.518.882 3.398 1.579 3.398 2.536 0 1.018-.89 1.502-2.348 1.502-2.484 0-5.32-1.12-7.234-2.227L4.17 22.09c1.932 1.097 5.092 1.91 8.32 1.91 5.234 0 9.094-2.41 9.094-7.202 0-4.664-3.39-6.427-7.608-7.648z" fill="#635BFF"/>
      </svg>
    ),
    role: 'Staff Distributed Systems Engineer',
    team: 'Global Core Payment Engine',
    location: 'San Francisco, CA / Remote',
    comp: '$235,000 – $310,000 + Equity',
    experience: '6+ Years',
    type: 'Full-time • Tier-1 Priority',
    metrics: { matchPrecision: '95.4%', velocity: '3.2 Days to Shortlist', auditRating: '100% Compliant' },
    summary: 'Architecting ultra-low latency, idempotent transaction ledgers processing over $1 trillion in annual global payment volume.',
    verifiedSkills: [
      { skill: 'Distributed Consensus (Raft / Paxos)', level: 'Required • 98% Grounded' },
      { skill: 'High-Concurrency Go & Rust', level: 'Required • 96% Grounded' },
      { skill: 'Multi-Region High Availability', level: 'Required • 92% Grounded' },
      { skill: 'Financial Ledger Consistency', level: 'Preferred • 90% Grounded' }
    ],
    interviewFocus: 'System design for multi-region financial partitioning and live failover telemetry.'
  },
  {
    id: 'google',
    name: 'Google',
    logo: (
      <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" fill="#4285F4"/>
        <path d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" fill="#34A853"/>
        <path d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z" fill="#FBBC05"/>
        <path d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" fill="#EA4335"/>
      </svg>
    ),
    role: 'Senior Backend Infrastructure Engineer',
    team: 'Google Cloud Spanner Core Systems',
    location: 'Mountain View, CA • Hybrid',
    comp: '$210,000 – $285,000 + Equity',
    experience: '5+ Years',
    type: 'Full-time • Active Pipeline',
    metrics: { matchPrecision: '93.8%', velocity: '4.1 Days to Shortlist', auditRating: '100% Compliant' },
    summary: 'Scaling globally distributed ACID database kernels and distributed lock managers supporting Google Cloud enterprise customers.',
    verifiedSkills: [
      { skill: 'C++20 & Modern Systems', level: 'Required • 97% Grounded' },
      { skill: 'Distributed Transactions (2PC / TrueTime)', level: 'Required • 94% Grounded' },
      { skill: 'Linux Kernel & IO Uring', level: 'Preferred • 89% Grounded' },
      { skill: 'Performance Benchmarking & Profiling', level: 'Required • 93% Grounded' }
    ],
    interviewFocus: 'Concurrency primitives, lock-free queues, and distributed snapshot isolation.'
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    logo: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 0h11.4v11.4H0z" fill="#F25022"/>
        <path d="M12.6 0H24v11.4H12.6z" fill="#7FBA00"/>
        <path d="M0 12.6h11.4V24H0z" fill="#00A4EF"/>
        <path d="M12.6 12.6H24V24H12.6z" fill="#FFB900"/>
      </svg>
    ),
    role: 'Principal AI Infrastructure Architect',
    team: 'Azure OpenAI Large Model Serving',
    location: 'Redmond, WA / Remote',
    comp: '$225,000 – $310,000 + Equity',
    experience: '7+ Years',
    type: 'Full-time • High-Priority Opening',
    metrics: { matchPrecision: '94.2%', velocity: '2.8 Days to Shortlist', auditRating: '100% Compliant' },
    summary: 'Optimizing high-density GPU cluster orchestration and distributed inferencing runtimes for enterprise foundation models.',
    verifiedSkills: [
      { skill: 'PyTorch / Triton / TensorRT', level: 'Required • 96% Grounded' },
      { skill: 'Kubernetes & Slurm GPU Scheduling', level: 'Required • 95% Grounded' },
      { skill: 'InfiniBand & RDMA Networking', level: 'Preferred • 91% Grounded' },
      { skill: 'KV Cache Paged Memory Tuning', level: 'Required • 93% Grounded' }
    ],
    interviewFocus: 'Low-latency token generation pipelines, GPU memory throughput, and model quantization.'
  },
  {
    id: 'netflix',
    name: 'Netflix',
    logo: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5.398 0v24L10.3 12.44V0H5.398zm8.302 0v11.56L18.602 0h-4.902zM10.3 12.44L18.602 24H23.5V0h-4.898v12.44L10.3 0H5.398l8.302 12.44z" fill="#E50914"/>
      </svg>
    ),
    role: 'Senior Platform Systems Engineer',
    team: 'Edge Ingestion & Adaptive Streaming',
    location: 'Los Gatos, CA / Remote',
    comp: '$290,000 – $365,000 All-Cash',
    experience: '5+ Years',
    type: 'Full-time • Active Evaluation',
    metrics: { matchPrecision: '91.7%', velocity: '3.6 Days to Shortlist', auditRating: '100% Compliant' },
    summary: 'Developing adaptive bitrate stream distribution algorithms and high-throughput real-time telemetry backbones across worldwide POPs.',
    verifiedSkills: [
      { skill: 'Java / Kotlin or Modern Rust', level: 'Required • 94% Grounded' },
      { skill: 'gRPC & Real-Time Stream Ingestion', level: 'Required • 93% Grounded' },
      { skill: 'eBPF Observability & Chaos Testing', level: 'Preferred • 88% Grounded' },
      { skill: 'Sub-second P99 Latency Optimization', level: 'Required • 96% Grounded' }
    ],
    interviewFocus: 'Global CDN routing architectures, edge caching fallbacks, and resilient fault isolation.'
  },
  {
    id: 'meta',
    name: 'Meta',
    logo: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3.8C8.5 3.8 5.7 6.1 4.5 9.5 3.4 12.6 4.3 15.6 6.3 17.5c1.8 1.7 4.2 2.7 6.8 2.7 2.6 0 5-1 6.8-2.7 2-1.9 2.9-4.9 1.8-8-1.2-3.4-4-5.7-7.5-5.7zm0 13.9c-2.3 0-4.3-.9-5.7-2.4-1.3-1.4-1.8-3.4-1.2-5.3.8-2.5 3-4.2 5.6-4.2s4.8 1.7 5.6 4.2c.6 1.9.1 3.9-1.2 5.3-1.4 1.5-3.4 2.4-5.7 2.4z" fill="#0081FB"/>
      </svg>
    ),
    role: 'Production Engineering Lead',
    team: 'Core Distributed AI Training Infra',
    location: 'Menlo Park, CA • Hybrid',
    comp: '$230,000 – $315,000 + Equity',
    experience: '6+ Years',
    type: 'Full-time • Tier-1 Priority',
    metrics: { matchPrecision: '92.5%', velocity: '3.0 Days to Shortlist', auditRating: '100% Compliant' },
    summary: 'Reliability and systems engineering for multi-thousand GPU clusters training next-generation multimodal foundation models.',
    verifiedSkills: [
      { skill: 'Linux Internals & Performance Tuning', level: 'Required • 97% Grounded' },
      { skill: 'Python, C++ & BPF Tracing', level: 'Required • 95% Grounded' },
      { skill: 'Distributed Storage & Checkpoint IO', level: 'Required • 92% Grounded' },
      { skill: 'Automated Incident Mitigation Systems', level: 'Required • 90% Grounded' }
    ],
    interviewFocus: 'Automated cluster failure remediation, memory leak detection under heavy CUDA load.'
  },
  {
    id: 'snowflake',
    name: 'Snowflake',
    logo: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0l2.5 5.5L20 3l-2.5 5.5L24 12l-6.5 3.5L20 21l-5.5-2.5L12 24l-2.5-5.5L4 21l2.5-5.5L0 12l6.5-3.5L4 3l5.5 2.5L12 0z" fill="#29B5E8"/>
      </svg>
    ),
    role: 'Staff Database Kernel Engineer',
    team: 'Vectorized Query Execution Engine',
    location: 'San Mateo, CA • Hybrid',
    comp: '$220,000 – $295,000 + Equity',
    experience: '6+ Years',
    type: 'Full-time • High-Conviction Opening',
    metrics: { matchPrecision: '96.2%', velocity: '2.5 Days to Shortlist', auditRating: '100% Compliant' },
    summary: 'Engineering SIMD-accelerated columnar execution kernels and cost-based query optimizers processing exabytes of enterprise analytics.',
    verifiedSkills: [
      { skill: 'Modern C++ & Vectorization (AVX-512)', level: 'Required • 98% Grounded' },
      { skill: 'Columnar File Formats (Parquet/ORC)', level: 'Required • 96% Grounded' },
      { skill: 'Cost-Based Query Optimization', level: 'Required • 94% Grounded' },
      { skill: 'Cache-Conscious Data Structures', level: 'Required • 91% Grounded' }
    ],
    interviewFocus: 'Branch prediction, cache locality, and parallel hash join algorithms under memory constraints.'
  }
]

export default function LandingPage() {
  const navigate = useNavigate()
  const [activeDashTab, setActiveDashTab] = useState('semantic')
  const [selectedCompanyId, setSelectedCompanyId] = useState('stripe')

  const selectedCompany = topTierCompanies.find(c => c.id === selectedCompanyId) || topTierCompanies[0]

  return (
    <div className="ent-page">
      {/* ── Enterprise Navigation ── */}
      <nav className="ent-navbar">
        <div className="ent-nav-inner">
          <div className="ent-logo" onClick={() => navigate('/')}>
            <div className="ent-logo-mark">
              <Briefcase size={20} />
            </div>
            <div>
              <div className="ent-logo-text">HireSense</div>
              <div className="ent-logo-sub">Enterprise Talent Intelligence</div>
            </div>
          </div>

          <div className="ent-nav-menu">
            <a href="#platform-preview" className="ent-nav-link">Platform</a>
            <a href="#research-foundations" className="ent-nav-link">Core Research</a>
            <a href="#candidate-experience" className="ent-nav-link">Candidate Trust</a>
            <a href="#compliance" className="ent-nav-link">Governance</a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              className="btn-ent-secondary"
              id="btn-nav-candidate"
              onClick={() => navigate('/login?role=candidate')}
            >
              Candidate Portal
            </button>
            <button
              className="btn-ent-primary"
              id="btn-nav-recruiter"
              onClick={() => navigate('/login?role=recruiter')}
            >
              Recruiter Sign In <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero Section with Realistic Corporate Photography ── */}
      <section className="ent-hero">
        <div className="ent-hero-grid">
          <div>
            <div className="ent-badge">
              <span className="ent-badge-pulse" />
              HIRESENSE 2.0 &bull; EXPLAINABLE TALENT INTELLIGENCE
            </div>

            <h1 className="ent-hero-title">
              The Enterprise Platform for High-Stakes Technical Recruitment.
            </h1>

            <p className="ent-hero-subtitle">
              HireSense unifies deterministic resume grounding, acoustic speech fluency modeling,
              and continuous demographic parity audits into an auditable intelligence operating
              system for modern enterprise engineering organizations.
            </p>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 36 }}>
              <button
                className="btn-ent-primary"
                style={{ padding: '14px 28px', fontSize: '0.95rem' }}
                onClick={() => navigate('/login?role=recruiter')}
              >
                Launch Recruiter Operating System <ArrowRight size={16} />
              </button>
              <button
                className="btn-ent-secondary"
                style={{ padding: '14px 24px', fontSize: '0.95rem' }}
                onClick={() => navigate('/login?role=candidate')}
              >
                Candidate Practice & Feedback
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 24, fontSize: '0.82rem', color: '#94a3b8' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <ShieldCheck size={16} color="#10b981" /> NYC Local Law 144 Audited
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Lock size={16} color="#38bdf8" /> Zero Automated Rejection
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={16} color="#a5b4fc" /> 100% Deterministic Grounding
              </span>
            </div>
          </div>

          {/* Photorealistic Corporate Office Hero Photo */}
          <div className="ent-hero-photo-wrapper">
            <img
              src="/company_office_hero.jpg"
              alt="Enterprise engineering leadership reviewing talent intelligence dashboards"
              className="ent-hero-photo"
            />
            {/* Live Floating Metric Badges */}
            <div className="ent-floating-badge ent-floating-badge-top">
              <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                <CheckCircle2 size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>86.7% Match Precision</div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Deterministic Grounding &bull; Zero Hallucinations</div>
              </div>
            </div>

            <div className="ent-floating-badge ent-floating-badge-bottom">
              <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(56,189,248,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
                <Scale size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>0.0% Demographic Variance</div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Four-Fifths Parity Audited &bull; EEOC Verified</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Enterprise Proof Strip ── */}
        <div className="ent-proof-strip">
          <div className="ent-proof-item">
            <div className="ent-proof-num">50,000+</div>
            <div className="ent-proof-label">Verified Software Engineers</div>
          </div>
          <div className="ent-proof-item">
            <div className="ent-proof-num">1,200+</div>
            <div className="ent-proof-label">Enterprise Hiring Panels</div>
          </div>
          <div className="ent-proof-item">
            <div className="ent-proof-num">99.4%</div>
            <div className="ent-proof-label">Algorithmic Compliance Score</div>
          </div>
          <div className="ent-proof-item">
            <div className="ent-proof-num">4.2x</div>
            <div className="ent-proof-label">Faster High-Conviction Shortlisting</div>
          </div>
        </div>
      </section>

      {/* ── Top-Tier Enterprise Company Showcase & Job Profiles ── */}
      <section id="top-companies" className="ent-companies-section">
        {/* Brand ticker */}
        <div className="ent-brand-ticker">
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Verified Technical Hiring Partners:
          </span>
          {topTierCompanies.map(comp => (
            <div
              key={comp.id}
              className={`ent-brand-item ${selectedCompanyId === comp.id ? 'active' : ''}`}
              onClick={() => setSelectedCompanyId(comp.id)}
            >
              {comp.logo}
              <span>{comp.name}</span>
            </div>
          ))}
        </div>

        <div className="ent-section-header" style={{ marginBottom: 36 }}>
          <div className="ent-section-tag">Enterprise Talent Network</div>
          <h2 className="ent-section-title">Active Technical Openings at Industry Leaders</h2>
          <p className="ent-section-desc">
            Explore high-conviction engineering openings with transparent compensation brackets,
            deterministic skill requirements, and zero automated black-box rejections.
          </p>
        </div>

        {/* Company Selector Tab Bar */}
        <div className="ent-company-selector">
          {topTierCompanies.map(comp => (
            <button
              key={comp.id}
              className={`ent-company-tab ${selectedCompanyId === comp.id ? 'active' : ''}`}
              onClick={() => setSelectedCompanyId(comp.id)}
            >
              {comp.logo}
              <span>{comp.name}</span>
            </button>
          ))}
        </div>

        {/* Selected Job Profile Card with Transition */}
        <div key={selectedCompany.id} className="ent-job-profile-card">
          <div className="ent-job-header-row">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <div style={{ padding: 8, background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {selectedCompany.logo}
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    {selectedCompany.name} &bull; {selectedCompany.team}
                  </div>
                  <h3 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                    {selectedCompany.role}
                  </h3>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
                <span className="ent-job-meta-pill">
                  <Briefcase size={14} color="#38bdf8" /> {selectedCompany.type}
                </span>
                <span className="ent-job-meta-pill">
                  <Award size={14} color="#10b981" /> {selectedCompany.comp}
                </span>
                <span className="ent-job-meta-pill">
                  <Clock size={14} color="#a5b4fc" /> {selectedCompany.experience}
                </span>
                <span className="ent-job-meta-pill">
                  <Building2 size={14} color="#cbd5e1" /> {selectedCompany.location}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                className="btn-ent-primary"
                onClick={() => navigate('/login?role=candidate')}
              >
                Apply with Verified Profile <ArrowRight size={15} />
              </button>
              <button
                className="btn-ent-secondary"
                onClick={() => navigate('/login?role=recruiter')}
              >
                Screen with HireSense
              </button>
            </div>
          </div>

          {/* Telemetry Metrics Row */}
          <div className="ent-metric-grid" style={{ marginBottom: 24 }}>
            <div className="ent-metric-box">
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>HireSense Match Precision</div>
              <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#10b981', marginTop: 4 }}>{selectedCompany.metrics.matchPrecision}</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Deterministic Semantic Verification</div>
            </div>
            <div className="ent-metric-box">
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Average Time-to-Shortlist</div>
              <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#38bdf8', marginTop: 4 }}>{selectedCompany.metrics.velocity}</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Vs 18.4 Days Industry Average</div>
            </div>
            <div className="ent-metric-box">
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Algorithmic Parity Audit</div>
              <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#a5b4fc', marginTop: 4 }}>{selectedCompany.metrics.auditRating}</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Zero Adverse Impact Detected</div>
            </div>
            <div className="ent-metric-box">
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Candidate Rights</div>
              <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#f59e0b', marginTop: 4 }}>Protected</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Human Sign-Off Required</div>
            </div>
          </div>

          {/* Mission & Skills Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Role Overview & Impact</div>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
                {selectedCompany.summary}
              </p>
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#38bdf8', marginBottom: 4 }}>Technical Interview Focus:</div>
                <div style={{ fontSize: '0.82rem', color: '#334155' }}>{selectedCompany.interviewFocus}</div>
              </div>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>Verified Competency Grounding</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selectedCompany.verifiedSkills.map((sk, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 8 }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>{sk.skill}</span>
                    <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700 }}>{sk.level}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Realistic Material Web Dashboard Showcase ── */}
      <section id="platform-preview" className="ent-dashboard-showcase">
        <div className="ent-section-header">
          <div className="ent-section-tag">Interactive Product Architecture</div>
          <h2 className="ent-section-title">A Material Operating System for Modern Hiring</h2>
          <p className="ent-section-desc">
            Explore the multi-dimensional intelligence dossier generated for every applicant,
            powered by verifiable text evidence and acoustic speech metrics.
          </p>
        </div>

        <div className="ent-dash-window">
          {/* Window Chrome */}
          <div className="ent-dash-titlebar">
            <div className="ent-dash-dots">
              <span className="ent-dash-dot" style={{ background: '#ef4444' }} />
              <span className="ent-dash-dot" style={{ background: '#f59e0b' }} />
              <span className="ent-dash-dot" style={{ background: '#10b981' }} />
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
              hiresense-os://recruiter/candidates/app-402/dossier
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>
              <span className="ent-badge-pulse" /> Live Telemetry Nominal
            </div>
          </div>

          {/* Interactive Material Dashboard Tabs */}
          <div className="ent-dash-tabs">
            <button
              className={`ent-dash-tab ${activeDashTab === 'semantic' ? 'active' : ''}`}
              onClick={() => setActiveDashTab('semantic')}
            >
              <Target size={15} /> Explainable Semantic Matching
            </button>
            <button
              className={`ent-dash-tab ${activeDashTab === 'speech' ? 'active' : ''}`}
              onClick={() => setActiveDashTab('speech')}
            >
              <Mic size={15} /> Acoustic Speech & STAR Fluency
            </button>
            <button
              className={`ent-dash-tab ${activeDashTab === 'candidate' ? 'active' : ''}`}
              onClick={() => setActiveDashTab('candidate')}
            >
              <Users size={15} /> Candidate-in-the-Loop Sovereignty
            </button>
            <button
              className={`ent-dash-tab ${activeDashTab === 'fairness' ? 'active' : ''}`}
              onClick={() => setActiveDashTab('fairness')}
            >
              <Scale size={15} /> Algorithmic Fairness Audit
            </button>
          </div>

          {/* Tab Content 1: Semantic Matching */}
          {activeDashTab === 'semantic' && (
            <div className="ent-dash-body">
              <div className="ent-metric-grid">
                <div className="ent-metric-box">
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Overall Fit Score</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981', marginTop: 4 }}>88%</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>High Conviction Match</div>
                </div>
                <div className="ent-metric-box">
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Technical Coverage</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8', marginTop: 4 }}>92%</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>5 of 5 Core Competencies</div>
                </div>
                <div className="ent-metric-box">
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Experience Multiplier</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#a5b4fc', marginTop: 4 }}>4.2 Yrs</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>Requirement: 3+ Years</div>
                </div>
                <div className="ent-metric-box">
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Audit Trail Status</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b', marginTop: 4 }}>Locked</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>Immutable SHA-256 Record</div>
                </div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1rem', color: '#0f172a' }}>Requirement Explainability Matrix &bull; Arjun Kumar</h4>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Target Role: Senior Backend Systems Engineer (Python / Distributed Systems)</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', padding: '4px 10px', background: 'rgba(16,185,129,0.15)', color: '#10b981', borderRadius: 6, fontWeight: 600 }}>
                    Deterministic Verification Passed
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
                  {[
                    { skill: 'Python & AsyncIO', status: 'Verified in Resume', excerpt: 'Architected high-throughput async ingest pipelines processing 50k req/sec', match: '98%' },
                    { skill: 'FastAPI & REST Architecture', status: 'Verified in Resume', excerpt: 'Led microservices migration from Flask to FastAPI, decreasing P99 latency by 45%', match: '95%' },
                    { skill: 'Distributed PostgreSQL', status: 'Verified in Resume', excerpt: 'Tuned read replicas and partition indexing across multi-terabyte clusters', match: '89%' },
                    { skill: 'Docker & Kubernetes', status: 'Verified in Resume', excerpt: 'Authored multi-stage CI/CD Docker builds and Helm chart deployments', match: '91%' },
                  ].map(item => (
                    <div key={item.skill} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontWeight: 700, fontSize: '0.84rem', color: '#0f172a' }}>{item.skill}</span>
                        <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700 }}>{item.match}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic', lineHeight: 1.4 }}>
                        &ldquo;{item.excerpt}&rdquo;
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab Content 2: Speech & STAR Fluency */}
          {activeDashTab === 'speech' && (
            <div className="ent-dash-body">
              <div className="ent-metric-grid">
                <div className="ent-metric-box">
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Composite Fluency</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981', marginTop: 4 }}>88%</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>Weighted Speech Index</div>
                </div>
                <div className="ent-metric-box">
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Speaking Pace</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8', marginTop: 4 }}>148 WPM</div>
                  <div style={{ fontSize: '0.72rem', color: '#10b981', marginTop: 2 }}>Optimal (Ideal: 120–160 WPM)</div>
                </div>
                <div className="ent-metric-box">
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Filler Word Rate</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981', marginTop: 4 }}>2.9%</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>Improved from 8.7%</div>
                </div>
                <div className="ent-metric-box">
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>STAR Structure Score</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#a5b4fc', marginTop: 4 }}>86/100</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>Situation &rarr; Task &rarr; Action &rarr; Result</div>
                </div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <Volume2 size={18} color="#38bdf8" />
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>Audio Prosody Waveform Simulation (Zero Emotion Assumptions)</span>
                </div>
                <div style={{ height: 48, display: 'flex', alignItems: 'center', gap: 4, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '0 16px' }}>
                  {[30, 50, 80, 45, 90, 60, 40, 75, 85, 30, 95, 60, 40, 70, 85, 90, 65, 40, 60, 80, 50, 40, 70, 85, 90, 75, 45, 35, 60, 85].map((h, i) => (
                    <div key={i} style={{ flex: 1, height: `${h}%`, background: i > 18 ? '#4f46e5' : '#38bdf8', borderRadius: 2, opacity: 0.8 }} />
                  ))}
                </div>
                <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: 10 }}>
                  Evidence: Librosa audio analysis confirms zero cadence pauses exceeding 3.0 seconds. High structural clarity observed in behavioral question responses.
                </div>
              </div>
            </div>
          )}

          {/* Tab Content 3: Candidate Sovereignty */}
          {activeDashTab === 'candidate' && (
            <div className="ent-dash-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <ShieldCheck size={20} color="#10b981" />
                    <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#0f172a' }}>Profile Transparency Right</h4>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
                    Candidates review the exact structured JSON parsed from their resume prior to recruiter evaluation.
                    Any extraction omissions can be corrected immediately with one click.
                  </p>
                  <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>&check; Candidate Verified 14 mins ago</span>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <Users size={20} color="#38bdf8" />
                    <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#0f172a' }}>Human-in-the-Loop Governance</h4>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
                    Algorithms are restricted to decision support. No automated adverse actions or rejections are permitted
                    without explicit logged sign-off from a certified recruiter.
                  </p>
                  <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 600 }}>&check; Certified Human Recruiter Assigned</span>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <Award size={20} color="#a5b4fc" />
                    <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#0f172a' }}>Actionable Growth Dossier</h4>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
                    Instead of generic rejection templates, job seekers receive detailed STAR structure coaching,
                    speaking pace analytics, and targeted practice drills for upcoming interviews.
                  </p>
                  <span style={{ fontSize: '0.72rem', color: '#a5b4fc', fontWeight: 600 }}>&check; Full Coaching Dossier Unlocked</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content 4: Algorithmic Fairness Telemetry */}
          {activeDashTab === 'fairness' && (
            <div className="ent-dash-body">
              <div className="ent-metric-grid">
                <div className="ent-metric-box">
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Demographic Parity Ratio</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981', marginTop: 4 }}>0.98</div>
                  <div style={{ fontSize: '0.72rem', color: '#10b981', marginTop: 2 }}>EEOC 80% Rule: Fully Compliant</div>
                </div>
                <div className="ent-metric-box">
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Adverse Impact Index</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8', marginTop: 4 }}>0.00%</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>Zero Statistically Significant Variance</div>
                </div>
                <div className="ent-metric-box">
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Face & Emotion Filters</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#a5b4fc', marginTop: 4 }}>Disabled</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>Strictly Text & Acoustic Prosody</div>
                </div>
                <div className="ent-metric-box">
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>NYC Law 144 Status</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981', marginTop: 4 }}>Certified</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>Annual Independent Bias Audit Active</div>
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 18, fontSize: '0.82rem', color: '#94a3b8' }}>
                <strong style={{ color: '#0f172a' }}>Auditing Policy:</strong> All model weights are evaluated against protected attribute benchmarks.
                Any model release producing adverse impact &gt; 2.0% variance across protected cohorts triggers an automated deployment block.
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Core Research & Scientific Foundations Section ── */}
      <section id="research-foundations" className="ent-research-section">
        <div className="ent-section-header">
          <div className="ent-section-tag">Empirical Science & Architecture</div>
          <h2 className="ent-section-title">Peer-Reviewed Algorithmic Foundations</h2>
          <p className="ent-section-desc">
            HireSense is built upon verified scientific publications in explainable artificial intelligence,
            acoustic speech signal processing, and algorithmic adverse impact mitigation.
          </p>
        </div>

        <div className="ent-research-dual">
          {/* Research Lab Real Photograph */}
          <div className="ent-hero-photo-wrapper">
            <img
              src="/research_lab_fairness.jpg"
              alt="Data scientists and AI researchers reviewing fairness curves in research lab"
              className="ent-hero-photo"
            />
            <div className="ent-floating-badge ent-floating-badge-bottom">
              <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(56,189,248,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
                <BookOpen size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>IEEE / ACM Fair-AI Methodology</div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Empirical Audit on 10,000+ Candidate Samples</div>
              </div>
            </div>
          </div>

          {/* Research Pillars Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="ent-research-card">
              <span className="ent-research-tag-pill" style={{ background: 'rgba(56,189,248,0.12)', color: '#38bdf8' }}>
                Research Foundation &bull; 01
              </span>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
                Deterministic Semantic Grounding vs. Black-Box LLMs
              </h3>
              <p style={{ fontSize: '0.84rem', color: '#94a3b8', lineHeight: 1.55 }}>
                Unlike generative chatbots prone to hallucination, HireSense matches candidate credentials
                strictly against verified source text with verbatim evidence citation and human-adjustable thresholds.
              </p>
            </div>

            <div className="ent-research-card">
              <span className="ent-research-tag-pill" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>
                Research Foundation &bull; 02
              </span>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
                Acoustic Prosody & STAR Behavioral Speech Modeling
              </h3>
              <p style={{ fontSize: '0.84rem', color: '#94a3b8', lineHeight: 1.55 }}>
                Leveraging OpenAI Whisper and Librosa acoustic signal extraction to measure speaking rate (WPM)
                and filler rate without subjective personality biases or facial emotion pseudoscience.
              </p>
            </div>

            <div className="ent-research-card">
              <span className="ent-research-tag-pill" style={{ background: 'rgba(165,180,252,0.12)', color: '#a5b4fc' }}>
                Research Foundation &bull; 03
              </span>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
                Demographic Parity & Immutable Audit Trails
              </h3>
              <p style={{ fontSize: '0.84rem', color: '#94a3b8', lineHeight: 1.55 }}>
                Pre-configured for compliance with NYC Local Law 144, EEOC Uniform Guidelines, and EU AI Act
                high-risk employment criteria with cryptographic audit logging.
              </p>
            </div>
          </div>
        </div>

        {/* Technical Benchmark Comparison Table */}
        <div className="ent-table-card">
          <div className="ent-table-row ent-table-header">
            <div>Evaluation Dimension</div>
            <div>Legacy ATS Keyword Screeners</div>
            <div style={{ color: '#38bdf8' }}>HireSense Explainable Intelligence</div>
          </div>
          <div className="ent-table-row">
            <div style={{ fontWeight: 600, color: '#0f172a' }}>Matching Mechanism</div>
            <div style={{ color: '#94a3b8' }}>Exact string matching & keyword stuffing</div>
            <div style={{ color: '#0f172a' }}>Semantic grounding with verifiable citation evidence</div>
          </div>
          <div className="ent-table-row">
            <div style={{ fontWeight: 600, color: '#0f172a' }}>Adverse Impact Risk</div>
            <div style={{ color: '#f43f5e' }}>High uncontrolled bias & blind filtering</div>
            <div style={{ color: '#10b981' }}>Continuous 0% demographic variance auditing</div>
          </div>
          <div className="ent-table-row">
            <div style={{ fontWeight: 600, color: '#0f172a' }}>Interview Assessment</div>
            <div style={{ color: '#94a3b8' }}>Uncalibrated human gut-feel or video emotion AI</div>
            <div style={{ color: '#0f172a' }}>Objective speech rate, filler counting & STAR structure</div>
          </div>
          <div className="ent-table-row">
            <div style={{ fontWeight: 600, color: '#0f172a' }}>Candidate Feedback</div>
            <div style={{ color: '#94a3b8' }}>Generic no-reply rejection email</div>
            <div style={{ color: '#0f172a' }}>Transparent coaching dossier with practice drills</div>
          </div>
        </div>
      </section>

      {/* ── Candidate Experience & Real Interview Section ── */}
      <section id="candidate-experience" className="ent-candidate-showcase">
        <div>
          <div className="ent-section-tag">Candidate-Centered Philosophy</div>
          <h2 className="ent-section-title">Built to Empower, Not Eliminate</h2>
          <p className="ent-section-desc" style={{ marginBottom: 28 }}>
            Job seekers deserve clarity, transparency, and dignity. HireSense turns the opaque hiring funnel
            into a constructive talent coaching and growth loop.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { title: 'Zero Black-Box Ghosting', desc: 'Every evaluation is accompanied by verifiable reasoning so candidates know exactly how their skills aligned.' },
              { title: 'Safe Practice Mode', desc: 'Upload trial interviews in private to track speaking pace and filler reduction before final submission.' },
              { title: 'Profile Sovereignty', desc: 'Candidates can edit and verify any parsed information to ensure algorithms never miss critical achievements.' },
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', flexShrink: 0, marginTop: 2 }}>
                  <Check size={14} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>{f.title}</div>
                  <div style={{ fontSize: '0.84rem', color: '#94a3b8', lineHeight: 1.5 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 32 }}>
            <button
              className="btn-ent-primary"
              onClick={() => navigate('/login?role=candidate')}
            >
              Access Free Candidate Practice Portal <ArrowRight size={15} />
            </button>
          </div>
        </div>

        {/* Real Candidate Interview Photo */}
        <div className="ent-hero-photo-wrapper">
          <img
            src="/candidate_interview_real.jpg"
            alt="Candidate participating in a structured remote technical video interview"
            className="ent-hero-photo"
          />
          <div className="ent-floating-badge ent-floating-badge-top">
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
              <Mic size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>Live Video Interview Session</div>
              <div style={{ fontSize: '0.72rem', color: '#10b981' }}>88% Fluency Index &bull; Active Coaching</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Enterprise Governance & Compliance Strip ── */}
      <section id="compliance" className="ent-hero" style={{ paddingTop: 0 }}>
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          borderRadius: 20,
          padding: '40px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 24,
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Governance</div>
            <h4 style={{ margin: '4px 0 0', fontSize: '1.2rem', color: '#0f172a' }}>Enterprise-Grade Compliance</h4>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShieldCheck size={28} color="#10b981" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>NYC Local Law 144</div>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Annual bias audit ready</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Lock size={28} color="#38bdf8" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>EEOC Verified</div>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Four-fifths rule compliance</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileText size={28} color="#a5b4fc" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>GDPR Article 22</div>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Human intervention guaranteed</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Enterprise High-Conversion Call To Action ── */}
      <section className="ent-cta-banner">
        <div className="ent-cta-box">
          <div className="ent-badge" style={{ margin: '0 auto 20px' }}>
            ENTERPRISE DEPLOYMENT READY
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: '#0f172a', marginBottom: 16 }}>
            Modernize Your Technical Hiring Pipeline Today
          </h2>
          <p style={{ fontSize: '1.1rem', color: '#475569', maxWidth: 640, margin: '0 auto 36px', lineHeight: 1.6 }}>
            Empower hiring managers with explainable candidate intelligence while providing applicants
            with transparent feedback and genuine career coaching.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn-ent-primary"
              style={{ padding: '14px 32px', fontSize: '1rem' }}
              onClick={() => navigate('/login?role=recruiter')}
            >
              Sign In as Recruiter <ArrowRight size={16} />
            </button>
            <button
              className="btn-ent-secondary"
              style={{ padding: '14px 28px', fontSize: '1rem' }}
              onClick={() => navigate('/login?role=candidate')}
            >
              Sign In as Candidate
            </button>
          </div>
        </div>
      </section>

      {/* ── Corporate Minimalist Footer ── */}
      <footer className="ent-footer">
        <div className="ent-footer-inner">
          <div style={{ maxWidth: 360 }}>
            <div className="ent-logo" onClick={() => navigate('/')} style={{ marginBottom: 14 }}>
              <div className="ent-logo-mark">
                <Briefcase size={18} />
              </div>
              <div className="ent-logo-text" style={{ fontSize: '1.2rem' }}>HireSense</div>
            </div>
            <p style={{ fontSize: '0.84rem', color: '#64748b', lineHeight: 1.6 }}>
              Enterprise explainable talent intelligence operating system. Verified deterministic
              matching, acoustic speech fluency analytics, and algorithmic fairness telemetry.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
                Product
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.84rem', color: '#94a3b8' }}>
                <a href="#platform-preview" style={{ color: 'inherit', textDecoration: 'none' }}>Semantic Matching</a>
                <a href="#platform-preview" style={{ color: 'inherit', textDecoration: 'none' }}>Speech Analytics</a>
                <a href="#candidate-experience" style={{ color: 'inherit', textDecoration: 'none' }}>Candidate Dossier</a>
                <a href="#compliance" style={{ color: 'inherit', textDecoration: 'none' }}>Audit Telemetry</a>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
                Research
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.84rem', color: '#94a3b8' }}>
                <a href="#research-foundations" style={{ color: 'inherit', textDecoration: 'none' }}>Explainability Whitepaper</a>
                <a href="#research-foundations" style={{ color: 'inherit', textDecoration: 'none' }}>Acoustic Prosody Methodology</a>
                <a href="#research-foundations" style={{ color: 'inherit', textDecoration: 'none' }}>Adverse Impact Benchmarks</a>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
                Portals
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.84rem', color: '#94a3b8' }}>
                <button onClick={() => navigate('/login?role=recruiter')} style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer', textAlign: 'left', font: 'inherit' }}>
                  Recruiter OS
                </button>
                <button onClick={() => navigate('/login?role=candidate')} style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer', textAlign: 'left', font: 'inherit' }}>
                  Candidate Practice
                </button>
                <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer', textAlign: 'left', font: 'inherit' }}>
                  Account Sign In
                </button>
              </div>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1280, margin: '40px auto 0', paddingTop: 20, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, fontSize: '0.78rem', color: '#64748b' }}>
          <div>&copy; 2026 HireSense Systems Inc. All rights reserved.</div>
          <div style={{ display: 'flex', gap: 20 }}>
            <span>SOC 2 Type II Certified</span>
            <span>NYC Law 144 Compliant</span>
            <span>EEOC Audited</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
