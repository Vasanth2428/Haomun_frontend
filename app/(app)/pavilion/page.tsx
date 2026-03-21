'use client'

import InsightPavilion from '@/components/pavilion/insight-pavilion'
import { useRouter } from 'next/navigation'

export default function PavilionPage() {
  const router = useRouter()

  const navigateToForge = (data: any) => {
    // Store forge data in sessionStorage for cross-page transfer
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('forgeData', JSON.stringify(data))
    }
    router.push('/forge')
  }

  return <InsightPavilion onForge={navigateToForge} />
}
