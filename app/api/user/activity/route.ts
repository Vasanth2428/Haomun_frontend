export const runtime = 'nodejs'
import { NextRequest } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/lib/models/user'
import { verifyAuth, authError } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req)
    await connectDB()
    const userData = await User.findById(user._id)

    // For now, we take it from lastSkillAnalysis if available
    // Otherwise, we mock it based on total solved until we have a proper history log
    const lastAnalysis = userData?.lastSkillAnalysis

    if (lastAnalysis && lastAnalysis.heatmapData) {
      // Aggregate heatmapData into months
      const monthlyData: Record<string, number> = {}
      lastAnalysis.heatmapData.forEach((d: any) => {
        const month = new Date(d.date).toLocaleString('default', { month: 'short' })
        monthlyData[month] = (monthlyData[month] || 0) + d.count
      })

      const data = Object.entries(monthlyData).map(([date, solved]) => ({ date, solved }))
      return Response.json({ success: true, data })
    }

    // No analysis data yet — return empty with flag so frontend can show empty state
    return Response.json({ success: true, data: [], isNewUser: true })
  } catch (e: any) {
    if (e.message === 'No token provided' || e.message === 'User not found') return authError()
    return Response.json({ success: false, error: e.message }, { status: 500 })
  }
}
