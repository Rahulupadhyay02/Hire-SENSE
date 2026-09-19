# HireSense — Responsible AI Assessment & Ethical Governance Framework

**Framework Version**: 1.0.0 (MVP Release)  
**Scope**: Resume Parsing, Explainable Matching, Speech-to-Text, Communication Intelligence, and Candidate Feedback  
**Compliance Standards**: EU AI Act (High-Risk AI Systems — Annex III, 4), EEOC Uniform Guidelines on Employee Selection Procedures  

---

## 1. Executive Statement of Ethical AI Intent

HireSense is strictly designed as an **AI-assisted decision-support platform**. The fundamental architectural mandate is that **AI never autonomously hires, rejects, or filters candidates**. Every employment decision is made consciously by an authenticated human recruiter or hiring manager, with mandatory rationale documentation recorded in an immutable audit ledger.

---

## 2. Five Pillars of Responsible AI in HireSense

```
                ┌──────────────────────────────────────────────┐
                │        RESPONSIBLE AI IN HIRESENSE           │
                └──────────────────────┬───────────────────────┘
                                       │
      ┌────────────────┬───────────────┴───────────────┬────────────────┐
      ▼                ▼                               ▼                ▼
[ Human-in-the-Loop ] [ Explainable Scoring ] [ Demographic Fairness ] [ Non-Judgmental Coaching ]
(Immutable Auditing)  (4-Factor Breakdown)    (100% Counterfactual)    (Zero Personality Labels)
```

### Pillar 1: Human-in-the-Loop Decision Governance
- **Mandate**: The system has **no automated rejection or hiring triggers**.
- **Human Accountability**: Moving a candidate from `Pending` to `Shortlisted`, `Hold`, or `Rejected` requires a conscious button click by an authorized recruiter or admin.
- **Indelible Audit Trail**: Every decision generates an immutable record in `audit_logs` capturing:
  - Recruiter User ID & Email
  - Timestamp (UTC)
  - Action taken (`decision_shortlisted`, `decision_rejected`, etc.)
  - Decider's written justification notes
  - State change snapshot (previous status $\rightarrow$ new status)

### Pillar 2: Explainable Scoring & Algorithmic Transparency
- **Zero Black Boxes**: Black-box neural embedding similarity scores without human-understandable explanation are banned from primary decision pipelines.
- **Deterministic Multi-Component Formula**:
  $$\text{Match Score} = 0.45 \cdot S_{\text{skills}} + 0.20 \cdot S_{\text{experience}} + 0.20 \cdot S_{\text{projects}} + 0.15 \cdot S_{\text{coverage}}$$
- **Granular Transparency**: Recruiters and candidates see:
  - Exact list of matched required skills
  - Exact list of missing required skills
  - Matched preferred skills
  - Experience level alignment analysis

### Pillar 3: Demographic Counterfactual Fairness & Blindness
- **Sensitive Attributes Excluded**:
  The following attributes are explicitly stripped and never fed into matching or scoring models:
  - Candidate Name
  - Gender / Gender Pronouns
  - Age / Date of Birth
  - Photographic Imagery / Headshots
  - Residential Address / Postal Code
  - Nationality / Citizenship
  - Marital / Family Status
  - Phone / Email (contact metadata isolated from evaluator algorithms)
- **Counterfactual Fairness Empirical Testing**:
  A single candidate resume was evaluated under 10 diverse demographic names spanning male, female, and varied ethnic and cultural backgrounds:
  `Alex Mercer`, `Priya Sharma`, `Carlos Rodriguez`, `Aisha Al-Mansoor`, `Kwame Mensah`, `Elena Rostova`, `Mei-Ling Chen`, `David Cohen`, `Fatima Zahra`, `Liam O'Connor`.
  - **Result**: **0.0% variance** across all 10 profiles; match scores, skill extractions, and scoring breakdowns were identical down to the last decimal place.

### Pillar 4: Non-Judgmental, Evidence-Based Candidate Feedback
- **Strict Prohibition of Psychological Profiling**:
  HireSense explicitly prohibits subjective personality inferences, emotion analysis, or psychological labels. The system never claims a candidate is "nervous", "lazy", "shy", "unconfident", "arrogant", or "aggressive".
- **Strictly Behavioral Feedback**:
  Feedback is restricted to observable, countable, and actionable communication signals:
  - Words Per Minute (WPM)
  - Filler word count & rate (% of total words)
  - Answer structure heuristics (STAR signals: Situation, Task, Action, Result)
  - Technical skill vocabulary overlap with job requirements

### Pillar 5: Candidate-in-the-Loop Recourse & Agency
- If the AI extraction misses a skill or misinterprets an experience duration, the candidate has direct agency to review, edit, and update their verified profile before applications are evaluated.
- Candidate edits take immediate precedence over raw parser heuristics.

---

## 3. Regulatory Alignment Matrix

| Regulation / Standard | Requirement | HireSense Implementation | Status |
|---|---|---|---|
| **EU AI Act Article 10** | High quality training/eval data & bias testing | Standardized 51-case AI dataset & counterfactual testing suite (`app/ai_eval/`) | ✅ Compliant |
| **EU AI Act Article 13** | Transparency & explainability for deployers | Transparent 4-factor scoring breakdown & explicit missing skills list | ✅ Compliant |
| **EU AI Act Article 14** | Human oversight (Human-in-the-loop) | AI advisory only; mandatory human recruiter hiring decisions & audit logging | ✅ Compliant |
| **EEOC Guidelines** | Job-relatedness & non-discriminatory selection | Features strictly limited to job description skills and experience requirements | ✅ Compliant |
| **GDPR Article 22** | Right to not be subject to automated decision-making | Zero automated rejection; every decision involves human review and justification | ✅ Compliant |
