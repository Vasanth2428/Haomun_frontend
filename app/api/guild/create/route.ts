export const runtime = 'nodejs'
import { NextRequest } from 'next/server'
import mongoose from 'mongoose'
import connectDB from '@/lib/db'
import Guild from '@/lib/models/guild'
import User from '@/lib/models/user'
import { verifyAuth, authError } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuth(req)
    const { name, description, emblem } = await req.json()

    if (!name) return Response.json({ success: false, error: 'Guild name is required' }, { status: 400 })

    await connectDB()

    // Sanitizing string input to prevent NoSQL injection
    const sanitizedName = typeof name === 'string' ? name.trim() : ''
    
    if (!sanitizedName || sanitizedName.length < 3) {
      return Response.json({ success: false, error: 'Guild name must be at least 3 characters' }, { status: 400 })
    }

    // Check if guild name exists
    const existing = await Guild.findOne({ name: sanitizedName })
    if (existing) {
      return Response.json({ success: false, error: 'Guild name already taken' }, { status: 400 })
    }

    const guild = await Guild.create({
      name: sanitizedName,
      description: (description || '').substring(0, 200),
      emblem: (emblem || '🛡️').substring(0, 5), // Limit emblem size
      leader: user._id,
      members: [user._id],
      totalScore: user.haomunScore || 0
    })

    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id, guildId: { $exists: false } },
      { guildId: guild._id },
      { new: true }
    )

    if (!updatedUser) {
      // Rollback guild creation if user was sneaky/concurrent
      await Guild.findByIdAndDelete(guild._id)
      return Response.json({ success: false, error: 'You are already in a guild' }, { status: 400 })
    }

    return Response.json({ success: true, data: guild })
  } catch (e: any) {
    if (e.message === 'No token provided' || e.message === 'User not found') return authError()
    return Response.json({ success: false, error: e.message }, { status: 500 })
  }
}
