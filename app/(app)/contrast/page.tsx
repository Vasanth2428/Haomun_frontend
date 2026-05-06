'use client'

import ContrastHall from '@/components/contrast/contrast-hall'
import { useRouter } from 'next/navigation'
import { useForgeStore } from '@/lib/store/forgeStore'

export default function ContrastPage() {
  const router = useRouter()
  const setForgeData = useForgeStore(state => state.setForgeData)

  const navigateToForge = (data: any) => {
    setForgeData(data)
    router.push('/forge')
  }

  return <ContrastHall onForge={navigateToForge} />
}
