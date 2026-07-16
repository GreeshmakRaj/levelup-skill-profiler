// Resume file validator: type, size, and page-count checks.
// Zero external deps — PDFs are inspected via a raw regex, DOCX via the
// browser-native DecompressionStream API against docProps/app.xml.

export const MAX_RESUME_SIZE_MB = 5
export const MAX_RESUME_PAGES = 3

const ALLOWED_EXTENSIONS = ['.pdf', '.docx']
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  // Some browsers set an empty type — we still allow if the extension is valid.
  '',
])

function getExtension(name) {
  const i = name.lastIndexOf('.')
  return i >= 0 ? name.slice(i).toLowerCase() : ''
}

// Best-effort PDF page counter using the raw byte stream.
function countPdfPagesFromBuffer(buf) {
  const text = new TextDecoder('latin1').decode(buf)
  const pageMatches = text.match(/\/Type\s*\/Page(?![sA-Za-z])/g)
  if (pageMatches && pageMatches.length > 0) return pageMatches.length
  const countMatch = text.match(/\/Count\s+(\d+)/)
  return countMatch ? parseInt(countMatch[1], 10) : null
}

// Extract a single entry from a zip archive without any dependency.
async function extractZipEntry(bytes, targetName) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)

  // Locate the End Of Central Directory record (searches near the end).
  let eocd = -1
  const minStart = Math.max(0, bytes.length - 65558)
  for (let i = bytes.length - 22; i >= minStart; i--) {
    if (view.getUint32(i, true) === 0x06054b50) { eocd = i; break }
  }
  if (eocd < 0) return null

  const cdSize = view.getUint32(eocd + 12, true)
  const cdOffset = view.getUint32(eocd + 16, true)

  // Walk central directory entries looking for the target file name.
  let p = cdOffset
  const end = cdOffset + cdSize
  while (p < end - 4) {
    if (view.getUint32(p, true) !== 0x02014b50) break
    const compressionMethod = view.getUint16(p + 10, true)
    const compressedSize = view.getUint32(p + 20, true)
    const nameLen = view.getUint16(p + 28, true)
    const extraLen = view.getUint16(p + 30, true)
    const commentLen = view.getUint16(p + 32, true)
    const localOffset = view.getUint32(p + 42, true)
    const name = new TextDecoder().decode(bytes.slice(p + 46, p + 46 + nameLen))

    if (name === targetName) {
      const lhNameLen = view.getUint16(localOffset + 26, true)
      const lhExtraLen = view.getUint16(localOffset + 28, true)
      const dataStart = localOffset + 30 + lhNameLen + lhExtraLen
      const compressed = bytes.slice(dataStart, dataStart + compressedSize)

      if (compressionMethod === 0) {
        return new TextDecoder().decode(compressed)
      }
      if (compressionMethod === 8 && typeof DecompressionStream !== 'undefined') {
        const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
        return await new Response(stream).text()
      }
      return null
    }

    p += 46 + nameLen + extraLen + commentLen
  }
  return null
}

async function countDocxPagesFromBuffer(bytes) {
  try {
    const xml = await extractZipEntry(bytes, 'docProps/app.xml')
    if (!xml) return null
    const m = xml.match(/<Pages>(\d+)<\/Pages>/)
    return m ? parseInt(m[1], 10) : null
  } catch {
    return null
  }
}

/**
 * Validate an uploaded resume file.
 * Returns { valid: boolean, error?: string, pages?: number }.
 */
export async function validateResumeFile(file) {
  if (!file) return { valid: false, error: 'Please select a file.' }

  const ext = getExtension(file.name)
  if (!ALLOWED_EXTENSIONS.includes(ext) || !ALLOWED_MIME_TYPES.has(file.type)) {
    return { valid: false, error: 'Only .pdf and .docx files are allowed.' }
  }

  const maxBytes = MAX_RESUME_SIZE_MB * 1024 * 1024
  if (file.size > maxBytes) {
    return { valid: false, error: `File is too large. Maximum size is ${MAX_RESUME_SIZE_MB} MB.` }
  }

  const bytes = new Uint8Array(await file.arrayBuffer())
  const pages = ext === '.pdf'
    ? countPdfPagesFromBuffer(bytes)
    : await countDocxPagesFromBuffer(bytes)

  if (pages != null && pages > MAX_RESUME_PAGES) {
    return {
      valid: false,
      error: `Resume must be at most ${MAX_RESUME_PAGES} pages (found ${pages}).`,
      pages,
    }
  }

  return { valid: true, pages: pages ?? undefined }
}
