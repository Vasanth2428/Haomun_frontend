'use client'

import InsightPavilion from '@/components/pavilion/insight-pavilion'
import { useRouter } from 'next/navigation'
import { useForgeStore } from '@/lib/store/forgeStore'

export default function PavilionPage() {
  const router = useRouter()
  const setForgeData = useForgeStore(state => state.setForgeData)

  const navigateToForge = (data: any) => {
    setForgeData(data)
    router.push('/forge')
  }

  return <InsightPavilion onForge={navigateToForge} />
}
