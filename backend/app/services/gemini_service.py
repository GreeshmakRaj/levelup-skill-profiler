import json
import logging
import re
import google.genai as genai
from app.core.config import get_settings

logger = logging.getLogger("gemini_service")
if not logger.handlers:
    _handler = logging.StreamHandler()
    _handler.setFormatter(
        logging.Formatter("%(asctime)s [%(levelname)s] %(name)s: %(message)s")
    )
    logger.addHandler(_handler)
    logger.setLevel(logging.INFO)
    logger.propagate = False

_client = None


def _get_client():
    global _client
    if not _client:
        _client = genai.Client(api_key=get_settings().gemini_api_key)
    return _client


def _generate(prompt: str, method: str = "unknown") -> str:
    logger.info("LLM REQUEST  [%s]:\n%s", method, prompt)
    try:
        response = _get_client().models.generate_content(
            model=get_settings().gemini_model,
            contents=prompt
        )
    except Exception:
        logger.exception("LLM CALL FAILED [%s]", method)
        raise
    logger.info("LLM RESPONSE [%s]:\n%s", method, response.text)
    return response.text


def _parse_json(text: str) -> dict:
    """Strip markdown fences then parse JSON."""
    cleaned = re.sub(r"```(?:json)?", "", text).replace("```", "").strip()
    return json.loads(cleaned)


# ─────────────────────────────────────────────────────────────────────────────
# Step 1 – Extract skills from resume text
# ─────────────────────────────────────────────────────────────────────────────

def extract_skills_from_resume(resume_text: str) -> dict[str, int]:
    prompt = f"""
You are an expert technical recruiter and skill analyst.

Analyse the resume text below and extract ALL technical skills, tools,
frameworks, programming languages, cloud platforms, methodologies and domain
knowledge the candidate has demonstrated.

For each skill assign a proficiency rating from 1 (beginner) to 10 (expert)
based on context clues such as years of experience, project complexity,
certifications, and seniority indicators in the resume.

Return ONLY a valid JSON object in this exact format — no explanation, no markdown:
{{
  "Java": 8,
  "Spring Boot": 7,
  "AWS": 5
}}

Resume text:
\"\"\"
{resume_text[:6000]}
\"\"\"
"""
    try:
        return _parse_json(_generate(prompt, "extract_skills_from_resume"))
    except Exception:
        return {}


# ─────────────────────────────────────────────────────────────────────────────
# Step 2 – Consolidate resume skills + self assessment
# ─────────────────────────────────────────────────────────────────────────────

def consolidate_skills(
    resume_skills: dict[str, int],
    self_assessment: dict[str, int],
) -> dict[str, int]:
    merged: dict[str, int] = {}
    all_keys = set(resume_skills) | set(self_assessment)
    for skill in all_keys:
        r = resume_skills.get(skill)
        s = self_assessment.get(skill)
        if r is not None and s is not None:
            merged[skill] = round((r + s) / 2)
        else:
            merged[skill] = r if r is not None else s
    return merged


# ─────────────────────────────────────────────────────────────────────────────
# Step 3 – Infer current role from skills
# ─────────────────────────────────────────────────────────────────────────────

def infer_role(skills: dict[str, int]) -> str:
    prompt = f"""
You are an expert in tech industry job roles and career ladders.

Given the following skill profile (skill: proficiency 1-10), determine the
single most likely current job role/designation for this person.

Return ONLY a JSON object with one key "role" — no explanation, no markdown:
{{"role": "Senior Backend Engineer"}}

Skill profile:
{json.dumps(skills, indent=2)}
"""
    try:
        return _parse_json(_generate(prompt, "infer_role")).get("role", "Unknown")
    except Exception:
        return "Unknown"


# ─────────────────────────────────────────────────────────────────────────────
# Step 4 – Role alignment check
# ─────────────────────────────────────────────────────────────────────────────

def check_role_alignment(provided_role: str, inferred_role: str) -> str:
    prompt = f"""
You are a career alignment expert.

Determine whether the following two job titles describe broadly the same type
of professional role in the tech industry.

Provided role: "{provided_role}"
AI-inferred role: "{inferred_role}"

Return ONLY a JSON object with one key "alignment" whose value is either
"ALIGNED" or "MISALIGNED" — no explanation, no markdown:
{{"alignment": "ALIGNED"}}
"""
    try:
        return _parse_json(_generate(prompt, "check_role_alignment")).get("alignment", "ALIGNED")
    except Exception:
        return "ALIGNED"


# ─────────────────────────────────────────────────────────────────────────────
# Step 5 – Skill gap analysis
# ─────────────────────────────────────────────────────────────────────────────

def analyse_skill_gaps(
    current_skills: dict[str, int],
    target_role: str,
) -> list[dict]:
    prompt = f"""
You are a senior technical career advisor with deep knowledge of industry
standard skill requirements for every tech role.

An employee has the following current skill profile (skill: proficiency 1-10):
{json.dumps(current_skills, indent=2)}

Their target role is: "{target_role}"

Tasks:
1. List the core technical skills required to competently perform the role
   of "{target_role}" at a professional level.
2. From that list, keep ONLY the skills that are SKILL GAPS — i.e. the employee
   is MISSING the skill entirely OR has a proficiency below 6.
3. For each skill gap, give the proficiency LEVEL REQUIRED for the target role
   on a scale of 1 (beginner) to 10 (expert).

Output Response : Return ONLY a valid JSON object — no explanation, no markdown.
"skillGaps" must be an array of objects, each with a "skill" name and the
integer "requiredLevel" (1-10):
{{
  "skillGaps": [
    {{ "skill": "SQL", "requiredLevel": 10 }},
    {{ "skill": "Python", "requiredLevel": 9 }}
  ]
}}
"""
    try:
        result = _parse_json(_generate(prompt, "analyse_skill_gaps"))
        raw_gaps = result.get("skillGaps", []) if isinstance(result, dict) else result
        gaps: list[dict] = []
        for g in raw_gaps or []:
            if not isinstance(g, dict) or not g.get("skill"):
                continue
            try:
                level = int(g.get("requiredLevel"))
            except (TypeError, ValueError):
                level = 6
            gaps.append({"skill": str(g["skill"]), "requiredLevel": max(1, min(10, level))})
        return gaps
    except Exception:
        return []


# ─────────────────────────────────────────────────────────────────────────────
# Orchestrator
# ─────────────────────────────────────────────────────────────────────────────

def run_full_analysis(
    resume_text: str,
    self_assessment: dict[str, int],
    provided_role: str,
    target_role: str,
) -> dict:
    resume_skills = extract_skills_from_resume(resume_text)
    consolidated = consolidate_skills(resume_skills, self_assessment)
    inferred_role = infer_role(consolidated)
    alignment = check_role_alignment(provided_role, inferred_role)
    gap_analysis = analyse_skill_gaps(consolidated, target_role)

    return {
        "resume_skills": resume_skills,
        "consolidated_skills": consolidated,
        "role_alignment": alignment,
        "skill_gap_analysis": gap_analysis,
    }