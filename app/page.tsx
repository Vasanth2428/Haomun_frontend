'use client'

import { useState, useEffect } from 'react'
import EntranceAnimation from '@/components/entrance-animation'
import LandingPage from '@/components/landing-page'
import Navbar from '@/components/navbar'
import InsightPavilion from '@/components/insight-pavilion'
import ContrastHall from '@/components/contrast-hall'
import ArchiveChamber from '@/components/archive-chamber'
import ScrollForge from '@/components/scroll-forge'

type Page = 'pavilion' | 'contrast' | 'archive' | 'forge'

export default function Home() {
  const [showEntrance, setShowEntrance] = useState(true)
  const [showLanding, setShowLanding] = useState(false)
  const [currentPage, setCurrentPage] = useState<Page>('pavilion')
  const [forgeData, setForgeData] = useState<any>(null)

  useEffect(() => {
    const hasSeenIntro = localStorage.getItem('hasSeenIntro')
    if (hasSeenIntro === 'true') {
      setShowEntrance(false)
      setShowLanding(true)
    }
  }, [])

  const handleEntranceComplete = () => {
    localStorage.setItem('hasSeenIntro', 'true')
    setShowEntrance(false)
    setShowLanding(true)
  }

  const triggerIntro = () => {
    setShowEntrance(true)
    setShowLanding(false)
  }

  const handleEnterSite = () => {
    setShowLanding(false)
  }

  const navigateToForge = (data: any) => {
    setForgeData(data)
    setCurrentPage('forge')
  }

  if (showEntrance) {
    return <EntranceAnimation onComplete={handleEntranceComplete} />
  }

  if (showLanding) {
    return <LandingPage onEnter={handleEnterSite} />
  }

  return (
    <>
      <Navbar currentPage={currentPage} onNavigate={setCurrentPage} onTriggerIntro={triggerIntro} />
      <main>
        {currentPage === 'pavilion' && <InsightPavilion onForge={navigateToForge} />}
        {currentPage === 'contrast' && <ContrastHall onForge={navigateToForge} />}
        {currentPage === 'archive' && <ArchiveChamber onForge={navigateToForge} />}
        {currentPage === 'forge' && <ScrollForge data={forgeData} />}
      </main>
    </>
  )
}
