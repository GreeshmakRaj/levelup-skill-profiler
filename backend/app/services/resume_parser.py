import fitz  # PyMuPDF
import docx
import io
from fastapi import UploadFile, HTTPException, status


SUPPORTED_CONTENT_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}


async def extract_text_from_resume(file: UploadFile) -> str:
    """
    Reads an uploaded PDF or DOCX and returns plain text.
    Raises 400 if the format is unsupported or the file is unreadable.
    """
    content_type = (file.content_type or "").lower()

    # Accept by content-type OR by extension (browsers sometimes mis-report)
    filename = (file.filename or "").lower()
    is_pdf = content_type == "application/pdf" or filename.endswith(".pdf")
    is_docx = (
        content_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        or filename.endswith(".docx")
    )

    if not (is_pdf or is_docx):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "INVALID_FILE_FORMAT", "message": "Supported formats are PDF and DOCX."},
        )

    raw_bytes = await file.read()

    try:
        if is_pdf:
            return _extract_pdf(raw_bytes)
        return _extract_docx(raw_bytes)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "INVALID_FILE_FORMAT", "message": f"Could not read file: {exc}"},
        ) from exc


def _extract_pdf(data: bytes) -> str:
    doc = fitz.open(stream=data, filetype="pdf")
    pages = [page.get_text() for page in doc]
    doc.close()
    return "\n".join(pages).strip()


def _extract_docx(data: bytes) -> str:
    document = docx.Document(io.BytesIO(data))
    paragraphs = [p.text for p in document.paragraphs if p.text.strip()]
    return "\n".join(paragraphs).strip()
