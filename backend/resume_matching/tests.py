from django.test import TestCase
from resume_matching.matcher import extract_skills_from_text, calculate_resume_match

class ResumeMatchingTestCase(TestCase):
    def test_extract_skills_from_text(self):
        text = """
        Experienced Software Engineer with proficiency in Python, Django, and React.
        Hands-on experience with SQL databases such as MySQL and PostgreSQL.
        Familiar with Docker containerization, REST API design, and Git version control.
        """
        extracted = extract_skills_from_text(text)
        expected = {'Python', 'Django', 'React', 'SQL', 'MySQL', 'PostgreSQL', 'Docker', 'REST API', 'Git'}
        for skill in expected:
            self.assertIn(skill, extracted)

    def test_calculate_resume_match_perfect(self):
        job_skills = "Python, Django, SQL, Git"
        resume_text = "Proficient in Python, Django, SQL, and Git."
        result = calculate_resume_match(job_skills, resume_text=resume_text)

        self.assertEqual(result['match_score'], 100)
        self.assertEqual(len(result['matched_skills']), 4)
        self.assertEqual(len(result['missing_skills']), 0)

    def test_calculate_resume_match_partial(self):
        # 4 required skills, candidate has 2: Python and SQL (50% match)
        job_skills = "Python, Django, SQL, Kubernetes"
        resume_text = "Strong experience in Python and SQL databases."
        result = calculate_resume_match(job_skills, resume_text=resume_text)

        self.assertEqual(result['match_score'], 50)
        self.assertIn('Python', result['matched_skills'])
        self.assertIn('SQL', result['matched_skills'])
        self.assertIn('Django', result['missing_skills'])
        self.assertIn('Kubernetes', result['missing_skills'])

    def test_zero_required_skills(self):
        result = calculate_resume_match("", resume_text="Python React")
        self.assertEqual(result['match_score'], 100)

    def test_docx_parsing(self):
        import io
        import docx
        from resume_matching.parser import extract_text_from_file

        doc = docx.Document()
        doc.add_paragraph("Skills: Python, Django, REST API, Docker")
        stream = io.BytesIO()
        doc.save(stream)
        stream.seek(0)
        stream.name = 'resume.docx'

        extracted_text = extract_text_from_file(stream)
        self.assertIn("Python", extracted_text)
        self.assertIn("Docker", extracted_text)

    def test_empty_resume_handling(self):
        from resume_matching.parser import extract_text_from_file
        self.assertEqual(extract_text_from_file(""), "")

    def test_skill_normalization_and_aliases(self):
        from resume_matching.matcher import normalize_skill_name
        self.assertEqual(normalize_skill_name("js"), "JavaScript")
        self.assertEqual(normalize_skill_name("postgres"), "PostgreSQL")
        self.assertEqual(normalize_skill_name("golang"), "Go")

