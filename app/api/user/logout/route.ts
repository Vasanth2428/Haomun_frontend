export const runtime = 'nodejs'
import { cookies } from 'next/headers'

export async function POST() {
    const cookieStore = await cookies()

    cookieStore.set('haomun_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 0
    })

    cookieStore.set('haomun_logged_in', '', {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 0
    })

    return Response.json({ success: true })
}
