import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai'

let model: GenerativeModel | null = null

// Initialize Gemini
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

export async function generateSummary(insights: any): Promise<string> {
  if (!model) {
    const { totalProblems, difficultySpread, platform } = insights
    return `Based on your ${platform} profile showing ${totalProblems || 0} solved problems (${difficultySpread || 'N/A'}), you show solid problem-solving skills. Focus on advanced algorithms and contest participation to level up.`
  }

  const prompt = `You are an expert competitive programming analyst. Generate a comprehensive summary of:\n\n${JSON.stringify(insights, null, 2)}\n\nProvide: 1. Natural language summary 2. Strengths 3. Areas for improvement 4. Recommendations. Keep it concise but informative.`

  return retryCall(async () => {
    const res = await model!.generateContent(prompt)
    return res.response.text().trim()
  })
}

export async function editScrollForge(draft: string, instruction: string): Promise<{ newText: string; error?: string }> {
  if (!model) {
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
  const result = await retryCall(async () => {
    const res = await model!.generateContent(prompt)
    return res.response.text().trim()
  })
  return { newText: result }
}

export async function generateSkillAnalysis(aggregatedData: any): Promise<any> {
  if (!model) {
    return {
      overview: "The digital mists partially obscure your past trials, but your manifestation shows steady growth.",
      strengths: ["Consistency in daily devotion", "Wide-ranging curiosity across digital realms"],
      skillGaps: ["Deeper mastery of advanced structures is yet to be claimed"],
      strategy: "Focus on complex dynamic rituals to ascend further."
    }
  }

  const prompt = `You are the HaoMun Oracle. Analyze:\n\n${JSON.stringify(aggregatedData, null, 2)}\n\nReturn ONLY a JSON object with: overview (string), strengths (string[]), skillGaps (string[]), strategy (string).`

  return retryCall(async () => {
    const res = await model!.generateContent(prompt)
    const text = res.response.text().trim()
    const match = text.match(/\{[\s\S]*\}/)
    return JSON.parse(match ? match[0] : text)
  })
}
