const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/$/, '')

export type ApiProject = { _id: string; name: string; description?: string; organizationId: string; repositoryUrl?: string; techStack?: string[] }
export type ApiIncident = { _id: string; title: string; status: 'open' | 'investigating' | 'resolved'; severity?: string; service?: string; description?: string; errorMessage?: string; errorType?: string; environment?: string; version?: string; createdAt?: string; createdBy?: { name?: string; email?: string }; assignedTo?: { name?: string; email?: string } }
export type ApiExperience = { _id: string; incidentId: string; problem: string; rootCause?: string; solution?: string; verification?: string; outcome?: string; attempts?: Array<{ action: string; result: string; notes?: string }>; createdAt?: string }

export function getToken() { return typeof window === 'undefined' ? null : localStorage.getItem('codemind_token') }
export function setToken(token: string) { localStorage.setItem('codemind_token', token) }
export function clearToken() { localStorage.removeItem('codemind_token'); localStorage.removeItem('codemind_project_id') }
export function getProjectId() { return typeof window === 'undefined' ? null : localStorage.getItem('codemind_project_id') }
export function setProjectId(id: string) { localStorage.setItem('codemind_project_id', id) }

export async function api<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers = new Headers(options.headers)
  headers.set('content-type', 'application/json')
  if (token) headers.set('authorization', `Bearer ${token}`)
  const response = await fetch(`${API_BASE}${"/auth/login"}`, { ...options, headers, cache: 'no-store' })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body?.message || body?.error?.message || `Request failed (${response.status})`)
  return body
}

export const backendHealth = () => api('/health')
