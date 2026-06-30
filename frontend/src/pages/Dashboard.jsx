import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { listMySkills, listUsers, deleteSkill } from '../services/api'
import { supabase } from '../services/supabase'
import { ROLES } from '../constants/roles'
import ProfileSummaryCard from '../components/skills/ProfileSummaryCard'
import UserManagement from '../components/users/UserManagement'
import LearningPathCard from '../components/skills/LearningPathCard'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { useToast } from '../components/ui/Toast'
import StatCard, { StatCardSkeleton, STAT_ICONS } from '../components/ui/StatCard'

function PageHeader({ title, subtitle }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">{title}</h1>
      {subtitle && <p className="text-muted text-sm mt-1">{subtitle}</p>}
    </div>
  )
}

export default function Dashboard() {
  const { profile, role, loading } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [skills, setSkills] = useState([])
  const [users, setUsers] = useState([])
  const [dataLoading, setDataLoading] = useState(true)
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [copied, setCopied] = useState(false)

  const isAssessor = role === ROLES.MANAGER || role === ROLES.EMPLOYEE
  const isAdmin = role === ROLES.ADMIN
  const isManager = role === ROLES.MANAGER

  useEffect(() => {
    if (!role) return
    let active = true
    setDataLoading(true)
    const jobs = []
    jobs.push(isAssessor ? listMySkills().catch(() => []) : Promise.resolve([]))
    jobs.push(isAdmin || isManager ? listUsers().catch(() => []) : Promise.resolve([]))
    Promise.all(jobs).then(([sk, us]) => {
      if (!active) return
      setSkills(sk); setUsers(us); setDataLoading(false)
    })
    return () => { active = false }
  }, [role, isAssessor, isAdmin, isManager])

  const reloadSkills = useCallback(() => {
    listMySkills().then(setSkills).catch(() => {})
  }, [])

  async function copyApiKey() {
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token
    if (!token) {
      toast.error('No active session token.')
      return
    }
    try {
      await navigator.clipboard.writeText(token)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success('Current API key copied.')
    } catch {
      toast.error('Could not copy the API key.')
    }
  }

  async function confirmDelete() {
    setDeleting(true)
    try {
      await deleteSkill(toDelete.skillId)
      toast.success('Assessment deleted.')
      setToDelete(null)
      reloadSkills()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setDeleting(false)
    }
  }

  if (loading || !role) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
    )
  }

  const latest = skills[0] || null
  const managerCount = users.filter((u) => u.role === ROLES.MANAGER).length
  const employeeCount = users.filter((u) => u.role === ROLES.EMPLOYEE).length
  const skillCount = latest ? Object.keys(latest.skills || {}).length : 0
  const gapCount = latest ? (latest.skillGaps?.length || 0) : 0

  const stats = isAdmin
    ? [
        { label: 'Total Users', value: users.length, icon: STAT_ICONS.users, accent: 'brand', hint: 'across the organization' },
        { label: 'Managers', value: managerCount, icon: STAT_ICONS.manager, accent: 'violet' },
        { label: 'Employees', value: employeeCount, icon: STAT_ICONS.employee, accent: 'green' },
        { label: 'Assessments', value: skills.length, icon: STAT_ICONS.chart, accent: 'amber', hint: 'your own' },
      ]
    : isManager
    ? [
        { label: 'My Team', value: users.length, icon: STAT_ICONS.users, accent: 'brand', hint: 'direct reports' },
        { label: 'My Assessments', value: skills.length, icon: STAT_ICONS.chart, accent: 'violet' },
        { label: 'Skills Tracked', value: skillCount, icon: STAT_ICONS.skills, accent: 'green', hint: 'latest analysis' },
        { label: 'Open Skill Gaps', value: gapCount, icon: STAT_ICONS.gap, accent: 'amber', hint: 'latest analysis' },
      ]
    : [
        { label: 'Assessments', value: skills.length, icon: STAT_ICONS.chart, accent: 'brand' },
        { label: 'Skills Tracked', value: skillCount, icon: STAT_ICONS.skills, accent: 'green', hint: 'latest analysis' },
        { label: 'Open Skill Gaps', value: gapCount, icon: STAT_ICONS.gap, accent: 'amber', hint: 'latest analysis' },
      ]

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title={`Welcome${profile?.username ? `, ${profile.username}` : ''}`}
          subtitle={isAdmin ? 'Administer your organization’s users and access.' : 'Here’s an overview of your skill journey.'}
        />
        <div className="shrink-0 flex flex-col items-end gap-1.5">
          <button
            onClick={copyApiKey}
            title="Copy your current API key (access token)"
            className="group inline-flex items-center gap-2.5 rounded-xl border border-line bg-card px-5 py-3 text-base text-ink shadow-sm transition-all hover:border-brand-300 hover:bg-surface focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          >
            <svg className="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4-2a6 6 0 01-7.743 5.743L11 14H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            <span className="font-semibold">{copied ? 'Copied' : 'Copy API key'}</span>
            {copied ? (
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-faint group-hover:text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h6a2 2 0 002-2v-2" />
              </svg>
            )}
          </button>
          <p className="text-xs text-faint">you can access api's using token</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dataLoading
          ? [...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)
          : stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Profile summary for Manager & Employee */}
      {isAssessor && <ProfileSummaryCard profile={profile} latest={latest} />}

      {/* User management for Admin & Manager */}
      {(isAdmin || isManager) && <UserManagement creatorRole={role} />}

      {/* Learning paths preview for Manager & Employee */}
      {isAssessor && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-ink">Recent Learning Paths</h2>
            <button className="btn-ghost text-sm" onClick={() => navigate('/learning-paths')}>View all →</button>
          </div>

          {dataLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-40" />)}
            </div>
          ) : skills.length === 0 ? (
            <div className="card text-center py-10">
              <p className="text-muted text-sm">You haven’t analyzed any skill gaps yet.</p>
              <button className="btn-primary text-sm mt-3" onClick={() => navigate('/learning-paths')}>
                Start your first analysis
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {skills.slice(0, 3).map((item) => (
                <LearningPathCard
                  key={item.skillId}
                  item={item}
                  onOpen={(it) => navigate(`/learning-paths?analysis=${it.skillId}`)}
                  onDelete={setToDelete}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        destructive
        title="Delete assessment?"
        message="This permanently removes the assessment and its uploaded resume. This cannot be undone."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  )
}