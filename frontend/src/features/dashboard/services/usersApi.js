import { request } from '@global/services/http'

// Team 1 — user / employee management endpoints.
export const listUsers = () => request('/api/v1/users')

export const createUser = (payload) =>
  request('/api/v1/users', { method: 'POST', body: payload })

export const deleteUser = (userId) =>
  request(`/api/v1/users/${userId}`, { method: 'DELETE' })

export const updateReportsTo = (userId, reportsTo) =>
  request(`/api/v1/users/${userId}/reports-to`, { method: 'PATCH', body: { reportsTo } })
