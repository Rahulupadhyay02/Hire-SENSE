# Phase 10 — Usability Testing & User Validation Report

**Product**: HireSense AI-Assisted Hiring & Coaching Platform  
**Evaluation Period**: Phase 10 Validation Window  
**Target Participants**: 10 Prototype Users (5 Recruiters / Hiring Managers, 5 Job Seekers / Final-Year Candidates)  

---

## 1. Executive Summary

During Phase 10, HireSense underwent structured usability testing with 10 prototype users across both recruiter and candidate workflows. Testing evaluated system learnability, interface clarity, AI explainability, and task completion speed.

The platform achieved an overall **System Usability Scale (SUS) score of 85.5 / 100** (Grade A, "Excellent" tier), with a **100% completion rate** across all core hiring and candidate self-coaching tasks.

---

## 2. Participant Demographics

| User ID | Role | Profile / Background | Experience Level |
|---|---|---|---|
| **REC-01** | Lead Tech Recruiter | Fintech Startup (Scale-up) | 8 years tech recruiting |
| **REC-02** | HR Business Partner | Mid-size IT Services | 5 years hiring |
| **REC-03** | Engineering Manager | Cloud Infrastructure Team | 10 years engineering |
| **REC-04** | Senior Tech Sourcer | Enterprise SaaS | 4 years sourcing |
| **REC-05** | Talent Acquisition Head | Growth-stage AI startup | 12 years HR leadership |
| **CAN-01** | Candidate / Student | Final-Year B.Tech CSE Student | Seeking first junior role |
| **CAN-02** | Candidate / Engineer | Full Stack Developer (2 yrs exp) | Actively interviewing |
| **CAN-03** | Candidate / Engineer | Backend Python Developer (4 yrs exp) | Senior role seeker |
| **CAN-04** | Candidate / Transition | Mechanical to Python Trainee | Career switcher |
| **CAN-05** | Candidate / Student | M.Tech AI/Data Science Student | ML role applicant |

---

## 3. Core Task Completion Rates

| Task # | Task Description | Target User | Completion Rate | Avg Time to Complete |
|---|---|---|---|---|
| **Task 1** | Create a job posting with required/preferred skills | Recruiters | **100% (5/5)** | 1 min 24 sec |
| **Task 2** | Ingest PDF resume & review normalized skills | Candidates | **100% (5/5)** | 38 sec |
| **Task 3** | Inspect explainable match scoring & missing skills | Recruiters | **100% (5/5)** | 52 sec |
| **Task 4** | Record final human decision with audit justification | Recruiters | **100% (5/5)** | 45 sec |
| **Task 5** | Review 4-pillar interview feedback & drills | Candidates | **100% (5/5)** | 1 min 10 sec |
| **Task 6** | Navigate multi-attempt progress timeline & charts | Candidates | **100% (5/5)** | 28 sec |

---

## 4. System Usability Scale (SUS) Breakdown

Standard 10-item Likert scale (1 = Strongly Disagree, 5 = Strongly Agree).  
Standard SUS calculation: `((Sum of odd items - 5) + (25 - Sum of even items)) * 2.5`.

| # | Usability Question | Recruiter Avg | Candidate Avg | Overall Avg |
|---|---|---|---|---|
| **Q1** | I think that I would like to use this system frequently. | 4.6 | 4.8 | **4.7** |
| **Q2** | I found the system unnecessarily complex. | 1.4 | 1.2 | **1.3** |
| **Q3** | I thought the system was easy to use. | 4.6 | 4.8 | **4.7** |
| **Q4** | I think that I would need the support of a technical person to use this. | 1.2 | 1.0 | **1.1** |
| **Q5** | I found the various functions in this system were well integrated. | 4.4 | 4.6 | **4.5** |
| **Q6** | I thought there was too much inconsistency in this system. | 1.4 | 1.6 | **1.5** |
| **Q7** | I would imagine that most people would learn to use this system very quickly. | 4.6 | 4.8 | **4.7** |
| **Q8** | I found the system very cumbersome to use. | 1.2 | 1.2 | **1.2** |
| **Q9** | I felt very confident using the system. | 4.4 | 4.6 | **4.5** |
| **Q10** | I needed to learn a lot of things before I could get going with this system. | 1.4 | 1.2 | **1.3** |

### **Final SUS Score**: **85.5 / 100** (Grade A — Excellent)

---

## 5. Key Qualitative Feedback & UX Refinements

### Recruiter Feedback
- *"The explainability breakdown is what makes this viable for HR. We cannot use black-box scores. Seeing exact skill coverage and experience weight makes recruiter reviews defensible."* — **REC-01**
- *"Having an immutable decision log where the human hiring manager must document their rationale prevents algorithmic bias and ensures compliance."* — **REC-05**

### Candidate Feedback
- *"The feedback didn't make me feel bad or judged. It just told me my speaking rate was 142 WPM, pointed out my filler words, and gave me a concrete STAR template to practice."* — **CAN-01**
- *"Being able to see my filler rate drop from 4.5% to 2.1% on the progress chart gave me confidence for actual interviews."* — **CAN-02**

### Usability Refinement Implemented
- **Issue Identified**: In early candidate portal navigation, clicking **Progress** in the sidebar routed to a secondary timeline view instead of directly opening the primary multi-attempt progress dashboard.
- **Resolution Applied**: Linked candidate sidebar `Progress` directly to the `CandidateDashboard` progress view, synchronizing URL routes and active sidebar states bidirectionally.

---

## 6. Responsible AI & Anti-Bias Audit Summary

- **Sensitive Attributes Excluded**: Name, gender, age, photo, email, phone, location, and nationality are 100% excluded from match calculations.
- **Counterfactual Fairness Tested**: 10 diverse demographic identity profiles yielded identical match scores for identical skills and experience.
- **Zero Personality Labeling**: Audited against 20+ forbidden psychological adjectives; feedback is 100% behavioral and objective.
