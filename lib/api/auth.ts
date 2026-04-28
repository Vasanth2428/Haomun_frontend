/**
 * Cookie-based auth helpers.
 * Dual-reads from cookie + localStorage for backward compatibility.
 */

const LOGGED_IN_KEY = 'haomun_logged_in'

export function setAuthCookie(token: string) {
    // We no longer set the token client-side.
    // The server sets the HttpOnly haomun_token.
    // We only set a hint for the UI.
    if (typeof document !== 'undefined') {
        document.cookie = `${LOGGED_IN_KEY}=true; path=/; SameSite=Strict`
    }
}

export function clearAuthCookie() {
    if (typeof document !== 'undefined') {
        document.cookie = `${LOGGED_IN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
    }
}

export function getAuthToken(): string | null {
    // We can't access the token anymore!
    // This function is now mostly for checking if we THINK we are logged in.
    return isAuthenticated() ? 'session_active' : null
}

export function isAuthenticated(): boolean {
    if (typeof document !== 'undefined') {
        return document.cookie.includes(`${LOGGED_IN_KEY}=true`)
    }
    return false
}
