import re
from resume_matching.skills_data import SKILL_ALIASES

def normalize_skill_name(skill_str):
    """
    Returns the canonical capitalized name for a skill if recognized,
    or title-cases the string.
    """
    cleaned = skill_str.strip().lower()
    return SKILL_ALIASES.get(cleaned, skill_str.strip().title())

def extract_skills_from_text(text):
    """
    Searches text for known technology and engineering skills using regex word boundaries.
    Returns a sorted list of unique canonical skill names.
    """
    if not text:
        return []

    found_skills = set()
    lowered_text = " " + text.lower() + " "

    # Sort aliases by length descending so longer phrases match first (e.g. 'rest api' before 'rest')
    sorted_aliases = sorted(SKILL_ALIASES.items(), key=lambda x: len(x[0]), reverse=True)

    for alias, canonical_name in sorted_aliases:
        # Regex pattern matching whole word / symbols safely
        pattern = r'(?<![a-zA-Z0-9_#+])' + re.escape(alias) + r'(?![a-zA-Z0-9_#+])'
        if re.search(pattern, lowered_text):
            found_skills.add(canonical_name)

    return sorted(list(found_skills))

def calculate_resume_match(required_skills_raw, resume_text="", candidate_skills_raw=""):
    """
    Compares required job skills with candidate resume text and declared candidate skills.
    Returns match statistics and breakdown.
    """
    # Parse required skills
    required_skills = []
    if isinstance(required_skills_raw, list):
        for s in required_skills_raw:
            if s and s.strip():
                required_skills.append(normalize_skill_name(s))
    elif isinstance(required_skills_raw, str):
        for s in required_skills_raw.split(','):
            if s.strip():
                required_skills.append(normalize_skill_name(s))

    # Remove duplicates preserving order
    seen = set()
    deduped_required = []
    for s in required_skills:
        if s.lower() not in seen:
            seen.add(s.lower())
            deduped_required.append(s)

    # Extract skills from resume text
    extracted_from_resume = set(extract_skills_from_text(resume_text))

    # Add any directly declared candidate skills
    if candidate_skills_raw:
        if isinstance(candidate_skills_raw, list):
            for s in candidate_skills_raw:
                if s and s.strip():
                    extracted_from_resume.add(normalize_skill_name(s))
        elif isinstance(candidate_skills_raw, str):
            for s in candidate_skills_raw.split(','):
                if s.strip():
                    extracted_from_resume.add(normalize_skill_name(s))

    # Perform comparison
    candidate_skills_lower = {s.lower() for s in extracted_from_resume}
    
    matched_skills = []
    missing_skills = []

    for req in deduped_required:
        if req.lower() in candidate_skills_lower:
            matched_skills.append(req)
        else:
            missing_skills.append(req)

    total_required = len(deduped_required)
    if total_required > 0:
        match_score = min(100, round((len(matched_skills) / total_required) * 100))
    else:
        match_score = 100

    return {
        'required_skills_count': total_required,
        'matched_skills_count': len(matched_skills),
        'match_score': match_score,
        'matched_skills': matched_skills,
        'missing_skills': missing_skills,
        'candidate_all_skills': sorted(list(extracted_from_resume)),
        'disclaimer': "Resume match score is an algorithmic keyword-based indicator to assist review and does not guarantee hiring suitability."
    }
