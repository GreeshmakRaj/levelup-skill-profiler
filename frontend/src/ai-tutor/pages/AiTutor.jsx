import { useEffect, useMemo, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useAuth } from '../../skill-profiler-agent/hooks/useAuth'
import { useToast } from '../../skill-profiler-agent/components/ui/Toast'
import { ROLES } from '../../skill-profiler-agent/constants/roles'
import {
  completeRoadmap,
  createTutorSession,
  getDocumentStatus,
  listDocuments,
  listRoadmaps,
  listSessionMessages,
  listSessions,
  listSuggestions,
  sendMessage,
  submitFeedback,
  uploadTutorDoc,
} from '../services/aiTutorService'

const MAX_FILE_MB = 10
const ACCEPTED_EXTENSIONS = ['pdf', 'docx']

function formatRelativeTime(value) {
  if (!value) return 'just now'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'just now'
  const diffMs = Date.now() - date.getTime()
  const diffMin = Math.max(1, Math.floor(diffMs / 60000))
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHrs = Math.floor(diffMin / 60)
  if (diffHrs < 24) return `${diffHrs}h ago`
  const diffDays = Math.floor(diffHrs / 24)
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

function toDisplayTitle(session) {
  if (session?.title) return session.title
  if (session?.skill_name) return session.skill_name
  return 'New session'
}

function MessageBubble({ message, onFeedback }) {
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'
  const isAssistant = message.role === 'assistant'

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className="text-xs text-muted bg-surface border border-line rounded-full px-3 py-1">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words ${
          isUser ? 'bg-brand-500 text-white rounded-tr-sm' : 'bg-surface text-ink rounded-tl-sm border border-line'
        }`}
      >
        {isAssistant ? (
          <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-2 prose-pre:my-2 prose-code:before:content-none prose-code:after:content-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content || ''}</ReactMarkdown>
          </div>
        ) : (
          message.content
        )}
        {isAssistant && Array.isArray(message.sources) && message.sources.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.sources.map((source) => (
              <span
                key={`${source.chunk_id}-${source.document_id}`}
                className="inline-flex items-center gap-1 text-[11px] bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300 px-2 py-1 rounded-full"
              >
                {source.document_title || `Document ${source.document_id}`}
                {source.section_title ? ` · ${source.section_title}` : ''}
                {source.page_number ? ` · p.${source.page_number}` : ''}
              </span>
            ))}
          </div>
        )}
        {isAssistant && (
          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={() => onFeedback(message.message_id, 'up')}
              className={`text-xs px-2 py-1 rounded ${message.feedback === 'up' ? 'bg-green-100 text-green-700' : 'text-muted hover:bg-line/30'}`}
              title="Helpful"
            >
              👍
            </button>
            <button
              onClick={() => onFeedback(message.message_id, 'down')}
              className={`text-xs px-2 py-1 rounded ${message.feedback === 'down' ? 'bg-red-100 text-red-700' : 'text-muted hover:bg-line/30'}`}
              title="Not helpful"
            >
              👎
            </button>
            {message.blocked && <span className="text-[11px] text-amber-700">Out of scope prompt</span>}
          </div>
        )}
      </div>
    </div>
  )
}

export default function AiTutor() {
  const { user, role } = useAuth()
  const toast = useToast()

  const userId = user?.id || null
  const canUpload = role === ROLES.ADMIN || role === ROLES.MANAGER

  const [roadmaps, setRoadmaps] = useState([])
  const [selectedSkillId, setSelectedSkillId] = useState('')

  const [sessions, setSessions] = useState([])
  const [activeSessionId, setActiveSessionId] = useState('')

  const [messages, setMessages] = useState([])
  const [suggestions, setSuggestions] = useState([])

  const [documents, setDocuments] = useState([])
  const [docUploading, setDocUploading] = useState(false)
  const [loadingDocs, setLoadingDocs] = useState(false)

  const [loadingRoadmaps, setLoadingRoadmaps] = useState(false)
  const [loadingSessions, setLoadingSessions] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)

  const [input, setInput] = useState('')

  const textareaRef = useRef(null)
  const bottomRef = useRef(null)
  const fileInputRef = useRef(null)
  const pollTimersRef = useRef(new Map())

  const selectedRoadmap = useMemo(
    () => roadmaps.find((item) => String(item.skill_id) === String(selectedSkillId)) || null,
    [roadmaps, selectedSkillId],
  )

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  useEffect(() => {
    return () => {
      pollTimersRef.current.forEach((timerId) => window.clearInterval(timerId))
      pollTimersRef.current.clear()
    }
  }, [])

  useEffect(() => {
    if (!userId) return
    let active = true

    async function loadRoadmapData() {
      setLoadingRoadmaps(true)
      try {
        const data = await listRoadmaps(userId)
        if (!active) return
        const rows = Array.isArray(data?.roadmaps) ? data.roadmaps : []
        setRoadmaps(rows)
        if (rows.length > 0) {
          const activeRoadmap = rows.find((item) => item.has_active_session)
          setSelectedSkillId(String(activeRoadmap?.skill_id || rows[0].skill_id))
        } else {
          setSelectedSkillId('')
        }
      } catch (err) {
        toast.error(err.message || 'Failed to load roadmaps')
      } finally {
        if (active) setLoadingRoadmaps(false)
      }
    }

    loadRoadmapData()
    return () => {
      active = false
    }
  }, [userId, toast])

  useEffect(() => {
    if (!userId || !selectedSkillId) {
      setSessions([])
      setActiveSessionId('')
      setMessages([])
      setSuggestions([])
      return
    }

    let active = true
    async function loadSkillData() {
      setLoadingSessions(true)
      setLoadingDocs(true)
      try {
        const [sessionsData, docsData] = await Promise.all([
          listSessions(userId, selectedSkillId),
          listDocuments(userId, selectedSkillId),
        ])
        if (!active) return

        const sessionRows = Array.isArray(sessionsData?.sessions) ? sessionsData.sessions : []
        setSessions(sessionRows)

        const docsRows = Array.isArray(docsData?.documents) ? docsData.documents : []
        setDocuments(docsRows)
        docsRows.forEach((doc) => {
          if (doc.status === 'indexing' || doc.status === 'pending') {
            startStatusPolling(doc.document_id)
          }
        })

        if (sessionRows.length > 0) {
          setActiveSessionId(String(sessionRows[0].session_id))
        } else {
          setActiveSessionId('')
          setMessages([])
          setSuggestions([])
        }
      } catch (err) {
        toast.error(err.message || 'Failed to load sessions')
      } finally {
        if (active) {
          setLoadingSessions(false)
          setLoadingDocs(false)
        }
      }
    }

    loadSkillData()
    return () => {
      active = false
    }
  }, [selectedSkillId, userId, toast])

  useEffect(() => {
    if (!userId || !activeSessionId) return
    let active = true

    async function loadConversation() {
      setLoadingMessages(true)
      try {
        const [historyData, suggestionsData] = await Promise.all([
          listSessionMessages(activeSessionId, userId),
          listSuggestions(activeSessionId, userId),
        ])
        if (!active) return
        setMessages(Array.isArray(historyData?.messages) ? historyData.messages : [])
        setSuggestions(Array.isArray(suggestionsData?.suggestions) ? suggestionsData.suggestions : [])
      } catch (err) {
        toast.error(err.message || 'Failed to load chat')
      } finally {
        if (active) setLoadingMessages(false)
      }
    }

    loadConversation()
    return () => {
      active = false
    }
  }, [activeSessionId, userId, toast])

  function resizeTextarea() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`
  }

  async function startNewSession() {
    if (!userId || !selectedSkillId) return null
    try {
      const response = await createTutorSession(userId, selectedSkillId)
      const sessionId = String(response.session_id)
      setActiveSessionId(sessionId)

      setSessions((prev) => {
        const withoutCurrent = prev.filter((item) => String(item.session_id) !== sessionId)
        return [
          {
            session_id: sessionId,
            skill_id: response.skill_id,
            skill_name: response.skill_name,
            title: null,
            last_message_preview: null,
            message_count: response.message_count || 0,
            status: response.status,
            last_activity: response.created_at,
            created_at: response.created_at,
          },
          ...withoutCurrent,
        ]
      })

      const historyData = await listSessionMessages(sessionId, userId)
      setMessages(Array.isArray(historyData?.messages) ? historyData.messages : [])
      const suggestionsData = await listSuggestions(sessionId, userId)
      setSuggestions(Array.isArray(suggestionsData?.suggestions) ? suggestionsData.suggestions : [])
      return sessionId
    } catch (err) {
      toast.error(err.message || 'Failed to create session')
      return null
    }
  }

  async function handleSend(nextText) {
    const text = (nextText ?? input).trim()
    if (!text || !userId || !selectedSkillId || sending) return

    let sessionId = activeSessionId
    if (!sessionId) {
      sessionId = await startNewSession()
      if (!sessionId) {
        try {
          const fresh = await listSessions(userId, selectedSkillId)
          const first = fresh?.sessions?.[0]?.session_id
          if (!first) return
          sessionId = String(first)
          setActiveSessionId(sessionId)
        } catch {
          return
        }
      }
    }

    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    const optimisticUser = {
      message_id: `tmp-user-${Date.now()}`,
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
      sources: [],
    }
    setMessages((prev) => [...prev, optimisticUser])
    setSending(true)

    try {
      const response = await sendMessage(sessionId, userId, text)
      const assistantMessage = {
        message_id: response.message_id,
        role: 'assistant',
        content: response.response,
        grounded: response.grounded,
        sources: response.sources || [],
        blocked: response.blocked,
        blocked_reason: response.blocked_reason,
        created_at: response.created_at,
      }

      setMessages((prev) => [...prev, assistantMessage])
      setSessions((prev) =>
        prev.map((row) =>
          String(row.session_id) === String(sessionId)
            ? {
                ...row,
                title: row.title || text.slice(0, 50),
                last_message_preview: response.response.slice(0, 80),
                message_count: (row.message_count || 0) + 2,
                last_activity: response.created_at,
              }
            : row,
        ),
      )

      const suggestionsData = await listSuggestions(sessionId, userId)
      setSuggestions(Array.isArray(suggestionsData?.suggestions) ? suggestionsData.suggestions : [])
    } catch (err) {
      toast.error(err.message || 'Failed to send message')
      setMessages((prev) => prev.filter((item) => item.message_id !== optimisticUser.message_id))
    } finally {
      setSending(false)
      setTimeout(() => textareaRef.current?.focus(), 0)
    }
  }

  async function handleFeedback(messageId, rating) {
    if (!userId || !activeSessionId || !messageId) return

    const previous = messages
    setMessages((prev) =>
      prev.map((msg) =>
        String(msg.message_id) === String(messageId)
          ? { ...msg, feedback: rating }
          : msg,
      ),
    )

    try {
      await submitFeedback(activeSessionId, userId, messageId, rating)
    } catch (err) {
      setMessages(previous)
      toast.error(err.message || 'Failed to submit feedback')
    }
  }

  async function handleRoadmapComplete() {
    if (!userId || !selectedSkillId) return
    const confirmed = window.confirm('Are you sure you want to mark this roadmap as complete?')
    if (!confirmed) return

    try {
      await completeRoadmap(selectedSkillId, userId)
      toast.success('Roadmap marked complete')
    } catch (err) {
      toast.error(err.message || 'Failed to complete roadmap')
    }
  }

  async function handleUploadDocument(event) {
    const file = event.target.files?.[0]
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (!file || !userId || !selectedSkillId) return

    const extension = (file.name.split('.').pop() || '').toLowerCase()
    if (!ACCEPTED_EXTENSIONS.includes(extension)) {
      toast.error('Only PDF and DOCX files are supported')
      return
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      toast.error(`File too large. Maximum is ${MAX_FILE_MB} MB.`)
      return
    }

    setDocUploading(true)
    try {
      const upload = await uploadTutorDoc(userId, selectedSkillId, file)
      const optimistic = {
        document_id: upload.document_id,
        title: upload.title,
        status: upload.status,
        page_count: null,
        created_at: new Date().toISOString(),
      }
      setDocuments((prev) => [optimistic, ...prev.filter((doc) => doc.document_id !== optimistic.document_id)])
      startStatusPolling(upload.document_id)
    } catch (err) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setDocUploading(false)
    }
  }

  function startStatusPolling(documentId) {
    const id = String(documentId)
    if (pollTimersRef.current.has(id)) return

    const timerId = window.setInterval(async () => {
      try {
        const statusData = await getDocumentStatus(id)
        setDocuments((prev) =>
          prev.map((doc) =>
            String(doc.document_id) === id
              ? { ...doc, status: statusData.status, chunk_count: statusData.chunk_count }
              : doc,
          ),
        )

        if (statusData.status === 'ready' || statusData.status === 'failed') {
          const timer = pollTimersRef.current.get(id)
          if (timer) window.clearInterval(timer)
          pollTimersRef.current.delete(id)
        }
      } catch {
        const timer = pollTimersRef.current.get(id)
        if (timer) window.clearInterval(timer)
        pollTimersRef.current.delete(id)
      }
    }, 2500)

    pollTimersRef.current.set(id, timerId)
  }

  function onInputKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex gap-5" style={{ height: 'calc(100vh - 9rem)' }}>
      <div className="w-80 shrink-0 hidden lg:flex flex-col gap-4">
        <div className="bg-card rounded-2xl border border-line shadow-card p-4">
          <p className="text-sm font-semibold text-ink mb-2">Roadmap</p>
          {loadingRoadmaps ? (
            <p className="text-xs text-muted">Loading roadmaps...</p>
          ) : roadmaps.length === 0 ? (
            <p className="text-xs text-muted">No roadmap available for this user.</p>
          ) : (
            <>
              <select
                value={selectedSkillId}
                onChange={(e) => setSelectedSkillId(e.target.value)}
                className="w-full text-sm bg-surface border border-line rounded-lg px-3 py-2 text-ink"
              >
                {roadmaps.map((roadmap) => (
                  <option key={roadmap.skill_id} value={String(roadmap.skill_id)}>
                    {roadmap.skill_name}
                  </option>
                ))}
              </select>
              {selectedRoadmap && (
                <div className="mt-2 text-xs text-muted space-y-1">
                  <p>Target role: {selectedRoadmap.target_role || 'N/A'}</p>
                  <p>Level: {selectedRoadmap.skill_level} · {selectedRoadmap.total_weeks} weeks</p>
                  {selectedRoadmap.has_active_session && <p className="text-green-600">Active session available</p>}
                </div>
              )}
              <button
                onClick={handleRoadmapComplete}
                className="w-full mt-3 text-xs btn-secondary"
                disabled={!selectedSkillId}
              >
                Mark roadmap complete
              </button>
            </>
          )}
        </div>

        <div className="bg-card rounded-2xl border border-line shadow-card overflow-hidden flex-1 min-h-0">
          <div className="flex items-center justify-between px-4 py-3 border-b border-line">
            <p className="text-sm font-semibold text-ink">Sessions</p>
            <button onClick={startNewSession} className="text-xs text-brand-600 hover:underline">
              + New session
            </button>
          </div>
          <div className="overflow-y-auto">
            {loadingSessions ? (
              <p className="text-xs text-muted p-4">Loading sessions...</p>
            ) : sessions.length === 0 ? (
              <p className="text-xs text-muted p-4">No sessions yet. Start a new one.</p>
            ) : (
              <ul className="divide-y divide-line">
                {sessions.map((session) => {
                  const active = String(session.session_id) === String(activeSessionId)
                  return (
                    <li key={session.session_id}>
                      <button
                        onClick={() => setActiveSessionId(String(session.session_id))}
                        className={`w-full text-left px-4 py-3 hover:bg-surface ${active ? 'bg-brand-50 dark:bg-brand-500/10' : ''}`}
                      >
                        <p className="text-sm font-medium text-ink truncate">{toDisplayTitle(session)}</p>
                        <p className="text-xs text-faint truncate">{session.last_message_preview || 'No messages yet'}</p>
                        <p className="text-[11px] text-faint mt-1">
                          {(session.message_count || 0)} msgs · {formatRelativeTime(session.last_activity || session.created_at)}
                        </p>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 min-w-0 bg-card rounded-2xl border border-line shadow-card overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-line flex items-center justify-between">
          <div>
            <p className="font-semibold text-ink">AI Tutor</p>
            <p className="text-xs text-muted">
              {selectedRoadmap ? `${selectedRoadmap.skill_name} · ${selectedRoadmap.skill_level}` : 'Select a roadmap'}
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            {suggestions.slice(0, 3).map((item) => (
              <button
                key={item}
                onClick={() => handleSend(item)}
                className="text-xs px-2.5 py-1 rounded-full border border-line bg-surface hover:bg-brand-50"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {loadingMessages ? (
            <p className="text-sm text-muted">Loading messages...</p>
          ) : messages.length === 0 ? (
            <p className="text-sm text-muted">Start a session and ask your first question.</p>
          ) : (
            messages.map((message) => (
              <MessageBubble key={message.message_id} message={message} onFeedback={handleFeedback} />
            ))
          )}
          {sending && <p className="text-xs text-muted">Tutor is thinking...</p>}
          <div ref={bottomRef} />
        </div>

        <div className="px-4 pb-4 pt-2 border-t border-line">
          <div className="flex items-end gap-2 bg-surface rounded-xl border border-line px-3 py-2.5">
            {canUpload && (
              <button
                onClick={() => fileInputRef.current?.click()}
                title="Upload course material"
                className="w-8 h-8 rounded-lg border border-line text-muted hover:text-ink hover:bg-card"
                disabled={!selectedSkillId || docUploading}
              >
                📎
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx"
              className="hidden"
              onChange={handleUploadDocument}
            />

            <textarea
              ref={textareaRef}
              value={input}
              onChange={(event) => {
                setInput(event.target.value)
                resizeTextarea()
              }}
              onKeyDown={onInputKeyDown}
              placeholder="Type your question..."
              disabled={sending || !selectedSkillId}
              rows={1}
              className="flex-1 bg-transparent text-sm text-ink placeholder:text-faint resize-none outline-none overflow-hidden disabled:opacity-50"
              style={{ height: '24px' }}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || sending || !selectedSkillId}
              className="w-8 h-8 rounded-lg bg-brand-500 text-white disabled:opacity-40"
            >
              ➤
            </button>
          </div>
          <p className="text-center text-[10px] text-faint mt-1.5">Responses may contain mistakes. Verify key details.</p>
        </div>
      </div>

      {canUpload && <div className="hidden xl:flex w-72 shrink-0 flex-col bg-card rounded-2xl border border-line shadow-card min-h-0">
        <div className="px-4 py-3 border-b border-line flex items-center justify-between">
          <p className="text-sm font-semibold text-ink">Course Material</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-xs text-brand-600 hover:underline"
            disabled={!selectedSkillId || docUploading}
          >
            {docUploading ? 'Uploading...' : '+ Upload'}
          </button>
        </div>
        <div className="p-3 overflow-y-auto min-h-0">
          {loadingDocs ? (
            <p className="text-xs text-muted">Loading documents...</p>
          ) : documents.length === 0 ? (
            <p className="text-xs text-muted">No documents uploaded for this roadmap.</p>
          ) : (
            <ul className="space-y-2">
              {documents.map((doc) => (
                <li key={doc.document_id} className="bg-surface border border-line rounded-lg px-3 py-2">
                  <p className="text-xs font-medium text-ink truncate" title={doc.title}>{doc.title}</p>
                  <p className="text-[11px] text-faint mt-1">
                    {doc.status}
                    {doc.page_count ? ` · ${doc.page_count} pages` : ''}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>}
    </div>
  )
}
