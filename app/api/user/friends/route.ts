export const runtime = 'nodejs'
import { NextRequest } from 'next/server'
import { verifyAuth, authError } from '@/lib/auth'
import { friendSchema } from '@/lib/validations'
import { getUserFriends, addFriendPair, removeFriendPair } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req)
    const friends = await getUserFriends(user._id)
    return Response.json({ success: true, data: friends })
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
    if (friendId === user._id) {
      return Response.json({ success: false, error: 'Cannot add yourself as a friend' }, { status: 400 })
    }

    const friends = await addFriendPair(user._id, friendId)
    if (!friends) {
      return Response.json({ success: false, error: 'Could not add friend' }, { status: 400 })
    }

    return Response.json({ success: true, data: friends })
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

    const friends = await removeFriendPair(user._id, friendId)
    if (!friends) {
      return Response.json({ success: false, error: 'Could not remove friend' }, { status: 400 })
    }

    return Response.json({ success: true, data: friends })
  } catch (e: any) {
    if (e.message === 'No token provided' || e.message === 'User not found') return authError()
    return Response.json({ success: false, error: e.message }, { status: 500 })
  }
}
