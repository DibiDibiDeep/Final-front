'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useSwipeable } from 'react-swipeable';
import MainContainer from "@/components/MainContainer";
import DetailedContainer from "@/components/DetailedContainer";
import EventCard from "./EventCard";
import Calendar from '../calendar/Calendar';
import DiaryList from '../diary/DiaryList';
import MemoDetail from '../memo/MemoDetail';
import { Memo } from '@/types';
import { saveMemos, loadMemos } from '../utils/storage';
import axios from 'axios';

// 이벤트 타입 정의
type Event = {
  id: number;
  eventName: string;
  date: string;
  location: string;
};

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8080';

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const router = useRouter();
  const [calendarOpacity, setCalendarOpacity] = useState(1);
  const [activeView, setActiveView] = useState<'todo' | 'memo'>('todo');
  const [memos, setMemos] = useState<Memo[]>([]);
  const [selectedMemo, setSelectedMemo] = useState<Memo | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [calendarVisible, setCalendarVisible] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);

  // 메모 불러오기
  useEffect(() => {
    const storedMemos = loadMemos();
    if (storedMemos.length > 0) {
      setMemos(storedMemos);
    }
  }, []);

  // 메모 저장하기
  useEffect(() => {
    saveMemos(memos);
  }, [memos]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`${BACKEND_API_URL}/api/calendars`, {
          params: { date: selectedDate.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }).replace('. ', '-').slice(0, -1) },
          headers: { 'Content-Type': 'application/json' }
        });
        console.log('Backend response:', response.data);
        // 백엔드에서 받아온 데이터를 Event 타입에 맞게 변환
        const fetchedEvents: Event[] = response.data.map((event: any) => {
          // console.log('Event ID:', event.calendarId); // id 값을 로그로 출력
          return {
            id: event.calendarId, // 백엔드에서 받아온 calendar_id
            eventName: event.title,  // 백엔드에서 받아온 title
            date: event.date,
            location: event.location
          };
        });
        setEvents(fetchedEvents);
      } catch (error) {
        console.error('Failed to fetch events:', error);
        // 에러 처리 로직 추가 (예: 사용자에게 알림)
      }
    };

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
      id: Date.now(),
      date: new Date().toLocaleDateString('ko-KR'),
      content: '새 메모',
    };
    setMemos([newMemo, ...memos]);
    setSelectedMemo(newMemo);
  };

  // 메모 업데이트
  const updateMemo = (updatedMemo: Memo) => {
    setMemos(memos.map(memo => memo.id === updatedMemo.id ? updatedMemo : memo));
    setSelectedMemo(null);
  };

  // 메모 삭제
  const deleteMemo = (id: number) => {
    setMemos(memos.filter(memo => memo.id !== id));
    setSelectedMemo(null);
  };

  // 선택된 날짜에 해당하는 메모 필터링
  const filteredMemos = memos.filter(memo => {
    const memoDate = new Date(memo.date).toLocaleDateString('ko-KR');
    const selectedDateString = selectedDate.toLocaleDateString('ko-KR');
    return memoDate === selectedDateString;
  });

  const topMargin = isExpanded ? 450 : 115;

  return (
    <div className="h-screen flex flex-col relative">
      <div className="fixed top-[37px] right-[23px] flex space-x-[13px] z-30">
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
              Todo
            </button>
            <button
              onClick={() => setActiveView('memo')}
              className={activeView === 'memo' ? 'font-bold' : ''}
            >
              Memo
            </button>
            <button onClick={addMemo} className="mt-2 px-4 py-2 rounded">+</button>
          </div>
          <p className="text-2xl text-black mb-[33px]">
            {selectedDate.toLocaleDateString('default', { year: 'numeric', month: 'numeric', day: 'numeric' })}
          </p>
          {activeView === 'todo' && (
            <>
              {events.length > 0 ? (
                events.map((event) => (
                  <DetailedContainer key={event.id} className="mb-[33px]">
                    <EventCard
                      id={event.id}
                      eventName={event.eventName}
                      date={event.date}
                      location={event.location}
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
              {selectedMemo ? (
                <MemoDetail
                  memo={selectedMemo}
                  onUpdate={updateMemo}
                  onDelete={deleteMemo}
                  onClose={() => setSelectedMemo(null)}
                />
              ) : (
                <DiaryList memos={filteredMemos} onMemoSelect={setSelectedMemo} />
              )}

            </>
          )}
        </div>
      </MainContainer>
    </div>
  );
}
