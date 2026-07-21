const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

type RequestOptions = RequestInit & { token?: string }

export const api = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const headers = new Headers(options.headers)
  if (options.token) headers.set('Authorization', `Bearer ${options.token}`)
  if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json')

  const response = await fetch(`${apiUrl}${path}`, { ...options, headers })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.error ?? 'No fue posible completar la solicitud.')
  return body as T
}

export const getAdminToken = () => sessionStorage.getItem('envoye_admin_token')
export const setAdminToken = (token: string | null) => {
  if (token) sessionStorage.setItem('envoye_admin_token', token)
  else sessionStorage.removeItem('envoye_admin_token')
}
