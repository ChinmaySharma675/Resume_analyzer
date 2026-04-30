"""
Tests for the Job Analyzer (TF-IDF scoring + suggestions engine).
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.utils.job_analyzer import analyze_resume_against_job


class TestJobAnalyzer:
    """Test the job-aware analysis engine."""

    SAMPLE_RESUME = """
    Anurag Yadav | anurag@email.com | github.com/anurag

    Summary: Computer Science student skilled in Python and web development.

    Education:
    B.Tech CSE (AIML) - GLA University, 2026 | CGPA: 8.2

    Skills: Python, React, Flask, SQL, Machine Learning, Docker, Git

    Projects:
    1. Resume Analyzer - Built NLP pipeline using TF-IDF for resume scoring
    2. E-commerce Platform - Full stack app with React and Flask

    Experience:
    Intern at XYZ Corp (June 2025 - Aug 2025)
    - Developed REST APIs serving 200+ users
    - Automated testing pipeline reducing deployment time by 30%
    """

    SAMPLE_JD = """
    We are looking for a Python Developer with experience in Flask, REST APIs,
    and SQL databases. Knowledge of Docker, CI/CD, and cloud platforms is preferred.
    Strong problem solving and communication skills required.
    """

    def test_returns_valid_structure(self):
        """Result should have overall_score, suggestions, and match data."""
        result = analyze_resume_against_job(self.SAMPLE_RESUME, self.SAMPLE_JD)
        assert 'overall_score' in result
        assert 'suggestions' in result
        assert 'matched_keywords' in result
        assert 'missing_keywords' in result

    def test_score_in_valid_range(self):
        """Score should be between 0 and 100."""
        result = analyze_resume_against_job(self.SAMPLE_RESUME, self.SAMPLE_JD)
        assert 0 <= result['overall_score'] <= 100

    def test_matching_resume_scores_well(self):
        """A resume matching the JD should score above 30."""
        result = analyze_resume_against_job(self.SAMPLE_RESUME, self.SAMPLE_JD)
        assert result['overall_score'] >= 30, f"Matching resume scored {result['overall_score']}, expected >= 30"

    def test_irrelevant_resume_scores_low(self):
        """A completely irrelevant resume should score low."""
        irrelevant = "Chef with 10 years experience in Italian cuisine. Specialized in pasta making."
        result = analyze_resume_against_job(irrelevant, self.SAMPLE_JD)
        assert result['overall_score'] < 40, f"Irrelevant resume scored {result['overall_score']}, expected < 40"

    def test_suggestions_are_generated(self):
        """Suggestions list should be non-empty."""
        result = analyze_resume_against_job(self.SAMPLE_RESUME, self.SAMPLE_JD)
        assert len(result['suggestions']) > 0

    def test_suggestions_capped_at_10(self):
        """Maximum 10 suggestions should be returned."""
        result = analyze_resume_against_job("Short resume", self.SAMPLE_JD)
        assert len(result['suggestions']) <= 10

    def test_matched_keywords_found(self):
        """Skills common to both resume and JD should be in matched_keywords."""
        result = analyze_resume_against_job(self.SAMPLE_RESUME, self.SAMPLE_JD)
        assert len(result['matched_keywords']) > 0

    def test_empty_resume_handled(self):
        """Engine should handle empty resume without crashing."""
        result = analyze_resume_against_job("", self.SAMPLE_JD)
        assert result['overall_score'] < 30
        assert isinstance(result['suggestions'], list)

    def test_empty_jd_handled(self):
        """Engine should handle empty job description without crashing."""
        result = analyze_resume_against_job(self.SAMPLE_RESUME, "")
        assert isinstance(result, dict)
        assert 'overall_score' in result

    def test_skill_match_component(self):
        """Skill match sub-score should be present."""
        result = analyze_resume_against_job(self.SAMPLE_RESUME, self.SAMPLE_JD)
        assert 'skill_match' in result
        assert result['skill_match'] >= 0
