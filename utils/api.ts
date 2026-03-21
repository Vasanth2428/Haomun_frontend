import { getAuthToken as getToken, setAuthCookie, clearAuthCookie } from '@/utils/auth'

// Use relative paths — API routes are now served by the same Next.js app
const BASE_URL = ''

function getAuthToken() {
  return getToken();
}

export function setAuthToken(token: string) {
  setAuthCookie(token);
}

export function logout() {
  clearAuthCookie();
}

async function apiRequest(path: string, payload?: any, method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE' = 'POST', signal?: AbortSignal) {
  try {
    const fullUrl = `${BASE_URL}${path}`;
    const headers: Record<string, string> = {};
    if (!(payload instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    // Note: HttpOnly cookies are automatically sent by the browser

    const options: RequestInit = { method, headers, signal };

    if (payload && method !== 'GET') {
      options.body = payload instanceof FormData ? payload : JSON.stringify(payload);
    }

    const response = await fetch(fullUrl, options);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const ct = response.headers.get('content-type');
        if (ct?.includes('application/json')) {
          const errData = await response.json();
          errorMessage = errData.message || errData.error || errorMessage;
        }
      } catch { /* ignore */ }

      return { success: false, error: errorMessage, status: response.status };
    }

    // Handle PDF binary responses
    const ct = response.headers.get('content-type');
    if (ct?.includes('application/pdf')) {
      const blob = await response.blob();
      return { success: true, data: blob };
    }

    const data = await response.json();
    return { success: true, data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      status: 0
    };
  }
}

// ── Authentication ──────────────────────────────────────────────
export async function register(userData: any) {
  return apiRequest('/api/user/register', userData);
}

export async function login(credentials: any) {
  return apiRequest('/api/user/login', credentials);
}

export async function getProfile(signal?: AbortSignal) {
  return apiRequest('/api/user/profile', null, 'GET', signal);
}

export async function getFriends(signal?: AbortSignal) {
  return apiRequest('/api/user/friends', null, 'GET', signal);
}

export async function addFriend(friendId: string) {
  return apiRequest('/api/user/friends', { friendId }, 'POST');
}

export async function removeFriend(friendId: string) {
  return apiRequest(`/api/user/friends?friendId=${friendId}`, null, 'DELETE');
}

export async function searchUsers(query: string, signal?: AbortSignal) {
  return apiRequest(`/api/user/search?q=${query}`, null, 'GET', signal);
}

export async function getLeaderboard(filter?: string, signal?: AbortSignal) {
  const path = filter ? `/api/user/leaderboard?filter=${filter}` : '/api/user/leaderboard';
  return apiRequest(path, null, 'GET', signal);
}

export async function updateProfile(profileData: any) {
  return apiRequest('/api/user/profile', profileData, 'POST');
}

// ── Platform Data ───────────────────────────────────────────────
export async function getLeetCodeStats(username: string) {
  return apiRequest(`/api/insights?platform=leetcode&username=${encodeURIComponent(username)}`, null, 'GET');
}

export async function getCodeforcesStats(username: string) {
  return apiRequest(`/api/insights?platform=codeforces&username=${encodeURIComponent(username)}`, null, 'GET');
}

export async function getSanctumData(signal?: AbortSignal, platforms?: Record<string, string>) {
  const params = new URLSearchParams();
  if (platforms) {
    Object.entries(platforms).forEach(([key, val]) => {
      if (val) params.append(key, val);
    });
  }
  const qs = params.toString();
  const path = qs ? `/api/user/sanctum?${qs}` : '/api/user/sanctum';
  return apiRequest(path, null, 'GET', signal);
}

// ── Insights & AI ───────────────────────────────────────────────
export async function getSkillAnalysis(signal?: AbortSignal) {
  return apiRequest('/api/insights/skill-analysis', null, 'GET', signal);
}

export async function generateSummary(platformData: any) {
  return apiRequest('/api/summary/generate', platformData);
}

// ── Comparison ──────────────────────────────────────────────────
export async function compareAllies(users: any[]) {
  return apiRequest('/api/compare', { users });
}

// ── Tools ───────────────────────────────────────────────────────
export async function getContests(signal?: AbortSignal) {
  return apiRequest('/api/contests', null, 'GET', signal);
}

export async function createReportPdf(params: any) {
  return apiRequest('/api/pdf', params, 'POST');
}

export async function getArchive(signal?: AbortSignal) {
  return apiRequest('/api/user/archive', null, 'GET', signal);
}

export async function getActivity(signal?: AbortSignal) {
  return apiRequest('/api/user/activity', null, 'GET', signal);
}

export async function saveToArchive(title: string, content: string) {
  return apiRequest('/api/user/archive', { title, content }, 'POST');
}

// ── Guilds ─────────────────────────────────────────────────────
export async function getGuilds(signal?: AbortSignal) {
  return apiRequest('/api/guild/list', null, 'GET', signal);
}

export async function createGuild(guildData: { name: string; description: string; emblem?: string }) {
  return apiRequest('/api/guild/create', guildData, 'POST');
}

export async function joinGuild(guildId: string) {
  return apiRequest('/api/guild/join', { guildId }, 'POST');
}

// ── Legacy aliases ──────────────────────────────────────────────
export async function unveilInsight(stats: any) {
  return generateSummary(stats);
}

export async function scribeEdit(draft: string, instruction: string) {
  return apiRequest('/api/summary/scrollforge/edit', { draft, instruction });
}

export async function releaseScroll(text: string) {
  return createReportPdf({ summary: text });
}
