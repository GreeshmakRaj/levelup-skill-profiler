from fastapi import UploadFile
from app.core.constants import RESUME_BUCKET
from app.core.supabase_client import get_async_supabase


async def upload_resume(file: UploadFile, skill_id: str) -> str:
    """
    Uploads a resume to Supabase Storage under {skill_id}/<filename>.
    Returns the stored file path.
    """
    await file.seek(0)  # rewind after earlier read
    raw = await file.read()

    ext = (file.filename or "resume").rsplit(".", 1)[-1].lower()
    path = f"{skill_id}/resume.{ext}"

    sb = await get_async_supabase()
    await sb.storage.from_(RESUME_BUCKET).upload(
        path,
        raw,
        {"content-type": file.content_type or "application/octet-stream"},
    )
    return path


async def delete_resumes(paths: list[str]) -> None:
    """Removes one or more resume objects from storage. Safe to call with []."""
    paths = [p for p in (paths or []) if p]
    if not paths:
        return
    sb = await get_async_supabase()
    try:
        await sb.storage.from_(RESUME_BUCKET).remove(paths)
    except Exception:
        pass
