"""
Phase 7 — Interview Communication Metrics Engine
=================================================
Computes structured communication quality metrics from a Whisper transcript.

All metrics are deterministic (same transcript → same scores) and computed
entirely from the transcript text + segment timestamps. No external API calls.

Metrics computed
----------------
  wpm                  — Speaking pace (words per minute)
  filler_word_rate     — Filler words as % of total words
  filler_words_found   — Unique filler types detected
  filler_count         — Total filler word occurrences
  structure_score      — Answer structure quality (0–100), STAR-signal heuristic
  clarity_score        — Vocabulary diversity + sentence length balance (0–100)
  relevance_score      — Keyword overlap with job required skills (0–100)
  overall_score        — Weighted composite (0–100)
  word_count
  sentence_count
  unique_word_ratio    — Type-token ratio (lexical richness)
  strengths            — List[str]: auto-generated positive observations
  improvements         — List[{label, current, target, action}]: coaching advice
  radar                — List[{area, value}]: for Recharts RadarChart
  progress_snapshot    — Compact dict for trend charts
"""

from __future__ import annotations
import re
import math
from typing import List, Optional


# ── Filler words dictionary ─────────────────────────────────────────────────
FILLER_WORDS: set[str] = {
    "um", "uh", "umm", "uhh", "er", "hmm",
    "like", "basically", "literally", "obviously", "clearly",
    "you know", "you know what i mean", "i mean",
    "sort of", "kind of", "kinda", "sorta",
    "right", "okay", "so", "well", "anyway",
    "actually", "essentially", "just", "simply",
    "and so", "and uh", "and um",
}

# Single-word fillers (multi-word handled separately)
FILLER_SINGLE: set[str] = {
    "um", "uh", "umm", "uhh", "er", "hmm",
    "like", "basically", "literally", "obviously", "clearly",
    "right", "okay", "so", "well", "anyway",
    "actually", "essentially", "just", "simply",
    "kinda", "sorta",
}

# Multi-word fillers (checked on the full text)
FILLER_PHRASES: list[str] = [
    "you know what i mean",
    "you know",
    "i mean",
    "sort of",
    "kind of",
    "and so",
    "and uh",
    "and um",
]

# ── STAR structure signal phrases ────────────────────────────────────────────
SITUATION_SIGNALS = ["in my", "at my", "when i was", "in a project", "working at", "we were"]
TASK_SIGNALS = ["my task", "my role", "i was responsible", "i needed to", "we needed to", "the goal was"]
ACTION_SIGNALS = ["i implemented", "i built", "i developed", "i designed", "i created", "i used", "i wrote",
                  "i worked", "i led", "i collaborated", "i fixed", "i optimized", "i refactored"]
RESULT_SIGNALS = ["as a result", "this resulted", "we achieved", "we reduced", "we improved",
                  "which led to", "the outcome", "performance improved", "we saved", "we increased",
                  "successfully", "the impact was", "the result was"]


# ── Core computation ─────────────────────────────────────────────────────────

def compute_metrics(
    transcript: str,
    segments: Optional[List[dict]],
    duration_seconds: Optional[float],
    job_skills: Optional[List[str]] = None
) -> dict:
    """
    Compute all Phase 7 communication metrics.

    Args:
        transcript:       Full transcript text from STT.
        segments:         List of {start, end, text} dicts from Whisper.
        duration_seconds: Total audio duration.
        job_skills:       Required skills from the job posting (for relevance).

    Returns:
        Dict with all metrics, strengths, improvements, radar data, and progress snapshot.
    """
    if not transcript or not transcript.strip():
        return _empty_metrics()

    text = transcript.strip()
    text_lower = text.lower()
    job_skills = job_skills or []

    # ── 1. Word & sentence counts ────────────────────────────────────────────
    words_raw = re.findall(r"\b[a-zA-Z']+\b", text)
    word_count = len(words_raw)
    words_lower = [w.lower() for w in words_raw]

    sentences = re.split(r"[.!?]+", text)
    sentences = [s.strip() for s in sentences if s.strip() and len(s.strip()) > 3]
    sentence_count = max(len(sentences), 1)

    # ── 2. Speaking Pace (WPM) ────────────────────────────────────────────────
    if duration_seconds and duration_seconds > 0:
        duration_min = duration_seconds / 60.0
        wpm = round(word_count / duration_min)
    else:
        # Estimate from segments if available
        if segments and len(segments) > 0:
            total_dur = segments[-1].get("end", 0) - segments[0].get("start", 0)
            if total_dur > 0:
                wpm = round(word_count / (total_dur / 60.0))
            else:
                wpm = _estimate_wpm_from_text(word_count)
        else:
            wpm = _estimate_wpm_from_text(word_count)

    # ── 3. Filler Word Rate ───────────────────────────────────────────────────
    filler_count = 0
    filler_types_found: set[str] = set()

    # Check multi-word phrases first on the full lowercased text
    text_for_phrases = text_lower
    for phrase in FILLER_PHRASES:
        occurrences = len(re.findall(r"\b" + re.escape(phrase) + r"\b", text_for_phrases))
        if occurrences > 0:
            filler_count += occurrences
            filler_types_found.add(phrase)

    # Check single-word fillers on token list
    for word in words_lower:
        if word in FILLER_SINGLE:
            filler_count += 1
            filler_types_found.add(word)

    filler_word_rate = round((filler_count / word_count) * 100, 2) if word_count > 0 else 0.0

    # ── 4. Structure Score (STAR heuristic) ───────────────────────────────────
    structure_score = _compute_structure_score(text_lower)

    # ── 5. Clarity Score (lexical diversity + sentence balance) ───────────────
    unique_words = set(words_lower)
    unique_word_ratio = round(len(unique_words) / word_count, 3) if word_count > 0 else 0
    avg_sentence_len = word_count / sentence_count

    clarity_score = _compute_clarity_score(unique_word_ratio, avg_sentence_len)

    # ── 6. Relevance Score (job skill keyword overlap) ────────────────────────
    relevance_score = _compute_relevance_score(text_lower, job_skills)

    # ── 7. Pace score (normalized — ideal: 120–160 WPM) ──────────────────────
    pace_score = _compute_pace_score(wpm)

    # ── 8. Filler score (lower is better) ────────────────────────────────────
    # 0% filler → 100 score; ≥10% → 0 score
    filler_score = max(0.0, round(100 - (filler_word_rate * 10), 1))

    # ── 9. Overall weighted composite score ──────────────────────────────────
    overall_score = round(
        0.25 * pace_score +
        0.20 * filler_score +
        0.25 * structure_score +
        0.15 * clarity_score +
        0.15 * relevance_score,
        1
    )

    # ── 10. Strengths and improvements ───────────────────────────────────────
    strengths = _generate_strengths(wpm, filler_word_rate, structure_score, clarity_score, relevance_score, job_skills)
    improvements = _generate_improvements(wpm, filler_word_rate, structure_score, clarity_score, relevance_score,
                                          filler_types_found, job_skills)

    # ── 11. Radar data for frontend chart ────────────────────────────────────
    radar = [
        {"area": "Relevance",  "value": relevance_score},
        {"area": "Structure",  "value": structure_score},
        {"area": "Fluency",    "value": filler_score},
        {"area": "Clarity",    "value": clarity_score},
        {"area": "Pace",       "value": pace_score},
    ]

    # ── 12. Progress snapshot (compact, for trend charts) ─────────────────────
    progress_snapshot = {
        "score": overall_score,
        "filler_rate": filler_word_rate,
        "wpm": wpm,
        "structure": structure_score,
    }

    return {
        # Core metrics
        "wpm": wpm,
        "filler_word_rate": filler_word_rate,
        "filler_count": filler_count,
        "filler_words_found": sorted(list(filler_types_found)),
        "structure_score": structure_score,
        "clarity_score": clarity_score,
        "relevance_score": relevance_score,
        "pace_score": pace_score,
        "filler_score": filler_score,
        "overall_score": overall_score,
        # Counts
        "word_count": word_count,
        "sentence_count": sentence_count,
        "unique_word_ratio": unique_word_ratio,
        "avg_sentence_length": round(avg_sentence_len, 1),
        # Narrative
        "strengths": strengths,
        "improvements": improvements,
        # Chart data
        "radar": radar,
        "progress_snapshot": progress_snapshot,
    }


# ── Helper: WPM estimation from text only (fallback) ────────────────────────
def _estimate_wpm_from_text(word_count: int) -> int:
    """Estimate WPM assuming average 130 WPM speaking rate."""
    return 130  # default assumption when no timing data


# ── Helper: Structure score (STAR heuristic) ─────────────────────────────────
def _compute_structure_score(text_lower: str) -> int:
    """
    Score answer structure based on STAR signal phrase coverage.
    Each STAR component adds up to 25 points.
    Bonus +5 if all 4 components detected.
    """
    score = 0
    components_found = 0

    def _has_any(signals: list[str]) -> bool:
        return any(sig in text_lower for sig in signals)

    if _has_any(SITUATION_SIGNALS):
        score += 25
        components_found += 1
    if _has_any(TASK_SIGNALS):
        score += 20
        components_found += 1
    if _has_any(ACTION_SIGNALS):
        score += 30
        components_found += 1
    if _has_any(RESULT_SIGNALS):
        score += 25
        components_found += 1

    # Full STAR bonus
    if components_found == 4:
        score = min(100, score + 5)

    # Minimum baseline: if answer is non-trivial, give partial credit
    if score == 0 and len(text_lower.split()) > 20:
        score = 20  # minimal credit for a real answer attempt

    return min(100, score)


# ── Helper: Clarity score ─────────────────────────────────────────────────────
def _compute_clarity_score(unique_word_ratio: float, avg_sentence_len: float) -> int:
    """
    Clarity = vocabulary richness + appropriate sentence length.
    - unique_word_ratio: ideal ~0.50–0.70 (diverse but not random)
    - avg_sentence_len: ideal ~10–20 words
    """
    # Vocabulary richness score (0–50 points)
    # 0.6 ratio is ideal — too low means repetitive, too high means erratic
    vocab_score = max(0, min(50, int(unique_word_ratio * 80)))

    # Sentence length score (0–50 points)
    if 10 <= avg_sentence_len <= 20:
        len_score = 50
    elif 8 <= avg_sentence_len < 10 or 20 < avg_sentence_len <= 25:
        len_score = 38
    elif 5 <= avg_sentence_len < 8 or 25 < avg_sentence_len <= 32:
        len_score = 25
    else:
        len_score = 10

    return min(100, vocab_score + len_score)


# ── Helper: Relevance score ───────────────────────────────────────────────────
def _compute_relevance_score(text_lower: str, job_skills: List[str]) -> int:
    """
    Relevance = what fraction of the job's required skills are mentioned in the transcript.
    Falls back to a technical keyword baseline if no job skills are available.
    """
    GENERIC_TECH_KEYWORDS = [
        "python", "fastapi", "sql", "database", "api", "backend",
        "frontend", "react", "javascript", "docker", "git", "testing",
        "machine learning", "data", "algorithm", "performance",
        "optimization", "architecture", "design", "system", "cloud",
        "deploy", "ci/cd", "agile", "scrum", "rest", "graphql",
    ]

    skill_pool = job_skills if job_skills else GENERIC_TECH_KEYWORDS
    if not skill_pool:
        return 60  # no-skills fallback

    matched = 0
    for skill in skill_pool:
        # Normalize skill for matching
        skill_norm = skill.lower().strip()
        # Allow partial matches for multi-word skills (e.g., "Machine Learning")
        if skill_norm in text_lower or any(part in text_lower for part in skill_norm.split() if len(part) > 3):
            matched += 1

    ratio = matched / len(skill_pool)

    # Map ratio to 0–100 with a curve that rewards partial coverage
    if ratio >= 0.80:
        return 95
    elif ratio >= 0.60:
        return round(75 + (ratio - 0.60) * 100)
    elif ratio >= 0.40:
        return round(55 + (ratio - 0.40) * 100)
    elif ratio >= 0.20:
        return round(35 + (ratio - 0.20) * 100)
    else:
        return max(20, round(ratio * 100))


# ── Helper: Pace score ────────────────────────────────────────────────────────
def _compute_pace_score(wpm: int) -> int:
    """
    Ideal speaking pace for interviews: 120–160 WPM.
    Below 100 or above 200: poor score.
    """
    if 120 <= wpm <= 160:
        return 95
    elif 100 <= wpm < 120:
        return 80
    elif 160 < wpm <= 180:
        return 78
    elif 80 <= wpm < 100:
        return 60
    elif 180 < wpm <= 200:
        return 60
    elif wpm < 80:
        return 35
    else:  # > 200
        return 40


# ── Helper: Strengths narrative ───────────────────────────────────────────────
def _generate_strengths(wpm, filler_rate, structure, clarity, relevance, job_skills) -> List[str]:
    strengths = []
    if relevance >= 75:
        skills_str = ", ".join(job_skills[:3]) if job_skills else "key technical topics"
        strengths.append(f"Strong technical relevance — covered {skills_str} and related areas")
    if filler_rate < 3.0:
        strengths.append(f"Minimal filler words ({filler_rate}%) — very fluent delivery")
    elif filler_rate < 5.0:
        strengths.append(f"Low filler word usage ({filler_rate}%) — good speech fluency")
    if structure >= 75:
        strengths.append("Well-structured answers using context, action, and outcome")
    if clarity >= 75:
        strengths.append("Clear, varied vocabulary with well-balanced sentence length")
    if 120 <= wpm <= 155:
        strengths.append(f"Excellent speaking pace ({wpm} WPM) — easy to follow")
    elif 110 <= wpm < 120 or 155 < wpm <= 170:
        strengths.append(f"Good speaking pace ({wpm} WPM)")
    if not strengths:
        strengths.append("Completed a structured interview response")
    return strengths


# ── Helper: Improvement coaching ─────────────────────────────────────────────
def _generate_improvements(wpm, filler_rate, structure, clarity, relevance,
                            filler_types_found, job_skills) -> List[dict]:
    improvements = []

    if filler_rate >= 3.0:
        common_fillers = ", ".join(f'"{w}"' for w in sorted(list(filler_types_found))[:4])
        improvements.append({
            "label": "Filler words",
            "current": f"{filler_rate}%",
            "target": "< 2%",
            "action": f"Most frequent fillers: {common_fillers if common_fillers else 'um, uh, like'}. "
                      "Before answering, pause 1–2 seconds instead. Practice recording yourself and counting fillers.",
            "icon": "💬",
            "priority": "high" if filler_rate >= 6.0 else "medium"
        })

    if structure < 70:
        improvements.append({
            "label": "Answer structure",
            "current": f"{structure}/100",
            "target": "75+",
            "action": "Use the STAR format: Situation → Task → Action → Result. "
                      "End each answer with a measurable outcome (%, time saved, users affected).",
            "icon": "📐",
            "priority": "high" if structure < 45 else "medium"
        })

    if wpm < 110:
        improvements.append({
            "label": "Speaking pace (too slow)",
            "current": f"{wpm} WPM",
            "target": "120–155 WPM",
            "action": "Slightly increase your speaking speed. Practice with a timer — aim for 2 minutes of content "
                      "in approximately 260–310 words.",
            "icon": "⏱️",
            "priority": "medium"
        })
    elif wpm > 175:
        improvements.append({
            "label": "Speaking pace (too fast)",
            "current": f"{wpm} WPM",
            "target": "120–155 WPM",
            "action": "Slow down slightly — interviewers need time to absorb your answers. "
                      "Use deliberate pauses between key points.",
            "icon": "⏱️",
            "priority": "medium"
        })

    if clarity < 65:
        improvements.append({
            "label": "Clarity & vocabulary",
            "current": f"{clarity}/100",
            "target": "70+",
            "action": "Vary your vocabulary and keep sentences concise (10–18 words). "
                      "Avoid repeating the same phrases. Read technical blogs to expand vocabulary.",
            "icon": "📖",
            "priority": "low"
        })

    if relevance < 55:
        skill_hint = ", ".join(job_skills[:4]) if job_skills else "relevant technical skills"
        improvements.append({
            "label": "Technical relevance",
            "current": f"{relevance}/100",
            "target": "70+",
            "action": f"Mention specific technologies by name: {skill_hint}. "
                      "Connect your experience to the job requirements explicitly.",
            "icon": "🎯",
            "priority": "high" if relevance < 35 else "medium"
        })

    # Sort by priority: high → medium → low
    priority_order = {"high": 0, "medium": 1, "low": 2}
    improvements.sort(key=lambda x: priority_order.get(x.get("priority", "low"), 2))
    return improvements


# ── Empty metrics fallback ────────────────────────────────────────────────────
def _empty_metrics() -> dict:
    return {
        "wpm": 0,
        "filler_word_rate": 0.0,
        "filler_count": 0,
        "filler_words_found": [],
        "structure_score": 0,
        "clarity_score": 0,
        "relevance_score": 0,
        "pace_score": 0,
        "filler_score": 0,
        "overall_score": 0.0,
        "word_count": 0,
        "sentence_count": 0,
        "unique_word_ratio": 0.0,
        "avg_sentence_length": 0.0,
        "strengths": [],
        "improvements": [],
        "radar": [
            {"area": "Relevance", "value": 0},
            {"area": "Structure", "value": 0},
            {"area": "Fluency",   "value": 0},
            {"area": "Clarity",   "value": 0},
            {"area": "Pace",      "value": 0},
        ],
        "progress_snapshot": {"score": 0, "filler_rate": 0, "wpm": 0, "structure": 0},
    }
