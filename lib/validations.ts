import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  displayName: z.string().min(2, 'Display name must be at least 2 characters').optional(),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const profileUpdateSchema = z.object({
  displayName: z.string().min(2).optional(),
  platforms: z.object({
    leetcode: z.string().optional(),
    codeforces: z.string().optional(),
    codechef: z.string().optional(),
    geeksforgeeks: z.string().optional(),
  }).optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
})

export const generateSummarySchema = z.object({
  username: z.string().min(1, 'Username is required'),
  platform: z.enum(['leetcode', 'codeforces', 'codechef']),
  timeWindow: z.union([z.string(), z.number()]).optional(),
})

export const pdfRequestSchema = z.object({
  summary: z.string().min(1, 'Summary is required'),
  insights: z.any(),
})

export const scrollForgeEditSchema = z.object({
  draft: z.string().min(1, 'Draft is required'),
  instruction: z.string().min(1, 'Instruction is required'),
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
