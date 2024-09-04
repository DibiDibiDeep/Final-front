'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useSwipeable } from 'react-swipeable';
import MainContainer from "@/components/MainContainer";
import DetailedContainer from "@/components/DetailedContainer";
import EventCard from "./EventCard";
import Calendar from '../calendar/Calendar';

const dummyEvents = [
  {
    id: 1,
    eventName: "Dinner",
    date: "2024.08.30",
    location: "240 Olympic-ro, Songpa-gu, Seoul"
  },
  {
    id: 2,
    eventName: "Conference",
    date: "2024.09.15",
    location: "123 Digital-ro, Gangnam-gu, Seoul"
  },
  {
    id: 3,
    eventName: "Birthday Party",
    date: "2024.10.05",
    location: "56 Itaewon-ro, Yongsan-gu, Seoul"
  },
  // Add more dummy events to ensure scrolling is necessary
  ...Array(3).fill(null).map((_, index) => ({
    id: 4 + index,
    eventName: `Event ${4 + index}`,
    date: "2024.11.01",
    location: "Various locations in Seoul"
  }))
];

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(true);
  const [calendarVisible, setCalendarVisible] = useState(true);

  const handleAddSchedule = () => {
    router.push('/editEvent');
  };

  const handleDateSelect = (date: Date) => setSelectedDate(date);

  useEffect(() => {
    setCalendarVisible(isExpanded);
  }, [isExpanded]);

  const handlers = useSwipeable({
    onSwipedUp: () => {
      if (isExpanded) {
        setIsExpanded(false);
      }
    },
    onSwipedDown: () => {
      if (!isExpanded) {
        setIsExpanded(true);
      }
    },
    trackMouse: true,
    delta: 150, // 스와이프를 감지하기 위한 최소 거리
    preventScrollOnSwipe: isExpanded, // 스와이프 중 스크롤 방지
  });

  const topMargin = isExpanded ? 450 : 115;

  return (
    <div className="h-screen flex flex-col relative">
      <div className="fixed top-[37px] right-[23px] flex space-x-[13px] z-30">
        <button
          className="w-[45px] h-[45px] rounded-full overflow-hidden"
          onClick={handleAddSchedule}
        >
          <Image src="/img/button/addSchedule.png" alt='Add Schedule' width={45} height={45} className="w-full h-full object-cover" />
        </button>
      </div>
      {calendarVisible && (
        <div className="fixed top-[110px] left-0 right-0 z-20 transition-opacity duration-300">
          <Calendar selectedDate={selectedDate} onDateSelect={handleDateSelect} />
        </div>
      )}
      <MainContainer
        className='pb-6'
        topMargin={topMargin}
        {...(isExpanded ? handlers : {})}
      >
        <div className="w-full max-w-[76vw]">
          <p className="text-4xl text-black mb-[33px]">
            {selectedDate.toLocaleDateString('default', { year: 'numeric', month: 'numeric', day: 'numeric' })}
          </p>
          {dummyEvents.map((event) => (
            <DetailedContainer key={event.id} className="mb-[33px]">
              <EventCard
                eventName={event.eventName}
                date={event.date}
                location={event.location}
              />
            </DetailedContainer>
          ))}
        </div>
      </MainContainer>
    </div>
  );
}