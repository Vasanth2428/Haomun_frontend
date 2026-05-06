'use client'

import ArchiveChamber from '@/components/archive/archive-chamber'
import { useRouter } from 'next/navigation'
import { useForgeStore } from '@/lib/store/forgeStore'

export default function ArchivePage() {
  const router = useRouter()
  const setForgeData = useForgeStore(state => state.setForgeData)

  const navigateToForge = (data: any) => {
    setForgeData(data)
    router.push('/forge')
  }

  return <ArchiveChamber onForge={navigateToForge} />
}
