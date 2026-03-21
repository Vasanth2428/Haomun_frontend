/**
 * Cookie-based auth helpers.
 * Dual-reads from cookie + localStorage for backward compatibility.
 */

const TOKEN_KEY = 'haomun_token'

export function setAuthCookie(token: string) {
  if (typeof document !== 'undefined') {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    document.cookie = `${TOKEN_KEY}=${token}; path=/; SameSite=Strict${isLocal ? '' : '; Secure'}`
  }
  // Also set localStorage for backward compat during migration
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(TOKEN_KEY, token)
  }
}

export function clearAuthCookie() {
  if (typeof document !== 'undefined') {
    document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
  }
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(TOKEN_KEY)
  }
}

export function getAuthToken(): string | null {
  // Try cookie first
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(new RegExp(`(?:^|; )${TOKEN_KEY}=([^;]*)`))
    if (match) return match[1]
  }
  // Fallback to localStorage
  if (typeof window !== 'undefined') {
    return window.localStorage.getItem(TOKEN_KEY)
  }
  return null
}

export function isAuthenticated(): boolean {
  return !!getAuthToken()
}
