'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/navbar'
import EntranceAnimation from '@/components/layout/entrance-animation'

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [showEntrance, setShowEntrance] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined' && !localStorage.getItem('hasSeenIntro')) {
      setShowEntrance(true)
    }
  }, [])

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
