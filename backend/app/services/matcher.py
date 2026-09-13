import re
from typing import Dict, Any, List, Optional, Tuple
from app.services.resume_parser import SKILL_TAXONOMY
from app.models.job import Job
from app.models.candidate import Candidate
from app.models.resume_analysis import ResumeAnalysis

def _normalize_skill(skill: str) -> str:
    """Normalize a skill name against the canonical taxonomy or clean formatting."""
    s_clean = skill.strip().lower()
    return SKILL_TAXONOMY.get(s_clean, skill.strip().title())

def _extract_numeric_years(text: Optional[str]) -> float:
    """Extract numeric years from experience strings like '3+ years', '1-2 years', '5 years'."""
    if not text:
        return 1.0
    text_lower = text.lower().strip()
    # Match ranges like 1-2 or 3-5 -> take average or upper
    range_match = re.search(r'(\d+)\s*[-–to]\s*(\d+)', text_lower)
    if range_match:
        low = float(range_match.group(1))
        high = float(range_match.group(2))
        return (low + high) / 2.0
    
    # Match single numbers like 3+, 5 years
    num_match = re.search(r'(\d+(?:\.\d+)?)', text_lower)
    if num_match:
        return float(num_match.group(1))
    
    if "senior" in text_lower or "lead" in text_lower:
        return 5.0
    if "mid" in text_lower:
        return 3.0
    if "fresher" in text_lower or "entry" in text_lower or "intern" in text_lower:
        return 0.5
    return 1.0

def evaluate_job_candidate_match(
    job: Job,
    candidate: Candidate,
    latest_resume: Optional[ResumeAnalysis] = None
) -> Dict[str, Any]:
    """
    Evaluates fit between a Job and Candidate based strictly on objective merit.
    
    SCORING FORMULA:
    Overall = 0.45 * Skills Match
            + 0.20 * Experience Match
            + 0.20 * Project/Evidence Relevance
            + 0.15 * Requirement Coverage
            
    ETHICAL & RESPONSIBLE AI GUARDRAILS:
    Sensitive attributes (name, gender, age, photo, email, phone, location)
    are strictly excluded from the evaluation.
    """
    
    # Gather candidate skills
    candidate_skills_raw: List[str] = list(candidate.skills or [])
    resume_json: Dict[str, Any] = {}
    projects_list: List[Dict[str, Any]] = []
    experience_list: List[Dict[str, Any]] = []
    raw_resume_text: str = ""
    
    if latest_resume:
        resume_json = latest_resume.extracted_json or {}
        raw_resume_text = (latest_resume.raw_text or "").lower()
        res_skills = resume_json.get("skills", [])
        if isinstance(res_skills, list):
            candidate_skills_raw.extend(res_skills)
        projects_list = resume_json.get("projects", []) or []
        experience_list = resume_json.get("experience", []) or []
        
    # Also check candidate.profile_json for projects if any
    cand_profile_json = candidate.profile_json or {}
    if not projects_list and isinstance(cand_profile_json, dict):
        projects_list = cand_profile_json.get("projects", []) or []
    if not experience_list and isinstance(cand_profile_json, dict):
        experience_list = cand_profile_json.get("experience", []) or []

    # Canonicalize candidate skills map: normalized_lower -> original display name
    cand_skills_canonical: Dict[str, str] = {}
    for sk in candidate_skills_raw:
        if isinstance(sk, str) and sk.strip():
            norm = _normalize_skill(sk)
            cand_skills_canonical[norm.lower()] = norm

    # Job required & preferred skills
    job_required: List[str] = job.required_skills or []
    job_preferred: List[str] = job.preferred_skills or []

    # Combined searchable evidence text (projects descriptions, experience bullets, raw resume)
    evidence_corpus_items: List[str] = []
    for p in projects_list:
        if isinstance(p, dict):
            evidence_corpus_items.append(f"{p.get('name', '')} {p.get('description', '')} {' '.join(p.get('technologies', []))}")
    for exp in experience_list:
        if isinstance(exp, dict):
            evidence_corpus_items.append(f"{exp.get('title', '')} {exp.get('company', '')} {exp.get('description', '')}")
    evidence_corpus = " ".join(evidence_corpus_items).lower() + " " + raw_resume_text

    # 1. Evaluate Skills Match (45%)
    skill_evaluations: List[Dict[str, Any]] = []
    req_matched_count = 0
    req_unclear_count = 0
    pref_matched_count = 0
    pref_unclear_count = 0

    def evaluate_single_skill(skill_name: str, category: str) -> Dict[str, Any]:
        norm_skill = _normalize_skill(skill_name)
        norm_lower = norm_skill.lower()
        
        # Check direct match in candidate skills
        if norm_lower in cand_skills_canonical:
            return {
                "skill": norm_skill,
                "category": category,
                "status": "matched",
                "evidence": f"Explicitly listed in verified candidate skills as '{cand_skills_canonical[norm_lower]}'"
            }
            
        # Check if skill keyword appears strongly in evidence corpus (e.g. project descriptions)
        # Use regex word boundary to avoid false positives like 'c' in 'cat'
        pattern = r'\b' + re.escape(norm_lower) + r'\b'
        if re.search(pattern, evidence_corpus):
            # Extract short context excerpt
            match_obj = re.search(pattern, evidence_corpus)
            start = max(0, match_obj.start() - 30)
            end = min(len(evidence_corpus), match_obj.end() + 40)
            excerpt = evidence_corpus[start:end].strip().replace('\n', ' ')
            return {
                "skill": norm_skill,
                "category": category,
                "status": "matched",
                "evidence": f"Demonstrated in project/experience records: '...{excerpt}...'"
            }
            
        # Check partial/alias mention or secondary keywords
        cleaned_search = re.sub(r'[^a-z0-9]', '', norm_lower)
        if len(cleaned_search) >= 3 and cleaned_search in evidence_corpus:
            return {
                "skill": norm_skill,
                "category": category,
                "status": "unclear",
                "evidence": "Mentioned partially in project or education notes; limited practical evidence"
            }
            
        return {
            "skill": norm_skill,
            "category": category,
            "status": "missing",
            "evidence": "Not found in skills inventory, project details, or verified experience"
        }

    for sk in job_required:
        ev = evaluate_single_skill(sk, "required")
        skill_evaluations.append(ev)
        if ev["status"] == "matched":
            req_matched_count += 1
        elif ev["status"] == "unclear":
            req_unclear_count += 1

    for sk in job_preferred:
        ev = evaluate_single_skill(sk, "preferred")
        skill_evaluations.append(ev)
        if ev["status"] == "matched":
            pref_matched_count += 1
        elif ev["status"] == "unclear":
            pref_unclear_count += 1

    total_req = max(1, len(job_required))
    req_score_fraction = (req_matched_count + 0.5 * req_unclear_count) / total_req
    
    # Preferred skills provide a modest bonus up to +15%
    pref_score_fraction = 0.0
    if job_preferred:
        pref_score_fraction = (pref_matched_count + 0.5 * pref_unclear_count) / len(job_preferred)
        skills_score = min(100.0, (req_score_fraction * 85.0) + (pref_score_fraction * 15.0))
    else:
        skills_score = min(100.0, req_score_fraction * 100.0)

    # 2. Evaluate Experience Match (20%)
    req_exp_years = _extract_numeric_years(job.experience)
    cand_exp_years = _extract_numeric_years(candidate.experience_years)
    
    if req_exp_years <= 0.5:
        exp_score = 100.0
        exp_explanation = f"Entry level or flexible requirement ({job.experience}). Candidate possesses {candidate.experience_years or 'relevant background'}."
    else:
        if cand_exp_years >= req_exp_years:
            exp_score = 100.0
            exp_explanation = f"Candidate experience ({cand_exp_years:.1f} yrs) meets or exceeds job requirement ({req_exp_years:.1f} yrs)."
        else:
            ratio = cand_exp_years / req_exp_years
            exp_score = max(30.0, min(95.0, ratio * 100.0))
            exp_explanation = f"Candidate experience ({cand_exp_years:.1f} yrs) partially satisfies required tenure ({req_exp_years:.1f} yrs)."

    # 3. Evaluate Project / Evidence Relevance (20%)
    # Count how many relevant projects demonstrate job-related technologies
    relevant_projects_count = 0
    project_highlights = []
    all_job_skills_lower = [s.lower() for s in (job_required + job_preferred)]
    
    matched_keywords_in_projects = set()
    for proj in projects_list:
        if isinstance(proj, dict):
            p_name = proj.get("name", "Project")
            p_desc = (proj.get("description", "") + " " + " ".join(proj.get("technologies", []))).lower()
            hit_skills = [s for s in all_job_skills_lower if s in p_desc]
            if hit_skills:
                relevant_projects_count += 1
                matched_keywords_in_projects.update(hit_skills)
                project_highlights.append(f"{p_name}: Demonstrates {', '.join(hit_skills[:3])}")
                
    if relevant_projects_count >= 2:
        proj_score = min(100.0, 75.0 + (len(matched_keywords_in_projects) * 5.0))
    elif relevant_projects_count == 1:
        proj_score = min(85.0, 60.0 + (len(matched_keywords_in_projects) * 5.0))
    elif len(evidence_corpus.strip()) > 100:
        proj_score = 55.0
        project_highlights.append("General technical evidence detected across resume sections.")
    else:
        proj_score = 40.0
        project_highlights.append("Limited detailed project evidence provided in profile.")

    # 4. Evaluate Requirement Coverage (15%)
    # Strict coverage of required mandatory skills
    coverage_score = min(100.0, (req_matched_count / total_req) * 100.0)

    # Calculate Overall Weighted Score:
    # 0.45 * Skills + 0.20 * Experience + 0.20 * Projects + 0.15 * Coverage
    overall_score = (
        (0.45 * skills_score) +
        (0.20 * exp_score) +
        (0.20 * proj_score) +
        (0.15 * coverage_score)
    )
    overall_score = round(max(0.0, min(100.0, overall_score)), 1)

    # 5. Build Explainability Breakdown Output
    matched_skills = [s["skill"] for s in skill_evaluations if s["status"] == "matched"]
    unclear_skills = [s["skill"] for s in skill_evaluations if s["status"] == "unclear"]
    missing_skills = [s["skill"] for s in skill_evaluations if s["status"] == "missing"]

    explanation_lines = []
    for ev in skill_evaluations:
        status_icon = "✓ matched" if ev["status"] == "matched" else ("⚠ unclear" if ev["status"] == "unclear" else "✕ missing")
        explanation_lines.append(f"• {ev['skill']} ({ev['category']}): {status_icon} — {ev['evidence']}")

    explanation_text = (
        f"HireSense Match Analysis: {overall_score}%\n\n"
        f"Skill Breakdown:\n" + "\n".join(explanation_lines) + "\n\n"
        f"Experience Assessment: {exp_explanation} (Score: {round(exp_score, 1)}%)\n"
        f"Project & Evidence Relevance: Found {relevant_projects_count} relevant project(s) verifying practical application. (Score: {round(proj_score, 1)}%)\n"
        f"Requirement Coverage: {req_matched_count}/{total_req} mandatory job requirements satisfied. (Score: {round(coverage_score, 1)}%)\n\n"
        f"Key Strengths: {', '.join(matched_skills[:4]) if matched_skills else 'Baseline qualifications'}.\n"
    )
    if missing_skills:
        explanation_text += f"Identified Gaps: {', '.join(missing_skills[:3])}.\n"
    if unclear_skills:
        explanation_text += f"Unclear / Needs Recruiter Probing: {', '.join(unclear_skills[:2])}.\n"

    explanation_text += (
        "\nResponsible AI Notice: Sensitive demographic traits (name, gender, age, contact, photo) "
        "are strictly excluded from this objective calculation. This score serves solely as an explanatory "
        "decision-support signal for human recruiters, not an automated hiring determination."
    )

    components_json = {
        "formula": "Overall = 0.45 × Skills + 0.20 × Experience + 0.20 × Projects + 0.15 × Coverage",
        "weights": {
            "skills": 0.45,
            "experience": 0.20,
            "projects": 0.20,
            "coverage": 0.15
        },
        "scores": {
            "overall": overall_score,
            "skills": round(skills_score, 1),
            "experience": round(exp_score, 1),
            "projects": round(proj_score, 1),
            "coverage": round(coverage_score, 1)
        },
        "skills_matrix": skill_evaluations,
        "matched_skills": matched_skills,
        "unclear_skills": unclear_skills,
        "missing_skills": missing_skills,
        "experience_detail": {
            "required_str": job.experience,
            "candidate_str": candidate.experience_years or "1-2 years",
            "required_num": req_exp_years,
            "candidate_num": cand_exp_years,
            "score": round(exp_score, 1),
            "explanation": exp_explanation
        },
        "projects_detail": {
            "relevant_count": relevant_projects_count,
            "highlights": project_highlights,
            "score": round(proj_score, 1)
        },
        "coverage_detail": {
            "required_total": total_req,
            "required_matched": req_matched_count,
            "score": round(coverage_score, 1)
        },
        "sensitive_attributes_excluded": [
            "name", "gender", "photo", "age", "phone", "email", "location", "nationality"
        ]
    }

    return {
        "overall_score": overall_score,
        "skills_score": round(skills_score, 1),
        "experience_score": round(exp_score, 1),
        "projects_score": round(proj_score, 1),
        "coverage_score": round(coverage_score, 1),
        "components_json": components_json,
        "explanation": explanation_text
    }
