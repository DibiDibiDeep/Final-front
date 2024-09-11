'use client'

import React, { useState } from 'react'
import Calendar from './Calendar'

export default function Scheduler() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Scheduler</h1>
      <Calendar selectedDate={selectedDate} onDateSelect={handleDateSelect} />
    </div>
  )
}