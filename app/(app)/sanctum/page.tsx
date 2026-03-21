'use client'

import Sanctum from '@/components/sanctum/sanctum'
import { useRouter } from 'next/navigation'

export default function SanctumPage() {
  const router = useRouter()

  const handleNavigate = (page: string) => {
    router.push(`/${page}`)
  }

  return <Sanctum onNavigate={handleNavigate} />
}
