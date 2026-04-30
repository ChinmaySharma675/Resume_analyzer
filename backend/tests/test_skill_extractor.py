"""
Tests for the Skill Extraction engine.
Validates that skills are correctly identified from resume text.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.utils.skill_extractor import extract_skills


class TestSkillExtraction:
    """Test the 200+ skill regex extraction engine."""

    def test_basic_python_detection(self):
        """Python should be detected."""
        skills = extract_skills("I am proficient in Python programming")
        assert 'Python' in skills

    def test_javascript_detection(self):
        """JavaScript should be detected."""
        skills = extract_skills("Experienced with JavaScript and TypeScript")
        assert 'JavaScript' in skills

    def test_react_detection(self):
        """React should be detected."""
        skills = extract_skills("Built frontend using React.js and Redux")
        assert any('React' in s for s in skills)

    def test_multiple_skills(self):
        """Multiple skills should be detected from a skills section."""
        text = "Skills: Python, Java, React, Docker, AWS, PostgreSQL, Git"
        skills = extract_skills(text)
        assert len(skills) >= 5, f"Expected >= 5 skills, got {len(skills)}: {skills}"

    def test_no_false_positives(self):
        """Random text should not produce many skills."""
        text = "I went to the store and bought groceries for dinner"
        skills = extract_skills(text)
        assert len(skills) <= 1, f"Too many false positives: {skills}"

    def test_case_insensitive(self):
        """Skill detection should work regardless of case."""
        skills_upper = extract_skills("PYTHON JAVA DOCKER")
        skills_lower = extract_skills("python java docker")
        # At least Python should be found in both
        assert len(skills_upper) >= 1
        assert len(skills_lower) >= 1

    def test_ml_skills(self):
        """ML-specific skills should be detected."""
        text = "Experienced with TensorFlow, PyTorch, scikit-learn, and Pandas"
        skills = extract_skills(text)
        assert len(skills) >= 3, f"Expected >= 3 ML skills, got {len(skills)}: {skills}"

    def test_cloud_skills(self):
        """Cloud/DevOps skills should be detected."""
        text = "Used AWS, Docker, Kubernetes, and Terraform in production"
        skills = extract_skills(text)
        assert len(skills) >= 3, f"Expected >= 3 cloud skills, got {len(skills)}: {skills}"

    def test_database_skills(self):
        """Database technologies should be detected."""
        text = "Worked with MySQL, MongoDB, Redis, and PostgreSQL"
        skills = extract_skills(text)
        assert len(skills) >= 3, f"Expected >= 3 DB skills, got {len(skills)}: {skills}"

    def test_empty_input(self):
        """Empty string should return empty list."""
        skills = extract_skills("")
        assert isinstance(skills, list)
        assert len(skills) == 0

    def test_no_duplicates(self):
        """Skills list should not contain duplicates."""
        text = "Python Python Python Java Java"
        skills = extract_skills(text)
        assert len(skills) == len(set(skills)), f"Duplicates found: {skills}"
