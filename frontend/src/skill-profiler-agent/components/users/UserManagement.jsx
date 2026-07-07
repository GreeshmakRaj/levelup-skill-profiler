import { useEffect, useMemo, useState, useCallback } from 'react'
import { listUsers, deleteUser } from '../../services/api'
import { ROLES, ROLE_LABELS } from '../../constants/roles'
import { useToast } from '../ui/Toast'
import UserFormModal from './UserFormModal'
import ConfirmDialog from '../ui/ConfirmDialog'

function RoleBadge({ role }) {
  const styles = {
    [ROLES.ADMIN]: 'bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400',
    [ROLES.MANAGER]: 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-400',
    [ROLES.EMPLOYEE]: 'bg-surface text-muted',
  }
  return <span className={`chip ${styles[role]}`}>{ROLE_LABELS[role]}</span>
}

const fullName = (u) => (u.username || '').trim()

function SortHeader({ label, field, sort, onSort, className = '' }) {
  const active = sort.field === field
  return (
    <th className={`px-3 py-2.5 font-medium ${className}`}>
      <button
        onClick={() => onSort(field)}
        className="inline-flex items-center gap-1 hover:text-ink transition-colors group"
      >
        {label}
        <svg
          className={`w-3.5 h-3.5 transition-opacity ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'} ${active && sort.dir === 'desc' ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>
    </th>
  )
}

export default function UserManagement({ creatorRole }) {
  const toast = useToast()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [sort, setSort] = useState({ field: 'name', dir: 'asc' })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setUsers(await listUsers())
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { load() }, [load])

  const managers = users.filter((u) => u.role === ROLES.MANAGER).map((u) => ({
    userId: u.userId,
    name: fullName(u) || u.email,
  }))

  const onSort = (field) =>
    setSort((s) => ({ field, dir: s.field === field && s.dir === 'asc' ? 'desc' : 'asc' }))

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let rows = users.filter((u) => {
      const matchesQ = !q || fullName(u).toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter
      return matchesQ && matchesRole
    })
    const val = (u) =>
      sort.field === 'email' ? u.email
        : sort.field === 'role' ? u.role
        : sort.field === 'reports' ? (u.reportsToName || '')
        : fullName(u) || u.email
    rows = [...rows].sort((a, b) => {
      const cmp = val(a).localeCompare(val(b), undefined, { sensitivity: 'base' })
      return sort.dir === 'asc' ? cmp : -cmp
    })
    return rows
  }, [users, query, roleFilter, sort])

  async function confirmDelete() {
    setDeleting(true)
    try {
      await deleteUser(toDelete.userId)
      toast.success('User deleted.')
      setToDelete(null)
      load()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setDeleting(false)
    }
  }

  const roleTabs = creatorRole === ROLES.ADMIN
    ? ['ALL', ROLES.MANAGER, ROLES.EMPLOYEE]
    : ['ALL', ROLES.EMPLOYEE]

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="font-semibold text-ink">Team Members</h2>
          <p className="text-sm text-muted">
            {creatorRole === ROLES.ADMIN ? 'Manage all managers and employees' : 'Manage your employees'}
          </p>
        </div>
        <button className="btn-primary text-sm" onClick={() => setShowForm(true)}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Create User
        </button>
      </div>

      {/* Toolbar */}
      {!loading && users.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-faint" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" /></svg>
            <input
              className="input pl-9"
              placeholder="Search by name or email…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search users"
            />
          </div>
          <div className="flex gap-1 bg-surface rounded-xl p-1">
            {roleTabs.map((t) => (
              <button
                key={t}
                onClick={() => setRoleFilter(t)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  roleFilter === t ? 'bg-card text-ink shadow-sm' : 'text-muted hover:text-ink'
                }`}
              >
                {t === 'ALL' ? 'All' : ROLE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-12" />)}
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-surface flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-faint" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4z" /></svg>
          </div>
          <p className="font-medium text-ink">No team members yet</p>
          <p className="text-sm text-muted mt-1 mb-3">Create your first user to get started.</p>
          <button className="btn-primary text-sm" onClick={() => setShowForm(true)}>Create user</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10 text-sm text-muted">No users match your search.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-surface text-left text-xs text-muted uppercase tracking-wider">
              <tr>
                <SortHeader label="Name" field="name" sort={sort} onSort={onSort} />
                <SortHeader label="Email" field="email" sort={sort} onSort={onSort} className="hidden sm:table-cell" />
                <SortHeader label="Role" field="role" sort={sort} onSort={onSort} />
                <SortHeader label="Reports To" field="reports" sort={sort} onSort={onSort} className="hidden md:table-cell" />
                <th className="px-3 py-2.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.userId} className="border-t border-line hover:bg-surface/60 transition-colors">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-full bg-brand-500 text-white text-xs font-semibold flex items-center justify-center shrink-0">
                        {(fullName(u)[0] || u.email[0] || '?').toUpperCase()}
                      </span>
                      <span className="font-medium text-ink truncate">{fullName(u) || '—'}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-muted hidden sm:table-cell">{u.email}</td>
                  <td className="px-3 py-3"><RoleBadge role={u.role} /></td>
                  <td className="px-3 py-3 text-muted hidden md:table-cell">{u.reportsToName || '—'}</td>
                  <td className="px-3 py-3 text-right">
                    {u.role !== ROLES.ADMIN && (
                      <button
                        onClick={() => setToDelete(u)}
                        className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 font-medium px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && users.length > 0 && (
        <p className="text-xs text-faint mt-3">
          Showing {filtered.length} of {users.length} {users.length === 1 ? 'member' : 'members'}
        </p>
      )}

      <UserFormModal
        open={showForm}
        creatorRole={creatorRole}
        managers={managers}
        onClose={() => setShowForm(false)}
        onCreated={load}
      />

      <ConfirmDialog
        open={!!toDelete}
        destructive
        title="Delete user?"
        message={toDelete ? `This permanently removes ${toDelete.email} and all their data. This cannot be undone.` : ''}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  )
}
