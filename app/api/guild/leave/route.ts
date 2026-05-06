export const runtime = 'nodejs'
import { NextRequest } from 'next/server'
import connectDB from '@/lib/db'
import Guild from '@/lib/models/guild'
import User from '@/lib/models/user'
import { verifyAuth, authError } from '@/lib/auth'

export async function POST(req: NextRequest) {
    try {
        const user = await verifyAuth(req)
        await connectDB()

        const currentUser = await User.findById(user._id)
        if (!currentUser?.guildId) {
            return Response.json({ success: false, error: 'You are not in a guild' }, { status: 400 })
        }

        const guild = await Guild.findById(currentUser.guildId)
        if (!guild) {
            // Guild was deleted — just clear the user's reference
            await User.findByIdAndUpdate(user._id, { $unset: { guildId: 1 } })
            return Response.json({ success: true, message: 'Left guild (guild no longer exists)' })
        }

        // Leaders cannot leave — they must disband or transfer leadership
        if (guild.leader.toString() === user._id.toString()) {
            // If leader is the only member, delete the guild entirely
            if (guild.members.length <= 1) {
                await Guild.findByIdAndDelete(guild._id)
                await User.findByIdAndUpdate(user._id, { $unset: { guildId: 1 } })
                return Response.json({ success: true, message: 'Guild disbanded (you were the only member)' })
            }
            return Response.json({
                success: false,
                error: 'Guild leaders cannot leave. Transfer leadership first or disband the guild.'
            }, { status: 400 })
        }

        const currentScore = currentUser.haomunScore || 0;

        // ATOMIC FIX: Optimistic locking on the user's score to prevent race conditions
        // We atomically clear the user's guildId ONLY IF their score hasn't changed since we fetched it.
        const atomicUserUpdate = await User.findOneAndUpdate(
            { _id: user._id, guildId: guild._id, haomunScore: currentScore },
            { $unset: { guildId: 1 } }
        );

        if (!atomicUserUpdate) {
            return Response.json({ 
                success: false, 
                error: 'Your score was updated while leaving the guild. Please try again to ensure accurate guild synchronization.' 
            }, { status: 409 });
        }

        // Now we safely decrement the exact score we locked in
        await Guild.findByIdAndUpdate(guild._id, {
            $pull: { members: user._id },
            $inc: { totalScore: -currentScore }
        })

        return Response.json({ success: true, message: 'Left the guild successfully' })
    } catch (e: any) {
        if (e.message === 'No token provided' || e.message === 'User not found') return authError()
        return Response.json({ success: false, error: e.message }, { status: 500 })
    }
}
