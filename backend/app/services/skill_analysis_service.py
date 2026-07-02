"""Orchestration + JSON parsing for the skill-gap analysis pipeline.

Prompt wording lives in `app.services.prompts`. LLM I/O (provider selection
and fallback) lives in `app.services.llm`.
"""
import json
import logging
import re

from app.services import prompts
from app.services.llm import generate, LLMError

logger = logging.getLogger("skill_analysis")
if not logger.handlers:
    _h = logging.StreamHandler()
    _h.setFormatter(logging.Formatter("%(asctime)s [%(levelname)s] %(name)s: %(message)s"))
    logger.addHandler(_h)
    logger.setLevel(logging.INFO)
    logger.propagate = False


def _parse_json(text: str) -> dict | list:
    """Robustly extract and parse JSON from an LLM response.

    Handles markdown fences, surrounding prose, and trailing text that LLMs
    like llama/Groq commonly produce despite 'return ONLY JSON' instructions.
    """
    # Strip markdown code fences
    cleaned = re.sub(r"```(?:json|JSON)?\s*", "", text).replace("```", "").strip()

    # Fast path: entire cleaned text is valid JSON
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # Slow path: find the first complete JSON object { } or array [ ] anywhere
    # in the text using a depth counter (handles nested structures).
    for start_ch, end_ch in ("{", "}"), ("[", "]"):
        pos = cleaned.find(start_ch)
        if pos == -1:
            continue
        depth = 0
        for i in range(pos, len(cleaned)):
            ch = cleaned[i]
            if ch == start_ch:
                depth += 1
            elif ch == end_ch:
                depth -= 1
                if depth == 0:
                    try:
                        return json.loads(cleaned[pos : i + 1])
                    except json.JSONDecodeError:
                        break  # malformed block; try [ ] pattern

    raise ValueError(f"No valid JSON found in LLM response: {text[:400]!r}")


# â”€â”€â”€ Step 1 â€“ Extract skills from resume text â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async def extract_skills_from_resume(resume_text: str) -> dict[str, int]:
    try:
        return _parse_json(await generate(
            prompts.extract_skills_from_resume(resume_text),
            "extract_skills_from_resume",
        ))
    except LLMError:
        raise
    except Exception as exc:
        logger.warning("extract_skills_from_resume failed: %s", exc)
        return {}


# â”€â”€â”€ Step 2 â€“ Consolidate resume skills + self assessment â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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


# â”€â”€â”€ Step 3 â€“ Infer current role from skills â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async def infer_role(skills: dict[str, int]) -> str:
    try:
        return _parse_json(await generate(
            prompts.infer_role(skills),
            "infer_role",
        )).get("role", "Unknown")
    except LLMError:
        raise
    except Exception as exc:
        logger.warning("infer_role failed: %s", exc)
        return "Unknown"


# â”€â”€â”€ Step 4 â€“ Role alignment check â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async def check_role_alignment(provided_role: str, inferred_role: str) -> str:
    try:
        return _parse_json(await generate(
            prompts.check_role_alignment(provided_role, inferred_role),
            "check_role_alignment",
        )).get("alignment", "ALIGNED")
    except LLMError:
        raise
    except Exception as exc:
        logger.warning("check_role_alignment failed: %s", exc)
        return "ALIGNED"


# â”€â”€â”€ Step 5 â€“ Skill gap analysis â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async def analyse_skill_gaps(
    current_skills: dict[str, int],
    target_role: str,
) -> list[dict]:
    try:
        result = _parse_json(await generate(
            prompts.analyse_skill_gaps(current_skills, target_role),
            "analyse_skill_gaps",
        ))
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
        logger.info("analyse_skill_gaps: found %d gaps for role '%s'", len(gaps), target_role)
        return gaps
    except LLMError:
        raise
    except Exception as exc:
        logger.warning("analyse_skill_gaps failed: %s", exc)
        return []


# â”€â”€â”€ Orchestrator â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async def run_full_analysis(
    resume_text: str,
    self_assessment: dict[str, int],
    provided_role: str,
    target_role: str,
) -> dict:
    resume_skills = await extract_skills_from_resume(resume_text)
    consolidated = consolidate_skills(resume_skills, self_assessment)
    inferred = await infer_role(consolidated)
    alignment = await check_role_alignment(provided_role, inferred)
    gap_analysis = await analyse_skill_gaps(consolidated, target_role)

    return {
        "resume_skills": resume_skills,
        "consolidated_skills": consolidated,
        "role_alignment": alignment,
        "skill_gap_analysis": gap_analysis,
    }
