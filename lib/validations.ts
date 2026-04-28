import { z } from 'zod'
import { PLATFORMS } from './constants'

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
  email: z.string().email().optional(),
  bio: z.string().max(500).optional().or(z.literal('')),
  platforms: z.object({
    [PLATFORMS.LEETCODE]: z.string().max(100).optional().or(z.literal('')),
    [PLATFORMS.CODEFORCES]: z.string().max(100).optional().or(z.literal('')),
    [PLATFORMS.CODECHEF]: z.string().max(100).optional().or(z.literal('')),
    [PLATFORMS.GFG]: z.string().max(100).optional().or(z.literal('')),
  }).optional(),
  avatarUrl: z.string().url().max(500).optional().or(z.literal('')),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).optional(),
})

export const generateSummarySchema = z.object({
  username: z.string().min(1, 'Username is required').max(100),
  platform: z.enum([PLATFORMS.LEETCODE, PLATFORMS.CODEFORCES, PLATFORMS.CODECHEF, PLATFORMS.GFG]),
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
    platform: z.enum([PLATFORMS.LEETCODE, PLATFORMS.CODEFORCES, PLATFORMS.CODECHEF, PLATFORMS.GFG])
  })).min(1).max(5)
})
