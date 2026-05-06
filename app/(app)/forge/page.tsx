'use client'

import { useEffect } from 'react'
import ScrollForge from '@/components/forge/scroll-forge'
import { useForgeStore } from '@/lib/store/forgeStore'

export default function ForgePage() {
  const forgeData = useForgeStore(state => state.forgeData)
  const clearForgeData = useForgeStore(state => state.clearForgeData)

  useEffect(() => {
    return () => {
      clearForgeData()
    }
  }, [clearForgeData])

  return <ScrollForge data={forgeData} />
}
