from fastapi import UploadFile
from app.core.constants import RESUME_BUCKET
from app.core.supabase_client import get_supabase


async def upload_resume(file: UploadFile, skill_id: str) -> str:
    """
    Uploads a resume to Supabase Storage under {skill_id}/<filename>.
    Returns the stored file path.
    """
    await file.seek(0)  # rewind after earlier read
    raw = await file.read()

    ext = (file.filename or "resume").rsplit(".", 1)[-1].lower()
    path = f"{skill_id}/resume.{ext}"

    sb = get_supabase()
    sb.storage.from_(RESUME_BUCKET).upload(
        path,
        raw,
        {"content-type": file.content_type or "application/octet-stream"},
    )
    return path


def delete_resumes(paths: list[str]) -> None:
    """Removes one or more resume objects from storage. Safe to call with []. """
    paths = [p for p in (paths or []) if p]
    if not paths:
        return
    sb = get_supabase()
    try:
        sb.storage.from_(RESUME_BUCKET).remove(paths)
    except Exception:
        # Object may already be gone; keep hard-delete idempotent.
        pass
