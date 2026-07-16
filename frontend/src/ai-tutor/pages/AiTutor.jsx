import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../skill-profiler-agent/hooks/useAuth'
import { listMySkills } from '../../skill-profiler-agent/services/api'
import { useToast } from '../../skill-profiler-agent/components/ui/Toast'
import { ROLES } from '../../skill-profiler-agent/constants/roles'
import {
  chatWithTutor,
  uploadTutorDoc,
  deleteTutorDoc,
  createTutorSession,
} from '../services/aiTutorService'

const SESSION_KEY = 'ai-tutor-sessions'
const DOCS_KEY = 'ai-tutor-docs'
const MAX_DOCS = 5
const MAX_FILE_MB = 10

const GREETING = {
  role: 'assistant',
  content: "Hi 👋 I'm your AI tutor. I can answer questions from your learning roadmap and courses, explain concepts, and guide you through your learning journey.",
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m || 1}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d === 1) return 'Yesterday'
  if (d < 7) return `${d} days ago`
  return 'Last week'
}

function loadSessions() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || '[]') } catch { return [] }
}

function saveSessions(list) {
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(list.slice(0, 20))) } catch {}
}

function BotIcon({ className = 'w-5 h-5 text-brand-500' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
  )
}

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-brand-500/10 flex items-center justify-center shrink-0 mt-0.5">
          <BotIcon className="w-4 h-4 text-brand-500" />
        </div>
      )}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words ${
          isUser
            ? 'bg-brand-500 text-white rounded-tr-sm'
            : 'bg-surface text-ink rounded-tl-sm border border-line'
        }`}
      >
        {msg.content}
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-brand-500/10 flex items-center justify-center shrink-0">
        <BotIcon className="w-4 h-4 text-brand-500" />
      </div>
      <div className="bg-surface border border-line rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
        {[0, 150, 300].map((d) => (
          <span
            key={d}
            className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce"
            style={{ animationDelay: `${d}ms` }}
          />
        ))}
      </div>
    </div>
  )
}

export default function AiTutor() {
  const { profile, role } = useAuth()
  const toast = useToast()
  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const textareaRef = useRef(null)
  const tutorSessionRef = useRef(null)

  const [sessions, setSessions] = useState(loadSessions)
  const [activeId, setActiveId] = useState(null)
  const [messages, setMessages] = useState([GREETING])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [docs, setDocs] = useState(() => {
    try { return JSON.parse(localStorage.getItem(DOCS_KEY) || '[]') } catch { return [] }
  })
  const [docUploading, setDocUploading] = useState(false)
  const [docError, setDocError] = useState('')
  const fileInputRef = useRef(null)

  const [skills, setSkills] = useState([])
  const [selectedSkillId, setSelectedSkillId] = useState('')

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  useEffect(() => {
    saveSessions(sessions)
  }, [sessions])

  useEffect(() => {
    try { localStorage.setItem(DOCS_KEY, JSON.stringify(docs)) } catch {}
  }, [docs])

  useEffect(() => {
    let active = true
    listMySkills()
      .then((list) => {
        if (!active) return
        const arr = Array.isArray(list) ? list : []
        setSkills(arr)
        if (arr.length > 0) setSelectedSkillId((cur) => cur || arr[0].skillId)
      })
      .catch(() => {})
    return () => { active = false }
  }, [])

  function handleSkillChange(e) {
    setSelectedSkillId(e.target.value)
    tutorSessionRef.current = null
  }

  function resizeTextarea() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 128) + 'px'
  }

  async function handleDocUpload(e) {
    const file = e.target.files?.[0]
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (!file) return
    if (docs.length >= MAX_DOCS) {
      setDocError(`You can upload up to ${MAX_DOCS} documents.`)
      return
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setDocError(`File too large. Maximum is ${MAX_FILE_MB} MB.`)
      return
    }
    setDocError('')
    setDocUploading(true)
    try {
      const data = await uploadTutorDoc(file, selectedSkillId || 'general')
      setDocs((prev) => [{ ...data, filename: file.name }, ...prev])
    } catch (err) {
      setDocError(err.message || 'Upload failed.')
    } finally {
      setDocUploading(false)
    }
  }

  async function handleDocDelete(doc) {
    try { await deleteTutorDoc(doc.docId, doc.ext) } catch {}
    setDocs((prev) => prev.filter((d) => d.docId !== doc.docId))
  }

  function startNewChat() {
    setActiveId(null)
    setMessages([GREETING])
    setInput('')
    tutorSessionRef.current = null
    setTimeout(() => textareaRef.current?.focus(), 0)
  }

  function loadSession(session) {
    setActiveId(session.id)
    setMessages([GREETING, ...session.messages])
    tutorSessionRef.current = null
    setTimeout(() => textareaRef.current?.focus(), 0)
  }

  async function sendMessage(text) {
    const msg = (text !== undefined ? text : input).trim()
    if (!msg || sending) return
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    const userMsg = { role: 'user', content: msg }
    const next = [...messages, userMsg]
    setMessages(next)
    setSending(true)

    try {
      const history = next
        .filter((m) => m !== GREETING)
        .slice(0, -1)
        .slice(-10)
        .map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content.slice(0, 3000) }))

      const docContext = docs
        .filter((d) => d.textPreview)
        .map((d) => `[Document: ${d.filename}]\n${d.textPreview}`)
        .join('\n\n---\n\n')
        .slice(0, 15000)

      if (!tutorSessionRef.current) {
        const { session_id } = await createTutorSession(selectedSkillId || 'general')
        tutorSessionRef.current = session_id
      }

      const { reply } = await chatWithTutor(msg, history, docContext, tutorSessionRef.current)
      const botMsg = { role: 'assistant', content: reply }
      const final = [...next, botMsg]
      setMessages(final)

      const stored = final.filter((m) => m !== GREETING)
      const title = msg.length > 45 ? msg.slice(0, 45) + '…' : msg
      const now = new Date().toISOString()

      if (activeId) {
        setSessions((prev) =>
          prev.map((s) => (s.id === activeId ? { ...s, messages: stored, updatedAt: now } : s))
        )
      } else {
        const newSession = { id: genId(), title, messages: stored, createdAt: now, updatedAt: now }
        setActiveId(newSession.id)
        setSessions((prev) => [newSession, ...prev])
      }
    } catch (err) {
      toast.error(err.message || 'Failed to get a response.')
      setMessages(next.slice(0, -1))
    } finally {
      setSending(false)
      setTimeout(() => textareaRef.current?.focus(), 0)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex gap-5" style={{ height: 'calc(100vh - 9rem)' }}>
      <div className="flex-1 flex flex-col min-w-0 bg-card rounded-2xl border border-line shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-line shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center shrink-0">
              <BotIcon className="w-6 h-6 text-brand-500" />
            </div>
            <div>
              <p className="font-semibold text-ink">AI Tutor</p>
              <p className="text-xs text-muted">GPT-class · context aware</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {skills.length > 0 && (
              <select
                value={selectedSkillId}
                onChange={handleSkillChange}
                title="Scope the tutor to one of your skills"
                className="text-xs bg-surface border border-line rounded-lg px-2 py-1.5 text-ink max-w-[180px] focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                {skills.map((s) => (
                  <option key={s.skillId} value={s.skillId}>
                    {s.targetRole || s.skillName || s.skillId}
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={startNewChat}
              title="Start new chat"
              className="text-xs btn-ghost px-3 py-1.5"
            >
              + New chat
            </button>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Online
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-0">
          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} />
          ))}
          {sending && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        <div className="px-4 pb-4 pt-2 border-t border-line shrink-0">
          <div className="flex items-end gap-2 bg-surface rounded-xl border border-line focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-500/20 px-3 py-2.5 transition">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => { setInput(e.target.value); resizeTextarea() }}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything…"
              disabled={sending}
              rows={1}
              className="flex-1 bg-transparent text-sm text-ink placeholder:text-faint resize-none outline-none overflow-hidden disabled:opacity-50"
              style={{ height: '24px' }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || sending}
              className="w-8 h-8 rounded-lg bg-brand-500 hover:bg-brand-600 active:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors shrink-0"
            >
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </div>
          <p className="text-center text-[10px] text-faint mt-1.5">
            AI responses may be inaccurate. Verify important information.
          </p>
        </div>
      </div>

      <div className="hidden lg:flex flex-col gap-4 w-64 xl:w-72 shrink-0 min-h-0">
        <div className="flex flex-col flex-1 bg-card rounded-2xl border border-line shadow-card overflow-hidden min-h-0">
          <div className="flex items-center justify-between px-4 py-3 border-b border-line shrink-0">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink">
              <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
              Chat History
            </div>
            <button
              onClick={startNewChat}
              className="text-xs text-brand-600 dark:text-brand-400 hover:underline"
            >
              + New
            </button>
          </div>
          <div className="flex-1 overflow-y-auto min-h-0">
            {sessions.length === 0 ? (
              <p className="text-xs text-faint text-center py-10 px-4">No past conversations yet.</p>
            ) : (
              <ul className="divide-y divide-line">
                {sessions.map((s) => (
                  <li key={s.id}>
                    <button
                      onClick={() => loadSession(s)}
                      className={`w-full text-left px-4 py-3 hover:bg-surface transition-colors ${
                        activeId === s.id ? 'bg-brand-50 dark:bg-brand-500/10' : ''
                      }`}
                    >
                      <p className="text-sm font-medium text-ink truncate">{s.title}</p>
                      <p className="text-xs text-faint mt-0.5">{timeAgo(s.updatedAt || s.createdAt)}</p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {(role === ROLES.ADMIN || role === ROLES.MANAGER) && (
          <div className="bg-card rounded-2xl border border-line shadow-card p-4 shrink-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                Documents
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={docUploading || docs.length >= MAX_DOCS}
                className="text-xs text-brand-600 dark:text-brand-400 hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {docUploading ? 'Uploading…' : '+ Upload'}
              </button>
            </div>
            <p className="text-xs text-faint mb-3">PDFs the tutor can reference · tech/AI only</p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx"
              className="hidden"
              onChange={handleDocUpload}
            />

            {docError && (
              <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg px-3 py-2 mb-3 leading-relaxed">
                {docError}
              </div>
            )}

            {docs.length === 0 && !docUploading && (
              <button
                onClick={() => { setDocError(''); fileInputRef.current?.click() }}
                className="w-full flex flex-col items-center gap-1.5 py-5 rounded-xl border border-dashed border-line bg-surface hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/5 transition-colors"
              >
                <svg className="w-6 h-6 text-faint" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <span className="text-xs text-faint">Upload PDF or DOCX</span>
                <span className="text-[10px] text-faint">Must contain tech or AI content</span>
              </button>
            )}

            {docUploading && (
              <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted">
                <span className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                Checking document relevance…
              </div>
            )}

            {docs.length > 0 && (
              <ul className="space-y-1.5">
                {docs.map((doc) => (
                  <li key={doc.docId} className="flex items-center gap-2 bg-surface rounded-lg px-3 py-2 group">
                    <svg className="w-4 h-4 text-brand-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    <span className="flex-1 text-xs text-ink truncate" title={doc.filename}>{doc.filename}</span>
                    <button
                      onClick={() => handleDocDelete(doc)}
                      title="Remove document"
                      className="opacity-0 group-hover:opacity-100 text-faint hover:text-red-500 transition-all shrink-0"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </li>
                ))}
                {docs.length < MAX_DOCS && (
                  <button
                    onClick={() => { setDocError(''); fileInputRef.current?.click() }}
                    disabled={docUploading}
                    className="w-full text-center text-xs text-brand-600 dark:text-brand-400 hover:underline py-1 disabled:opacity-40"
                  >
                    + Add another
                  </button>
                )}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  )
}