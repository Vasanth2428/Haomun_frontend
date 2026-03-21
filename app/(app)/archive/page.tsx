'use client'

import ArchiveChamber from '@/components/archive/archive-chamber'
import { useRouter } from 'next/navigation'

export default function ArchivePage() {
  const router = useRouter()

  const navigateToForge = (data: any) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('forgeData', JSON.stringify(data))
    }
    router.push('/forge')
  }

  return <ArchiveChamber onForge={navigateToForge} />
}
