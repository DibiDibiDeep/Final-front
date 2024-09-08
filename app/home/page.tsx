'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useSwipeable } from 'react-swipeable';
import MainContainer from "@/components/MainContainer";
import DetailedContainer from "@/components/DetailedContainer";
import EventCard from "./EventCard";
import Calendar from '../calendar/Calendar';
import MemoDetail from '../memo/MemoDetail';
import axios from 'axios';
import { Search } from 'lucide-react';

// 이벤트 타입 정의
type Event = {
  id: number;
  title: string;
  date: string;
  location: string;
};

type Memo = {
  memoId: number;
  createdAt: string;
  content: string;
}

const formatDate = (date: Date) => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}-${day}`;
};

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8080';

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const router = useRouter();
  const [activeView, setActiveView] = useState<'todo' | 'memo'>('todo');
  const [memos, setMemos] = useState<Memo[]>([]);
  const [selectedMemo, setSelectedMemo] = useState<Memo | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [calendarVisible, setCalendarVisible] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // 메모 불러오기
  useEffect(() => {
    const fetchMemos = async () => {
      try {
        const formattedDate = formatDate(selectedDate);
        console.log('Fetching memos for date:', formattedDate);
        const response = await axios.get(`${BACKEND_API_URL}/api/memos/date/${formattedDate}`, {
          headers: { 'Content-Type': 'application/json' }
        });
        console.log('Backend response for Memos:', response.data);
        if (Array.isArray(response.data)) {
          const fetchedMemos: Memo[] = response.data.map((memo: any) => ({
            memoId: memo.memoId,
            createdAt: memo.createdAt,
            content: memo.content
          }));
          setMemos(fetchedMemos);
          console.log('Fetched memos:', fetchedMemos);
        } else {
          console.error('Unexpected response format for memos:', response.data);
          setMemos([]);
        }
      } catch (error) {
        console.error('Failed to fetch memos:', error);
        setMemos([]);
      }
    };
    fetchMemos();
  }, [selectedDate]);


  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${BACKEND_API_URL}/api/calendars`, {
        params: { date: selectedDate.toISOString() }, // 백으로 보내는 date // 여기 수정 필요
        headers: { 'Content-Type': 'application/json' }
      });
      console.log('Backend response:', response.data);
      const fetchedEvents: Event[] = response.data.map((event: any) => ({
        id: event.calendarId,
        title: event.title,
        date: event.date,
        location: event.location
      }));
      setEvents(fetchedEvents); // 상태 업데이트
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [selectedDate]);

  const handleAddSchedule = () => {
    router.push('/addEvent');
  };

  const handleDateSelect = (date: Date) => setSelectedDate(date);

  useEffect(() => {
    setCalendarVisible(isExpanded);
  }, [isExpanded]);

  useEffect(() => {
    if (!activeView) {
      setActiveView('todo');
    }
  }, [activeView]);

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
    delta: 150,
    preventScrollOnSwipe: isExpanded,
  });

  // 메모 추가
  const addMemo = () => {
    const newMemo: Memo = {
      memoId: Date.now(),
      createdAt: new Date().toLocaleDateString('ko-KR'),
      content: '새 메모',
    };
    setMemos([newMemo, ...memos]);
    setSelectedMemo(newMemo);
  };

  // 선택된 날짜에 해당하는 메모 필터링
  const filteredMemos = memos.filter(memo => {
    const memoDate = new Date(memo.createdAt);
    const isSameDate =
      memoDate.getFullYear() === selectedDate.getFullYear() &&
      memoDate.getMonth() === selectedDate.getMonth() &&
      memoDate.getDate() === selectedDate.getDate();

    const matchesSearch = memo.content.toLowerCase().includes(searchTerm.toLowerCase());

    console.log(`Memo ${memo.memoId}: Date match: ${isSameDate}, Search match: ${matchesSearch}`);

    return isSameDate && (searchTerm === '' || matchesSearch);
  });

  console.log('Selected Date:', selectedDate);
  console.log('Filtered Memos:', filteredMemos);

  // 선택된 날짜에 해당하는 이벤트 필터링
  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEventDeleted = () => { // 5
    fetchEvents();
  };

  const topMargin = isExpanded ? 450 : 115;

  return (
    <div className="h-screen flex flex-col relative">
      <div className="fixed top-[37px] right-[23px] flex items-center space-x-[13px] z-30">
        <div className="relative">
          <input
            type="text"
            placeholder="검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[240px] p-2 pr-10 rounded-full bg-white bg-opacity-50 focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
          <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
        </div>
        <button
          className="w-[45px] h-[45px] rounded-full overflow-hidden"
          onClick={handleAddSchedule}
        >
          <Image src="/img/button/addSchedule.png" alt='일정 추가' width={45} height={45} className="w-full h-full object-cover" />
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
          <div className="text-4xl text-black mb-[15px] flex space-x-4">
            <button
              onClick={() => setActiveView('todo')}
              className={activeView === 'todo' ? 'font-bold' : ''}
            >
              일정
            </button>
            <button
              onClick={() => setActiveView('memo')}
              className={activeView === 'memo' ? 'font-bold' : ''}
            >
              메모
            </button>
          </div>
          <p className="text-2xl text-black mb-[33px]">
            {selectedDate.toLocaleDateString('default', { year: 'numeric', month: 'numeric', day: 'numeric' })}
          </p>
          {activeView === 'todo' && (
            <>
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event) => (
                  <DetailedContainer key={event.id} className="mb-[33px]">
                    <EventCard
                      id={event.id}
                      title={event.title}
                      date={event.date}
                      location={event.location}
                      onEventDeleted={handleEventDeleted}
                    />
                  </DetailedContainer>
                ))
              ) : (
                <p className='text-gray-500'>이 날짜에 해당하는 일정이 없습니다.</p>
              )}
            </>
          )}
          {activeView === 'memo' && (
            <>
              {console.log('Filtered Memos:', filteredMemos)}
              {filteredMemos.length > 0 ? (
                filteredMemos.map((memo) => (
                  <DetailedContainer key={memo.memoId} className="mb-[33px]">
                    <MemoDetail
                      memoId={memo.memoId}
                      createdAt={memo.createdAt}
                      content={memo.content}
                    />
                  </DetailedContainer>
                ))
              ) : (
                <p className='text-gray-500'>이 날짜에 해당하는 메모가 없습니다.</p>
              )}
            </>
          )}
        </div>
      </MainContainer>
    </div>
  );
}