import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai'

const AI_PROVIDER = process.env.AI_PROVIDER || 'gemini'
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3'
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434'

let model: GenerativeModel | null = null

// Initialize Gemini
if (AI_PROVIDER === 'gemini') {
  try {
    const key = process.env.GEMINI_API_KEY
    if (key && key.trim() !== '' && key.length >= 30) {
      const genAI = new GoogleGenerativeAI(key)
      const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro']
      for (const name of models) {
        try {
          model = genAI.getGenerativeModel({ model: name })
          console.log(`[AI] Initialized Gemini model: ${name}`)
          break
        } catch { /* try next */ }
      }
    }
  } catch (e) {
    console.error('[AI] Failed to initialize Gemini:', e)
  }
} else {
  console.log(`[AI] Using Ollama provider (model: ${OLLAMA_MODEL}, url: ${OLLAMA_URL})`)
}

async function retryCall<T>(op: () => Promise<T>, retries = 3): Promise<T> {
  for (let i = 1; i <= retries; i++) {
    try { return await op() }
    catch (e: any) {
      if (e.message?.includes('API_KEY_INVALID')) throw e
      if (i === retries) throw e
      await new Promise(r => setTimeout(r, Math.pow(2, i - 1) * 1000))
    }
  }
  throw new Error('Retry exhausted')
}

async function ollamaGenerate(prompt: string): Promise<string> {
  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: OLLAMA_MODEL, prompt, stream: false }),
  })

  if (!res.ok) {
    throw new Error(`Ollama request failed: ${res.status} ${res.statusText}`)
  }

  const data = await res.json()
  return (data.response || '').trim()
}

function isOllama(): boolean {
  return AI_PROVIDER === 'ollama'
}

function hasProvider(): boolean {
  return isOllama() || model !== null
}

async function callProvider(prompt: string): Promise<string> {
  if (isOllama()) {
    return retryCall(() => ollamaGenerate(prompt))
  }
  return retryCall(async () => {
    const res = await model!.generateContent(prompt)
    return res.response.text().trim()
  })
}

export async function generateSummary(insights: any): Promise<string> {
  if (!hasProvider()) {
    const { totalProblems, difficultySpread, platform } = insights
    return `Based on your ${platform} profile showing ${totalProblems || 0} solved problems (${difficultySpread || 'N/A'}), you show solid problem-solving skills. Focus on advanced algorithms and contest participation to level up.`
  }

  const prompt = `You are an expert competitive programming analyst. Generate a comprehensive summary of:\n\n${JSON.stringify(insights, null, 2)}\n\nProvide: 1. Natural language summary 2. Strengths 3. Areas for improvement 4. Recommendations. Keep it concise but informative.`

  return callProvider(prompt)
}

export async function editScrollForge(draft: string, instruction: string): Promise<{ newText: string; error?: string }> {
  if (!hasProvider()) {
    let newText = draft
    const lower = instruction.toLowerCase()
    if (lower.includes('formal') || lower.includes('professional')) {
      newText = newText.replace(/\b(gonna|gotta|wanna)\b/gi, m => ({ gonna: 'going to', gotta: 'have to', wanna: 'want to' }[m.toLowerCase()] || m))
    }
    if (lower.includes('concise') || lower.includes('shorter')) {
      newText = newText.replace(/\b(in order to)\b/gi, 'to').replace(/\b(due to the fact that)\b/gi, 'because').replace(/\s+/g, ' ').trim()
    }
    return { newText, error: newText === draft ? 'AI not available, no changes applied.' : undefined }
  }

  const prompt = `You are an expert editor. Edit this draft:\n\n${draft}\n\nInstruction: ${instruction}\n\nReturn only the improved text.`
  const result = await callProvider(prompt)
  return { newText: result }
}

export async function generateSkillAnalysis(aggregatedData: any): Promise<any> {
  const fallback = {
    overview: "The digital mists partially obscure your past trials, but your manifestation shows steady growth.",
    strengths: ["Consistency in daily devotion", "Wide-ranging curiosity across digital realms"],
    skillGaps: ["Deeper mastery of advanced structures is yet to be claimed"],
    strategy: "Focus on complex dynamic rituals to ascend further.",
    isFallback: true
  }

  if (!hasProvider()) {
    const { isFallback: _, ...clean } = fallback
    return clean
  }

  const prompt = `You are the HaoMun Oracle. Analyze:\n\n${JSON.stringify(aggregatedData, null, 2)}\n\nReturn ONLY a JSON object with: overview (string), strengths (string[]), skillGaps (string[]), strategy (string).`

  try {
    const text = await callProvider(prompt)
    const match = text.match(/\{[\s\S]*\}/)
    const jsonStr = match ? match[0] : text
    try {
      return JSON.parse(jsonStr)
    } catch {
      console.warn('[AI] JSON Parse failed, returning fallback')
      return fallback
    }
  } catch (e) {
    console.error('[AI] Generation failed, returning fallback:', e)
    return fallback
  }
}
