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
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";

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

interface Baby {
  userId: number;
  babyId: number;
  babyName: string;
  photoUrl?: string;
}

const formatDateForBackend = (date: Date) => {
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
  const [babyPhoto, setBabyPhoto] = useState<string | undefined>("/img/mg-logoback.png");
  const [babies, setBabies] = useState<Baby[]>([]);
  const [selectedBaby, setSelectedBaby] = useState<Baby | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(parseInt(storedUserId, 10));
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchBabiesInfo(userId);
    }
  }, [userId]);

  const fetchBabiesInfo = async (userId: number) => {
    try {
      const userResponse = await axios.get(`${BACKEND_API_URL}/api/baby/user/${userId}`);
      if (userResponse.data && Array.isArray(userResponse.data) && userResponse.data.length > 0) {
        const fetchedBabies: Baby[] = await Promise.all(userResponse.data.map(async (baby: any) => {
          const photoResponse = await axios.get(`${BACKEND_API_URL}/api/baby-photos/baby/${baby.babyId}`);
          return {
            userId: baby.userId,
            babyId: baby.babyId,
            babyName: baby.babyName,
            photoUrl: photoResponse.data[0]?.filePath || "/img/mg-logoback.png"
          };
        }));

        setBabies(fetchedBabies);

        // localStorage에서 저장된 선택된 아이 정보 확인
        const storedSelectedBaby = localStorage.getItem('selectedBaby');
        if (storedSelectedBaby) {
          const parsedSelectedBaby = JSON.parse(storedSelectedBaby);
          const foundBaby = fetchedBabies.find(baby => baby.babyId === parsedSelectedBaby.babyId);
          if (foundBaby) {
            setSelectedBaby(foundBaby);
            setBabyPhoto(foundBaby.photoUrl);
          } else {
            // 저장된 아이가 현재 목록에 없으면 첫 번째 아이 선택
            setSelectedBaby(fetchedBabies[0]);
            setBabyPhoto(fetchedBabies[0].photoUrl);
            localStorage.setItem('selectedBaby', JSON.stringify(fetchedBabies[0]));
          }
        } else {
          // 저장된 선택 정보가 없으면 첫 번째 아이 선택
          setSelectedBaby(fetchedBabies[0]);
          setBabyPhoto(fetchedBabies[0].photoUrl);
          localStorage.setItem('selectedBaby', JSON.stringify(fetchedBabies[0]));
        }
      } else {
        console.log("No baby information found for this user.");
        localStorage.removeItem('selectedBaby');
      }
    } catch (error) {
      console.error('Failed to fetch baby information:', error);
      localStorage.removeItem('selectedBaby');
    }
  };

  const handleBabySelect = (baby: Baby) => {
    setSelectedBaby(baby);
    setBabyPhoto(baby.photoUrl || "/img/mg-logoback.png");
    localStorage.setItem('selectedBaby', JSON.stringify(baby));
  };

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
    if (!userId) return;
    try {
      const response = await axios.get(`${BACKEND_API_URL}/api/calendars/user/${userId}`, {
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
  }, [userId]);

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

  const filteredEvents = events.filter(event => {
    const eventStart = new Date(event.startTime);
    const eventEnd = new Date(event.endTime);
    const selectedDateStart = new Date(selectedDate);
    selectedDateStart.setHours(0, 0, 0, 0);
    const selectedDateEnd = new Date(selectedDate);
    selectedDateEnd.setHours(23, 59, 59, 999);

    const isOverlapping = (eventStart <= selectedDateEnd && eventEnd >= selectedDateStart);

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
          <Dropdown>
            <DropdownTrigger>
              <button className="focus:outline-none focus:ring-0 w-[45px] h-[45px] rounded-full overflow-hidden flex items-center justify-center">
                <Image
                  src={selectedBaby?.photoUrl || "/img/mg-logoback.png"}
                  alt="Baby Photo"
                  width={45}
                  height={45}
                  className="rounded-full object-cover object-center"
                />
              </button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Baby Selection">
              {babies.map((baby) => (
                <DropdownItem key={baby.babyId} onPress={() => handleBabySelect(baby)}>
                  <div className="flex items-center">
                    <Image
                      src={baby.photoUrl || "/img/mg-logoback.png"}
                      alt={`Baby ${baby.babyId}`}
                      width={30}
                      height={30}
                      className="rounded-full mr-2 object-cover w-8 h-8"
                    />
                    <span className="text-gray-700">{baby.babyName}</span>
                  </div>
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
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