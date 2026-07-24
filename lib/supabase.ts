import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Please define SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment.')
}

export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

export interface SupabaseUserRow {
  id: string
  email: string
  password: string
  leetcode_username?: string | null
  codeforces_username?: string | null
  codechef_username?: string | null
  gfg_username?: string | null
  bio?: string | null
  username?: string | null
  avatar_url?: string | null
  haomun_score: number
  mastery_level: string
  last_skill_analysis?: any
  last_analysis_date?: string | null
  friends?: string[] | null
  saved_drafts?: string[] | null
  score_history?: Array<{ score: number; timestamp: string }> | null
  guild_id?: string | null
  archives?: Array<{ title: string; content: string; timestamp: string }> | null
  created_at: string
}

export interface SupabaseGuildRow {
  id: string
  name: string
  description?: string | null
  emblem?: string | null
  leader: string
  members?: string[] | null
  total_score: number
  level: string
  created_at: string
}

export function mapUserRow(row: SupabaseUserRow) {
  return {
    ...row,
    _id: row.id,
    leetcodeUsername: row.leetcode_username || null,
    codeforcesUsername: row.codeforces_username || null,
    codechefUsername: row.codechef_username || null,
    gfgUsername: row.gfg_username || null,
    avatarUrl: row.avatar_url || null,
    haomunScore: row.haomun_score,
    masteryLevel: row.mastery_level,
    lastSkillAnalysis: row.last_skill_analysis,
    lastAnalysisDate: row.last_analysis_date ? new Date(row.last_analysis_date) : undefined,
    friends: row.friends || [],
    savedDrafts: row.saved_drafts || [],
    scoreHistory: (row.score_history || []).map((item) => ({
      score: item.score,
      timestamp: new Date(item.timestamp),
    })),
    guildId: row.guild_id || null,
    archives: (row.archives || []).map((item) => ({
      id: (item as any).id || '',
      title: item.title,
      content: item.content,
      timestamp: new Date(item.timestamp),
    })),
    createdAt: new Date(row.created_at),
  }
}

export function safeUser(row: SupabaseUserRow | SupabaseUser) {
  const mapped = mapUserRow(row as SupabaseUserRow)
  const { password, ...rest } = mapped as any
  return rest
}

export type SupabaseUser = ReturnType<typeof mapUserRow>

export function mapGuildRow(row: SupabaseGuildRow) {
  return {
    ...row,
    _id: row.id,
    leader: row.leader,
    members: row.members || [],
    totalScore: row.total_score,
    level: row.level,
    createdAt: new Date(row.created_at),
  }
}

export type SupabaseUserSummaryRow = Pick<
  SupabaseUserRow,
  'id' | 'username' | 'avatar_url' | 'leetcode_username' | 'codeforces_username' | 'haomun_score' | 'mastery_level'
>

export function mapUserSummaryRow(row: SupabaseUserSummaryRow) {
  return {
    ...row,
    _id: row.id,
    leetcodeUsername: row.leetcode_username || null,
    codeforcesUsername: row.codeforces_username || null,
    avatarUrl: row.avatar_url || null,
    haomunScore: row.haomun_score ?? 0,
    masteryLevel: row.mastery_level || '',
    username: row.username || null,
  }
}

export async function findUserByEmail(email: string): Promise<SupabaseUser | null> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('email', email)
    .single()

  if (error || !data) return null
  return mapUserRow(data)
}

export async function findUserByUsername(username: string): Promise<SupabaseUser | null> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('username', username)
    .single()

  if (error || !data) return null
  return mapUserRow(data)
}

export async function findUserById(id: string): Promise<SupabaseUser | null> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return mapUserRow(data)
}

export async function createUser(user: Partial<SupabaseUserRow>): Promise<SupabaseUser> {
  const hashedPassword = await bcrypt.hash(user.password || '', 10)
  const row = {
    email: user.email,
    password: hashedPassword,
    username: user.username,
    bio: user.bio,
    avatar_url: user.avatar_url,
    leetcode_username: user.leetcode_username,
    codeforces_username: user.codeforces_username,
    codechef_username: user.codechef_username,
    gfg_username: user.gfg_username,
    haomun_score: user.haomun_score ?? 0,
    mastery_level: user.mastery_level ?? 'Apprentice',
    friends: user.friends ?? [],
    saved_drafts: user.saved_drafts ?? [],
    score_history: user.score_history ?? [],
    archives: user.archives ?? [],
    guild_id: user.guild_id ?? null,
    last_skill_analysis: user.last_skill_analysis ?? null,
    last_analysis_date: typeof user.last_analysis_date === 'string'
      ? user.last_analysis_date
      : user.last_analysis_date
        ? (user.last_analysis_date as unknown as Date).toISOString()
        : null,
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .insert(row)
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return mapUserRow(data)
}

function normalizeUserUpdates(updates: Partial<SupabaseUserRow>) {
  const row: any = {}

  for (const [key, value] of Object.entries(updates)) {
    if (key === 'avatarUrl') row.avatar_url = value
    else if (key === 'leetcodeUsername') row.leetcode_username = value
    else if (key === 'codeforcesUsername') row.codeforces_username = value
    else if (key === 'codechefUsername') row.codechef_username = value
    else if (key === 'gfgUsername') row.gfg_username = value
    else if (key === 'haomunScore') row.haomun_score = value
    else if (key === 'masteryLevel') row.mastery_level = value
    else if (key === 'lastSkillAnalysis') row.last_skill_analysis = value
    else if (key === 'lastAnalysisDate') row.last_analysis_date = value instanceof Date ? value.toISOString() : value
    else if (key === 'guildId') row.guild_id = value
    else if (key === 'savedDrafts') row.saved_drafts = value
    else if (key === 'scoreHistory') row.score_history = value
    else row[key] = value
  }

  return row
}

export async function updateUserById(id: string, updates: Record<string, unknown>) {
  const row: any = normalizeUserUpdates(updates)

  if (row.password) {
    row.password = await bcrypt.hash(row.password, 10)
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .update(row)
    .eq('id', id)
    .select('*')
    .single()

  if (error || !data) {
    throw error
  }
  return mapUserRow(data)
}

export async function updateUserByIdConditionally(id: string, condition: Record<string, unknown>, updates: Record<string, unknown>) {
  const row: any = normalizeUserUpdates(updates)
  if (row.password) {
    row.password = await bcrypt.hash(row.password, 10)
  }

  let query = supabaseAdmin.from('users').update(row).select('*')

  Object.entries(condition).forEach(([key, value]) => {
    if (value === null) {
      query = query.is(key, null)
    } else {
      query = query.eq(key, value)
    }
  })

  const { data, error } = await query.eq('id', id).single()
  if (error || !data) {
    return null
  }
  return mapUserRow(data)
}

export async function deleteGuildById(id: string) {
  const { error } = await supabaseAdmin
    .from('guilds')
    .delete()
    .eq('id', id)

  if (error) {
    throw error
  }
}

const MAX_IN_CLAUSE = 1000

async function queryUsersByIdChunks(ids: string[]) {
  if (!ids.length) return []
  const chunks: string[][] = []
  for (let i = 0; i < ids.length; i += MAX_IN_CLAUSE) {
    chunks.push(ids.slice(i, i + MAX_IN_CLAUSE))
  }

  const results: any[] = []
  for (const chunk of chunks) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, username, email, avatar_url, haomun_score, mastery_level, leetcode_username, codeforces_username')
      .in('id', chunk)

    if (data) {
      results.push(...data)
    }
    if (error) {
      console.error('Supabase chunked user fetch error:', error)
    }
  }

  return results.map((row) => ({
    ...mapUserRow(row),
    password: undefined,
  }))
}

export async function findUsersByIds(ids: string[]) {
  return queryUsersByIdChunks(ids)
}

export async function getUserFriends(userId: string) {
  const user = await findUserById(userId)
  if (!user || !user.friends?.length) return []
  return findUsersByIds(user.friends)
}

export async function getUserArchives(userId: string) {
  const user = await findUserById(userId)
  return user?.archives || []
}

export async function appendUserArchive(userId: string, archiveItem: { id: string; title: string; content: string; timestamp: string }) {
  const user = await findUserById(userId)
  if (!user) return null
  const archives = [...(user.archives || []), archiveItem].slice(-100)
  return updateUserById(userId, { archives })
}

export async function removeUserArchive(userId: string, archiveId: string) {
  const user = await findUserById(userId)
  if (!user) return null
  const archives = (user.archives || []).filter((item) => item.id !== archiveId)
  return updateUserById(userId, { archives })
}

export async function addFriendPair(userId: string, friendId: string) {
  const user = await findUserById(userId)
  const friend = await findUserById(friendId)
  if (!user || !friend) return null

  const userFriends = new Set(user.friends || [])
  const friendFriends = new Set(friend.friends || [])
  userFriends.add(friendId)
  friendFriends.add(userId)

  await updateUserById(userId, { friends: Array.from(userFriends) })
  await updateUserById(friendId, { friends: Array.from(friendFriends) })

  return getUserFriends(userId)
}

export async function removeFriendPair(userId: string, friendId: string) {
  const user = await findUserById(userId)
  const friend = await findUserById(friendId)
  if (!user || !friend) return null

  const userFriends = (user.friends || []).filter((id) => id !== friendId)
  const friendFriends = (friend.friends || []).filter((id) => id !== userId)

  await updateUserById(userId, { friends: userFriends })
  await updateUserById(friendId, { friends: friendFriends })

  return getUserFriends(userId)
}

async function getLeaderboardForFriendIds(friendIds: string[], cursor?: string) {
  if (!friendIds.length) return { data: [], nextCursor: null }

  const chunks: string[][] = []
  for (let i = 0; i < friendIds.length; i += MAX_IN_CLAUSE) {
    chunks.push(friendIds.slice(i, i + MAX_IN_CLAUSE))
  }

  const combinedResults: any[] = []
  for (const chunk of chunks) {
    let query = supabaseAdmin
      .from('users')
      .select('id, username, avatar_url, leetcode_username, codeforces_username, haomun_score, mastery_level')
      .in('id', chunk)
      .order('haomun_score', { ascending: false })
      .order('id', { ascending: false })
      .limit(21)

    if (cursor) {
      try {
        const decoded = JSON.parse(Buffer.from(cursor, 'base64').toString('ascii'))
        const cursorScore = decoded.s
        const cursorId = decoded.id
        if (cursorScore !== undefined && cursorId) {
          query = query.lt('haomun_score', cursorScore).or(`haomun_score.eq.${cursorScore},id.lt.${cursorId}`)
        }
      } catch (error) {
        // ignore invalid cursor
      }
    }

    const { data, error } = await query
    if (data) combinedResults.push(...data)
    if (error) console.error('Supabase friend leaderboard chunk error:', error)
  }

  combinedResults.sort((a, b) => {
    if (a.haomun_score !== b.haomun_score) return b.haomun_score - a.haomun_score
    return a.id.localeCompare(b.id)
  })

  const result = combinedResults.slice(0, 20)
  const hasNextPage = combinedResults.length > 20
  let nextCursor = null
  if (hasNextPage) {
    const last = result[result.length - 1]
    nextCursor = Buffer.from(JSON.stringify({ s: last.haomun_score, id: last.id })).toString('base64')
  }

  return { data: result.map((row) => ({ ...mapUserRow(row), password: undefined })), nextCursor }
}

export async function getLeaderboard(filter: 'all' | 'friends', currentUserId?: string, cursor?: string) {
  if (filter === 'friends' && currentUserId) {
    const user = await findUserById(currentUserId)
    const friendIds = user?.friends || []
    if (!friendIds.length) return { data: [], nextCursor: null }
    return getLeaderboardForFriendIds(friendIds, cursor)
  }

  let query = supabaseAdmin
    .from('users')
    .select('id, username, avatar_url, leetcode_username, codeforces_username, haomun_score, mastery_level')
    .order('haomun_score', { ascending: false })
    .order('id', { ascending: false })
    .limit(21)

  if (cursor) {
    try {
      const decoded = JSON.parse(Buffer.from(cursor, 'base64').toString('ascii'))
      const cursorScore = decoded.s
      const cursorId = decoded.id
      if (cursorScore !== undefined && cursorId) {
        query = query.lt('haomun_score', cursorScore).or(`haomun_score.eq.${cursorScore},id.lt.${cursorId}`)
      }
    } catch (error) {
      // ignore invalid cursor
    }
  }

  const { data, error } = await query
  if (error || !data) return { data: [], nextCursor: null }

  const hasNextPage = data.length > 20
  const result = hasNextPage ? data.slice(0, 20) : data
  let nextCursor = null
  if (hasNextPage) {
    const last = result[result.length - 1]
    nextCursor = Buffer.from(JSON.stringify({ s: last.haomun_score, id: last.id })).toString('base64')
  }

  return { data: result.map((row) => ({
    ...mapUserSummaryRow(row as SupabaseUserSummaryRow),
    password: undefined,
  })), nextCursor }
}

export async function searchUsers(query: string) {
  const safe = query.trim()
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, username, avatar_url, haomun_score, mastery_level, leetcode_username, codeforces_username')
    .or(
      `username.ilike.%${safe}%,leetcode_username.ilike.%${safe}%,codeforces_username.ilike.%${safe}%,codechef_username.ilike.%${safe}%,gfg_username.ilike.%${safe}%`
    )
    .limit(10)

  if (error || !data) return []
  return data.map((row) => ({ ...mapUserSummaryRow(row as unknown as SupabaseUserSummaryRow), password: undefined }))
}

export async function findGuildById(id: string) {
  const { data, error } = await supabaseAdmin
    .from('guilds')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return mapGuildRow(data)
}

export async function createGuild(guild: Partial<SupabaseGuildRow>) {
  const row: any = {
    name: guild.name,
    description: guild.description ?? null,
    emblem: guild.emblem ?? '🛡️',
    leader: guild.leader,
    members: guild.members ?? [],
    total_score: guild.total_score ?? 0,
    level: guild.level ?? 'Initiate',
  }
  const { data, error } = await supabaseAdmin
    .from('guilds')
    .insert(row)
    .select('*')
    .single()

  if (error) {
    throw error
  }
  return mapGuildRow(data)
}

export async function updateGuildById(id: string, updates: Partial<SupabaseGuildRow>) {
  const row: any = { ...updates }
  if (updates.total_score !== undefined) {
    row.total_score = updates.total_score
  }
  const { data, error } = await supabaseAdmin
    .from('guilds')
    .update(row)
    .eq('id', id)
    .select('*')
    .single()
  if (error) {
    throw error
  }
  return mapGuildRow(data)
}

export async function listGuilds() {
  const { data, error } = await supabaseAdmin
    .from('guilds')
    .select('id, name, description, emblem, leader, total_score, level, created_at')
    .order('total_score', { ascending: false })
    .limit(50)

  if (error || !data) return []
  return data.map(mapGuildRow)
}

export async function comparePasswordHash(candidatePassword: string, hash: string) {
  return bcrypt.compare(candidatePassword, hash)
}
