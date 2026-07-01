"""
Central place for non-secret constant values used across the backend.
Secrets live in the environment / .env (see core/config.py) — never here.
"""
from enum import Enum


# ── Roles ─────────────────────────────────────────────────────────────────────

class Role(str, Enum):
    """User roles. Stored in users.user_role. Avoid magic strings elsewhere."""
    ADMIN = "ADMIN"
    MANAGER = "MANAGER"
    EMPLOYEE = "EMPLOYEE"


# ── Storage ───────────────────────────────────────────────────────────────────

RESUME_BUCKET = "resumes"


# ── AI / software industry roles (current + target role options) ──────────────
# Single source of truth for the searchable role dropdowns on the frontend too;
# the frontend keeps its own mirror in constants/roles.js.

AI_SOFTWARE_ROLES = [
    # Core software engineering ladder
    "Intern Software Engineer",
    "Junior Software Engineer",
    "Associate Software Engineer",
    "Software Engineer",
    "Software Developer",
    "Senior Software Engineer",
    "Senior Software Developer",
    "Staff Software Engineer",
    "Lead Software Engineer",
    "Principal Software Engineer",
    "Principal Engineer",
    "Distinguished Engineer",
    "Software Development Engineer (SDE)",
    "SDE II",
    "SDE III",
    # Backend
    "Backend Engineer",
    "Backend Developer",
    "Senior Backend Engineer",
    "Lead Backend Engineer",
    "API Engineer",
    "Microservices Engineer",
    # Frontend
    "Frontend Engineer",
    "Frontend Developer",
    "Senior Frontend Engineer",
    "UI Engineer",
    "Web Developer",
    # Full stack
    "Full Stack Engineer",
    "Full Stack Developer",
    "Senior Full Stack Engineer",
    "Lead Full Stack Engineer",
    # Language / stack specific
    "Java Developer",
    "Python Developer",
    ".NET Developer",
    "C# Developer",
    "Node.js Developer",
    "React Developer",
    "Angular Developer",
    "Golang Developer",
    "PHP Developer",
    # Mobile
    "Mobile Engineer",
    "Android Developer",
    "iOS Developer",
    # DevOps / SRE / infrastructure / platform
    "DevOps Engineer",
    "Senior DevOps Engineer",
    "Lead DevOps Engineer",
    "Site Reliability Engineer",
    "Platform Engineer",
    "Infrastructure Engineer",
    "Cloud Engineer",
    "Release Engineer",
    "Build and Release Engineer",
    "Automation Engineer",
    "Systems Engineer",
    "Network Engineer",
    # Embedded / systems
    "Embedded Software Engineer",
    "Firmware Engineer",
    # QA / test
    "QA Engineer",
    "Test Automation Engineer",
    "Software Development Engineer in Test (SDET)",
    # Architecture
    "Software Architect",
    "Solution Architect",
    "Cloud Solutions Architect",
    "Enterprise Architect",
    "Data Architect",
    # Data
    "Data Engineer",
    "Data Analyst",
    "Data Scientist",
    "Senior Data Scientist",
    "Analytics Engineer",
    "Business Intelligence Engineer",
    "Database Administrator",
    # AI / ML
    "Machine Learning Engineer",
    "Senior Machine Learning Engineer",
    "MLOps Engineer",
    "AI Engineer",
    "Applied AI Engineer",
    "Generative AI Engineer",
    "LLM Engineer",
    "Prompt Engineer",
    "AI Research Scientist",
    "AI Solution Architect",
    "Computer Vision Engineer",
    "NLP Engineer",
    "Deep Learning Engineer",
    "Robotics Engineer",
    # Security
    "Security Engineer",
    "Application Security Engineer",
    # Leadership / management / product
    "Engineering Manager",
    "Technical Lead",
    "Product Manager",
    "AI Product Manager",
    "Scrum Master",
]
