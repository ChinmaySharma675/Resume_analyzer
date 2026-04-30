"""
Tests for the Resume Analyzer scoring engine.
Tests generic resume quality analysis and scoring accuracy.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.utils.analyzer import analyze_resume


class TestAnalyzerScoring:
    """Test the generic resume quality analyzer."""

    def test_empty_resume_scores_low(self):
        """Empty resume should score very low."""
        result = analyze_resume("")
        assert result['score'] < 20, f"Empty resume scored {result['score']}, expected < 20"

    def test_minimal_resume_scores_low(self):
        """Minimal text should score below 40."""
        result = analyze_resume("John Doe Python")
        assert result['score'] < 40

    def test_good_resume_scores_high(self):
        """A well-structured resume should score above 60."""
        good_resume = """
        John Doe | john@email.com | +91-9876543210 | github.com/johndoe | linkedin.com/in/johndoe

        Summary: Experienced software developer with 3 years in backend development.

        Education:
        B.Tech Computer Science - GLA University, 2024 | CGPA: 8.5

        Experience:
        Software Developer at TechCorp (2022-2024)
        - Developed REST APIs using Python and Flask, handling 1000+ requests/day
        - Optimized database queries reducing response time by 40%
        - Built CI/CD pipeline using GitHub Actions and Docker

        Projects:
        1. Resume Analyzer | Python, Flask, React, scikit-learn
           - Engineered NLP-based resume scoring using TF-IDF vectorization
           - Implemented skill extraction with 200+ regex patterns
           - Deployed on AWS serving 500+ users

        Skills: Python, Flask, React, Docker, AWS, PostgreSQL, Git, REST API, Machine Learning

        Certifications: AWS Cloud Practitioner, Google Data Analytics
        """
        result = analyze_resume(good_resume)
        assert result['score'] >= 60, f"Good resume scored {result['score']}, expected >= 60"

    def test_suggestions_returned(self):
        """Suggestions list should never be empty."""
        result = analyze_resume("Python developer")
        assert isinstance(result['suggestions'], list)
        assert len(result['suggestions']) > 0

    def test_section_breakdown_exists(self):
        """Section breakdown should have all categories."""
        result = analyze_resume("Test resume content")
        assert 'section_breakdown' in result
        names = [s['name'] for s in result['section_breakdown']]
        assert 'Skills & Technologies' in names
        assert 'Projects & Portfolio' in names
        assert 'Education' in names

    def test_score_capped_at_100(self):
        """Score should never exceed 100."""
        result = analyze_resume("Python " * 500)
        assert result['score'] <= 100

    def test_missing_education_detected(self):
        """Resume without education keywords should flag it."""
        result = analyze_resume("Python developer skilled in React")
        suggestions_text = " ".join([s['text'] for s in result['suggestions']])
        assert 'education' in suggestions_text.lower() or 'Education' in suggestions_text

    def test_word_count_returned(self):
        """Word count should be returned in the result."""
        text = "This is a sample resume with some words"
        result = analyze_resume(text)
        assert result['word_count'] > 0
