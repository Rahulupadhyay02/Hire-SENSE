import pytest
from app.ai_eval.run_evaluation import (
    run_resume_evaluation,
    run_matching_evaluation,
    run_interview_evaluation,
    run_human_vs_ai_comparison
)

def test_ai_eval_resume_extraction():
    res = run_resume_evaluation()
    assert res["total_cases"] == 20
    assert res["mean_precision"] > 0.70
    assert res["mean_f1"] > 0.65

def test_ai_eval_matching_bounds():
    res = run_matching_evaluation()
    assert res["total_cases"] == 15
    assert res["bound_accuracy_pct"] >= 80.0

def test_ai_eval_interview_intelligence():
    res = run_interview_evaluation()
    assert res["total_cases"] == 16
    assert res["star_heuristic_accuracy_pct"] >= 85.0
    assert res["guardrail_compliance_pct"] == 100.0

def test_ai_eval_human_vs_ai_agreement():
    res = run_human_vs_ai_comparison()
    assert res["total_comparisons"] == 32
    # Pearson correlation should exceed 0.85
    assert res["pearson_correlation_r"] >= 0.85
    # Mean Absolute Error should be under 10.0 points
    assert res["mean_absolute_error_mae"] < 10.0
