'use client';
import { useState } from 'react'
import Main from './home/page'
import Loading from '../components/Loading'

export default function Home() {
  const [showMain, setShowMain] = useState(false)

  const handleStartClick = () => {
    setShowMain(true)
  }

  return (
    <main>
      {showMain ? <Main /> : <Loading onStartClick={handleStartClick} />}
    </main>
  )
}