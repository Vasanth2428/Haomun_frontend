export const runtime = 'nodejs'
import { NextRequest } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/lib/models/user'
import { verifyAuth, authError } from '@/lib/auth'
import { friendSchema } from '@/lib/validations'

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req)
    await connectDB()
    const userData = await User.findById(user._id).populate('friends', 'username email avatarUrl haomunScore masteryLevel')
    return Response.json({ success: true, data: userData?.friends || [] })
  } catch (e: any) {
    if (e.message === 'No token provided' || e.message === 'User not found') return authError()
    return Response.json({ success: false, error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuth(req)
    const body = await req.json()
    const validation = friendSchema.safeParse(body)

    if (!validation.success) {
      return Response.json({
        success: false,
        error: validation.error.errors[0].message
      }, { status: 400 })
    }

    const { friendId } = validation.data
    if (friendId === user._id.toString()) {
      return Response.json({ success: false, error: 'Cannot add yourself as a friend' }, { status: 400 })
    }

    await connectDB()
    const friend = await User.findById(friendId)
    if (!friend) {
      return Response.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    // Bidirectional add
    await Promise.all([
      User.findByIdAndUpdate(user._id, { $addToSet: { friends: friendId } }),
      User.findByIdAndUpdate(friendId, { $addToSet: { friends: user._id } })
    ])

    const updatedUser = await User.findById(user._id).populate('friends', 'username email avatarUrl haomunScore masteryLevel')
    return Response.json({ success: true, data: updatedUser?.friends })
  } catch (e: any) {
    if (e.message === 'No token provided' || e.message === 'User not found') return authError()
    return Response.json({ success: false, error: e.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await verifyAuth(req)
    const { searchParams } = new URL(req.url)
    const friendId = searchParams.get('friendId')

    if (!friendId) {
      return Response.json({ success: false, error: 'Friend ID is required' }, { status: 400 })
    }

    await connectDB()
    // Bidirectional remove
    await Promise.all([
      User.findByIdAndUpdate(user._id, { $pull: { friends: friendId } }),
      User.findByIdAndUpdate(friendId, { $pull: { friends: user._id } })
    ])

    const updatedUser = await User.findById(user._id).populate('friends', 'username email avatarUrl haomunScore masteryLevel')
    return Response.json({ success: true, data: updatedUser?.friends })
  } catch (e: any) {
    if (e.message === 'No token provided' || e.message === 'User not found') return authError()
    return Response.json({ success: false, error: e.message }, { status: 500 })
  }
}
