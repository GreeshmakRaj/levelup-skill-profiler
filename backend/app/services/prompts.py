"""Prompt templates for the skill-gap analysis pipeline.

Each function returns a fully-formatted prompt string. Keep prompt wording
here; keep orchestration and JSON parsing in skill_analysis_service.
"""
import json

RESUME_TEXT_CHAR_LIMIT = 6000


def extract_skills_from_resume(resume_text: str) -> str:
    return f"""
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
{resume_text[:RESUME_TEXT_CHAR_LIMIT]}
\"\"\"
"""


def infer_role(skills: dict[str, int]) -> str:
    return f"""
You are an expert in tech industry job roles and career ladders.

Given the following skill profile (skill: proficiency 1-10), determine the
single most likely current job role/designation for this person.

Return ONLY a JSON object with one key "role" — no explanation, no markdown:
{{"role": "Senior Backend Engineer"}}

Skill profile:
{json.dumps(skills, indent=2)}
"""


def check_role_alignment(provided_role: str, inferred_role: str) -> str:
    return f"""
You are a career alignment expert.

Determine whether the following two job titles describe broadly the same type
of professional role in the tech industry.

Provided role: "{provided_role}"
AI-inferred role: "{inferred_role}"

Return ONLY a JSON object with one key "alignment" whose value is either
"ALIGNED" or "MISALIGNED" — no explanation, no markdown:
{{"alignment": "ALIGNED"}}
"""


def analyse_skill_gaps(current_skills: dict[str, int], target_role: str) -> str:
    return f"""
You are a senior technical career advisor.

Current skill profile (skill: proficiency 1-10):
{json.dumps(current_skills, indent=2)}

Target role: "{target_role}"

Identify SKILL GAPS: skills required for "{target_role}" that the employee is
MISSING entirely OR has proficiency below 6.

Rules:
- Do NOT include skills where the employee already has proficiency >= 6.
- Always return at least the most critical gaps for this role.
- Output ONLY raw JSON — no explanation, no markdown, no preamble.

Exact output format (nothing else):
{{"skillGaps":[{{"skill":"SQL","requiredLevel":9}},{{"skill":"Python","requiredLevel":8}}]}}
"""
