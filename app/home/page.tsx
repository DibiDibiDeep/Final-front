'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useSwipeable } from 'react-swipeable';
import MainContainer from "@/components/MainContainer";
import DetailedContainer from "@/components/DetailedContainer";
import EventCard from "./EventCard";
import DatePickerModal from '../modal/DatePickerModal';
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
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [topMargin, setTopMargin] = useState(450); // 초기 상단 여백을 450px로 설정
  const containerRef = useRef<HTMLDivElement>(null);
  const [calendarOpacity, setCalendarOpacity] = useState(1);

  const handleAddSchedule = () => {
    router.push('/editEvent');
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleDateSelect = (date: Date) => setSelectedDate(date);

  useEffect(() => {
    // topMargin이 변경될 때마다 Calendar의 opacity 조절
    const opacity = (topMargin - 115) / (450 - 115);
    setCalendarOpacity(opacity);
  }, [topMargin]);

  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      const { deltaY } = eventData;
      setTopMargin((prevMargin) => {
        const newMargin = prevMargin - deltaY;
        return Math.max(115, Math.min(450, newMargin)); // 최소 115px, 최대 450px
      });
    },
    trackMouse: true,
  });

  return (
    <div className="h-screen flex flex-col relative min-h-[812px] min-w-[375px]">
      <div className="fixed top-[37px] right-[23px] flex space-x-[13px] z-20">
        <button
          className="w-[45px] h-[45px] rounded-full overflow-hidden"
          onClick={handleAddSchedule}
        >
          <Image src="/img/button/addSchedule.png" alt='Add Schedule' width={45} height={45} className="w-full h-full object-cover" />
        </button>
        <button
          className="w-[45px] h-[45px] rounded-full overflow-hidden"
          onClick={handleOpenModal}
        >
          <Image src="/img/button/changeDate.png" alt='Change Date' width={45} height={45} className="w-full h-full object-cover" />
        </button>
      </div>
      <div
        className="fixed top-[110px] left-0 right-0 z-10 transition-opacity duration-300"
        style={{ opacity: calendarOpacity }}
      >
        <Calendar selectedDate={selectedDate} onDateSelect={handleDateSelect} />
      </div>
      <MainContainer
        topMargin={topMargin}
        {...handlers}
      >
        <div ref={containerRef} className="w-full max-w-[76vw]">
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
      <DatePickerModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onDateSelect={handleDateSelect}
      />
    </div>
  );
}