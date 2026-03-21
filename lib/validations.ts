import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email('Invalid email address').trim(),
  password: z.string().min(6, 'Password must be at least 6 characters').trim(),
  username: z.string().min(2, 'Username must be at least 2 characters').trim().optional(),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').trim(),
  password: z.string().min(1, 'Password is required').trim(),
})

export const profileUpdateSchema = z.object({
  username: z.string().min(2).max(50).optional(),
  platforms: z.object({
    leetcode: z.string().max(100).optional(),
    codeforces: z.string().max(100).optional(),
    codechef: z.string().max(100).optional(),
    geeksforgeeks: z.string().max(100).optional(),
  }).optional(),
  avatarUrl: z.string().url().max(500).optional().or(z.literal('')),
})

export const generateSummarySchema = z.object({
  username: z.string().min(1, 'Username is required').max(100),
  platform: z.enum(['leetcode', 'codeforces', 'codechef']),
  timeWindow: z.union([z.string(), z.number()]).optional(),
})

export const pdfRequestSchema = z.object({
  summary: z.string().min(1, 'Summary is required').max(20000),
  insights: z.any(),
})

export const scrollForgeEditSchema = z.object({
  draft: z.string().min(1, 'Draft is required').max(20000),
  instruction: z.string().min(1, 'Instruction is required').max(1000),
})

export const friendSchema = z.object({
  friendId: z.string().min(1, 'Friend ID is required'),
})

export const compareRequestSchema = z.object({
  users: z.array(z.object({
    username: z.string().min(1),
    platform: z.enum(['leetcode', 'codeforces', 'codechef', 'geeksforgeeks'])
  })).min(1).max(5)
})
