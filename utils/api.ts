const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

async function apiRequest(path: string, payload: any) {
  // Robust backend offline protection
  const backendUrl = BACKEND_URL;
  const isBackendAvailable = backendUrl &&
                            backendUrl !== 'undefined' &&
                            backendUrl.trim() !== '' &&
                            process.env.NEXT_PUBLIC_BACKEND_URL &&
                            process.env.NEXT_PUBLIC_BACKEND_URL !== 'undefined';

  if (!isBackendAvailable) {
    console.warn("Backend offline — skipping API call to", path);
    return { success: false, error: "Backend service unavailable" };
  }

  try {
    const fullUrl = `${backendUrl}${path}`;
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      return { success: false, error: errorData.message || 'Request failed' };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export async function unveilInsight(stats: any) {
  return apiRequest('/api/summary/generate', stats);
}

export async function compareAllies(users: any[]) {
  return apiRequest('/api/compare', { users });
}

export async function scribeEdit(draft: string, instruction: string) {
  return apiRequest('/api/scrollforge/edit', { draft, instruction });
}

export async function releaseScroll(text: string) {
  return apiRequest('/api/report/create', { text });
}
