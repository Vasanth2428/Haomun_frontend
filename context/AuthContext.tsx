'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getProfile } from '@/lib/api/client'
import { clearAuthCookie } from '@/lib/api/auth'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: any | null
  loading: boolean
  refreshUser: () => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const refreshUser = useCallback(async () => {
    setLoading(true)
    try {
      const response = await getProfile()
      if (response.success) {
        setUser(response.data.user || response.data)
      } else {
        setUser(null)
      }
    } catch (err) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const logout = useCallback(async () => {
    try {
      await fetch('/api/user/logout', { method: 'POST' })
    } catch { /* proceed with client cleanup regardless */ }
    clearAuthCookie()
    setUser(null)
    router.push('/login')
  }, [router])

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
