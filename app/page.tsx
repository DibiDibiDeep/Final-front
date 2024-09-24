'use client';
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Loading from '../components/Loading'

export default function Home() {
  const [showMain, setShowMain] = useState(false)
  const router = useRouter()

  const handleStartClick = () => {
    router.push('/login')
  }

  return (
    <main>
      <Loading onStartClick={handleStartClick} />
    </main>
  )
}