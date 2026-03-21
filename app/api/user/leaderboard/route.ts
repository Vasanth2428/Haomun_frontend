import connectDB from '@/lib/db'
import User from '@/lib/models/user'

export async function GET() {
  try {
    await connectDB()
    const leaderboard = await User.find({})
      .select('email displayName leetcodeUsername codeforcesUsername haomunScore masteryLevel')
      .sort({ haomunScore: -1 })
      .limit(20)

    return Response.json({ success: true, data: leaderboard })
  } catch (e: any) {
    return Response.json({ success: false, error: e.message }, { status: 500 })
  }
}
