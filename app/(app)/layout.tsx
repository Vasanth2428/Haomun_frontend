'use client'

import { useState } from 'react'
import Navbar from '@/components/layout/navbar'
import EntranceAnimation from '@/components/layout/entrance-animation'

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [showEntrance, setShowEntrance] = useState(() => {
    if (typeof window !== 'undefined') {
      return !localStorage.getItem('hasSeenIntro')
    }
    return false
  })

  const handleEntranceComplete = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hasSeenIntro', 'true')
    }
    setShowEntrance(false)
  }

  const triggerIntro = () => {
    setShowEntrance(true)
  }

  if (showEntrance) {
    return <EntranceAnimation onComplete={handleEntranceComplete} />
  }

  return (
    <>
      <Navbar onTriggerIntro={triggerIntro} />
      <main>
        {children}
      </main>
    </>
  )
}
