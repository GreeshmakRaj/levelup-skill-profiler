import uuid
from fastapi import UploadFile
from app.core.supabase_client import get_supabase

BUCKET = "resumes"


async def upload_resume(file: UploadFile, employee_id: str) -> str:
    """
    Uploads resume to Supabase Storage.
    Returns the stored file path.
    """
    raw = await file.seek(0)  # rewind after earlier read
    raw = await file.read()

    ext = (file.filename or "resume").rsplit(".", 1)[-1].lower()
    path = f"{employee_id}/{uuid.uuid4()}.{ext}"

    sb = get_supabase()
    sb.storage.from_(BUCKET).upload(
        path,
        raw,
        {"content-type": file.content_type or "application/octet-stream"},
    )
    return path
