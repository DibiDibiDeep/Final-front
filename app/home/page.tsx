'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useSwipeable } from 'react-swipeable';
import MainContainer from "@/components/MainContainer";
import DetailedContainer from "@/components/DetailedContainer";
import EventCard from "./EventCard";
import Calendar from '../calendarapp/Calendar';
import MemoDetail from '../memo/MemoDetail';
import axios from 'axios';
import { Search, Plus } from 'lucide-react';
import { Button } from "@nextui-org/react";
import CreateMemoModal from '../modal/CreateModal';

// 이벤트 타입 정의
type Event = {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  location: string;
};

// 메모 타입 정의
type Memo = {
  memoId: number;
  userId: number;
  todayId: number | null;
  bookId: number | null;
  date: string; // DATETIME 형식의 문자열
  content: string;
};

const formatDateForBackend = (date: Date) => {
  // 로컬 시간대를 고려하여 YYYY-MM-DD 형식으로 변환
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDateTimeForDisplay = (date: Date): string => {
  return date.toISOString().slice(0, 19).replace('Z', '');
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
  const [isCreateMemoModalOpen, setIsCreateMemoModalOpen] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [babyPhoto, setBabyPhoto] = useState<string>("/img/mg-logoback.png");

  useEffect(() => {
    // localStorage에서 userId를 가져오기
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(parseInt(storedUserId, 10));
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchBabyPhoto(userId);
    }
  }, [userId]);

  // 사용자의 baby photo 가져오기
  const fetchBabyPhoto = async (userId: number) => {
    try {
      // 사용자 ID를 기반으로 베이비 ID 가져오기
      const userResponse = await axios.get(`${BACKEND_API_URL}/api/users/${userId}`);
      const babyId = userResponse.data.babyId; // 사용자 정보에 babyId가 포함되어 있다고 가정합니다.

      if (babyId) {
        const photoResponse = await axios.get(`${BACKEND_API_URL}/api/baby-photos/baby/${babyId}`);
        if (photoResponse.data && photoResponse.data.length > 0) {
          setBabyPhoto(photoResponse.data[0].photoUrl);
        }
      }
    } catch (error) {
      console.error('Failed to fetch baby photo:', error);
    }
  };

  // 메모 불러오기
  useEffect(() => {
    const fetchMemos = async () => {
      if (!userId) return;

      try {
        const formattedDate = formatDateForBackend(selectedDate);
        console.log('Fetching memos for date:', formattedDate, 'and userId:', userId);
        const response = await axios.get(`${BACKEND_API_URL}/api/memos/user/${userId}/date/${formattedDate}`, {
          headers: { 'Content-Type': 'application/json' }
        });
        console.log('Backend response for Memos:', response.data);
        if (Array.isArray(response.data)) {
          const fetchedMemos: Memo[] = response.data.map((memo: any) => ({
            memoId: memo.memoId,
            userId: memo.userId,
            todayId: memo.todayId,
            bookId: memo.bookId,
            date: memo.date,
            content: memo.content
          }));
          setMemos(fetchedMemos);
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
  }, [selectedDate, userId]);

  const fetchEvents = async () => {
    try {
      // 모든 이벤트를 가져오도록 변경
      const response = await axios.get(`${BACKEND_API_URL}/api/calendars/all`, {
        headers: { 'Content-Type': 'application/json' }
      });
      console.log('Backend response:', response.data);
      const fetchedEvents: Event[] = response.data.map((event: any) => ({
        id: event.calendarId,
        title: event.title,
        startTime: event.startTime,
        endTime: event.endTime,
        location: event.location
      }));
      setEvents(fetchedEvents);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [userId]); // selectedDate 의존성 제거

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
  const handleCreateMemo = async (content: string) => {
    if (!userId) {
      console.error('User ID is not available');
      return;
    }

    try {
      const response = await axios.post(`${BACKEND_API_URL}/api/memos`, {
        userId: userId,
        date: formatDateTimeForDisplay(new Date()),
        content: content,
        todayId: null,
        bookId: null
      });
      const newMemo: Memo = response.data;
      setMemos(prevMemos => [newMemo, ...prevMemos]);
      setIsCreateMemoModalOpen(false);
    } catch (error) {
      console.error('Failed to create memo:', error);
    }
  };

  const handleMemoDeleted = (deletedMemoId: number) => {
    setMemos(prevMemos => prevMemos.filter(memo => memo.memoId !== deletedMemoId));
  };

  const handleMemoUpdated = (updatedMemo: Memo) => {
    setMemos(prevMemos => prevMemos.map(memo =>
      memo.memoId === updatedMemo.memoId ? updatedMemo : memo
    ));
  };

  // 선택된 날짜에 해당하는 메모 필터링
  const filteredMemos = memos.filter(memo => {
    const memoDate = new Date(memo.date);
    const selectedDateStart = new Date(selectedDate);
    selectedDateStart.setHours(0, 0, 0, 0);
    const selectedDateEnd = new Date(selectedDate);
    selectedDateEnd.setHours(23, 59, 59, 999);

    const isSameDate = memoDate >= selectedDateStart && memoDate <= selectedDateEnd;

    const matchesSearch = memo.content.toLowerCase().includes(searchTerm.toLowerCase());

    return isSameDate && (searchTerm === '' || matchesSearch);
  });

  // 이벤트 기간이 선택된 날짜와 겹치고 검색어가 있는 경우 검색어가 이벤트 제목이나 위치에 포함되는 이벤트 필터링
  const filteredEvents = events.filter(event => {
    const eventStart = new Date(event.startTime);
    const eventEnd = new Date(event.endTime);
    const selectedDateStart = new Date(selectedDate);
    selectedDateStart.setHours(0, 0, 0, 0);
    const selectedDateEnd = new Date(selectedDate);
    selectedDateEnd.setHours(23, 59, 59, 999);

    // 이벤트가 선택된 날짜와 겹치는지 확인
    const isOverlapping = (eventStart <= selectedDateEnd && eventEnd >= selectedDateStart);
    // Sun Sep 08 2024 22:49:00 GMT+0900 (대한민국 표준시) <= Mon Sep 09 2024 23:59:59 GMT+0900 (대한민국 표준시) &&
    // Tue Sep 10 2024 23:49:00 GMT+0900 (대한민국 표준시) >= Mon Sep 09 2024 00:00:00 GMT+0900 (대한민국 표준시) 

    return isOverlapping &&
      (searchTerm === '' ||
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const handleEventDeleted = () => {
    fetchEvents();
  };

  const topMargin = isExpanded ? 450 : 115;

  return (
    <div className="h-screen flex flex-col relative">
      <div className="fixed top-[37px] right-[23px] flex items-center space-x-[13px] z-30">
        <div className="w-[45px] h-[45px] rounded-full overflow-hidden">
          <Image
            src={babyPhoto}
            alt="Baby Photo"
            width={45}
            height={45}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex justify-center items-center">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-56 p-2 pr-10 rounded-full bg-white bg-opacity-50 focus:outline-none focus:ring-2 focus:ring-purple-300 shadow-md"
            />
            <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
          </div>
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
          {activeView === 'memo' && (
            <div className="mb-[20px] p-4 flex justify-center items-center">
              <button
                onClick={() => setIsCreateMemoModalOpen(true)}
                className="flex items-center justify-center w-10 h-7 rounded-full bg-purple-100 hover:bg-purple-200 transition-colors duration-200"
              >
                <Plus size={24} className="text-purple-600" />
              </button>
            </div>
          )}
          {activeView === 'todo' && (
            <>
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event) => (
                  <DetailedContainer key={event.id} className="mb-[33px]">
                    <EventCard
                      id={event.id}
                      title={event.title}
                      startTime={event.startTime}
                      endTime={event.endTime}
                      location={event.location}
                      onEventDeleted={handleEventDeleted}
                      selectedDate={selectedDate}
                    />
                  </DetailedContainer>
                ))
              ) : (
                <div className="flex justify-center items-center">
                  <p className='text-gray-500'>이 날짜에 해당하는 일정이 없습니다.</p>
                </div>
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
                      userId={memo.userId}
                      todayId={memo.todayId}
                      bookId={memo.bookId}
                      date={memo.date}
                      content={memo.content}
                      onMemoDeleted={handleMemoDeleted}
                      onMemoUpdated={handleMemoUpdated}
                    />
                  </DetailedContainer>
                ))
              ) : (
                <div className="flex justify-center items-center">
                  <p className='text-gray-500'>이 날짜에 해당하는 메모가 없습니다.</p>
                </div>
              )}
            </>
          )}
        </div>
      </MainContainer>
      <CreateMemoModal
        isOpen={isCreateMemoModalOpen}
        onClose={() => setIsCreateMemoModalOpen(false)}
        onCreateMemo={handleCreateMemo}
      />
    </div>
  );
}