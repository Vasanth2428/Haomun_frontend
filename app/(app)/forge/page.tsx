'use client'

import { useState, useEffect } from 'react'
import ScrollForge from '@/components/forge/scroll-forge'

export default function ForgePage() {
  const [forgeData, setForgeData] = useState<any>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('forgeData')
      if (stored) {
        try {
          setForgeData(JSON.parse(stored))
        } catch {
          setForgeData(null)
        }
        // Clean up after reading
        sessionStorage.removeItem('forgeData')
      }
    }
  }, [])

  return <ScrollForge data={forgeData} />
}
