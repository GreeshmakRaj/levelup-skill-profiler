import { request } from './http'

// Current user + shared reference data used across every feature.
export const getMe = () => request('/api/v1/me')

export const updateUsername = (username) =>
  request('/api/v1/me', { method: 'PATCH', body: { username } })

export const getRoleOptions = () => request('/api/v1/job-roles')
