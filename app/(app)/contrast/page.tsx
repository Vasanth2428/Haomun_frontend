'use client'

import ContrastHall from '@/components/contrast/contrast-hall'
import { useRouter } from 'next/navigation'

export default function ContrastPage() {
  const router = useRouter()

  const navigateToForge = (data: any) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('forgeData', JSON.stringify(data))
    }
    router.push('/forge')
  }

  return <ContrastHall onForge={navigateToForge} />
}
