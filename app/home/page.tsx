'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useSwipeable } from 'react-swipeable';
import axios from 'axios';
import { Search, MessageCircle, ChevronLeft} from 'lucide-react';

// 커스텀 컴포넌트 임포트
import MainContainer from "@/components/MainContainer";
import DetailedContainer from "@/components/DetailedContainer";
import EventCard from "./EventCard";
import Calendar from '../calendarapp/Calendar';
import MemoDetail from '../memo/MemoDetail';
import CreateMemoModal from '../modal/CreateModal';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";
import { Event, Memo, Baby } from '@/types/index';
import { useBottomContainer } from '@/contexts/BottomContainerContext';
import RecordModal from '../modal/RecordModal';


// 유틸리티 함수
const formatDateForBackend = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const formatDateTimeForDisplay = (date: Date): string => {
    return date.toISOString().slice(0, 19).replace('Z', '');
};

// 환경 변수
const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

export default function Home() {
    const [selectedDate, setSelectedDate] = useState(() => new Date());
    const [memos, setMemos] = useState<Memo[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [isExpanded, setIsExpanded] = useState(true);
    const [calendarVisible, setCalendarVisible] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [userId, setUserId] = useState<number | null>(null);
    const [babies, setBabies] = useState<Baby[]>([]);
    const [selectedBaby, setSelectedBaby] = useState<Baby | null>(null);
    const [babyPhoto, setBabyPhoto] = useState<string | undefined>("/img/mg-logoback.png");
    const [displayDate, setDisplayDate] = useState<Date>(() => new Date());

    const router = useRouter();

    const {
        activeView,
        setActiveView,
        isCreateMemoModalOpen,
        setIsCreateMemoModalOpen,
        isVoiceRecordModalOpen,
        setIsVoiceRecordModalOpen,
        handleAddSchedule: contextHandleAddSchedule,
        handleCreateMemo: contextHandleCreateMemo,
        handleVoiceRecord: contextHandleVoiceRecord,
        createMemo,
        saveVoiceRecord
    } = useBottomContainer();


    // 사용자 ID 로드
    useEffect(() => {
        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) {
            setUserId(parseInt(storedUserId, 10));
        }
    }, []);

    // 아이 정보 가져오기
    useEffect(() => {
        if (userId) {
            fetchBabiesInfo(userId);
        }
    }, [userId]);

    useEffect(() => {
        if (userId) {
            fetchEvents();
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

    // 메모 가져오기
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

    // 이벤트 가져오기
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
                location: event.location,
                target: event.target,
                information: event.information,
                notes: event.notes
            }));
            setEvents(fetchedEvents);
        } catch (error) {
            console.error('Failed to fetch events:', error);
        }
    };

    // 이벤트 핸들러
    const handleCheckNotice = () => {
        router.push('/notice');
    };

    const handleChatbotClick = () => {
        router.push('/chatbot');
    };

    const handleBackClick = () => {
        router.back();
    };

    const handleDateSelect = (date: Date) => setSelectedDate(date);

    const handleBabySelect = (baby: Baby) => {
        setSelectedBaby(baby);
        setBabyPhoto(baby.photoUrl || "/img/mg-logoback.png");
        localStorage.setItem('selectedBaby', JSON.stringify(baby));
    };

    const handleCreateMemo = async (content: string) => {
        if (!userId) {
            console.error('User ID is not available');
            return;
        }

        try {
            const newMemo = await createMemo(content);
            if (newMemo) {
                setMemos(prevMemos => [newMemo, ...prevMemos]);
            }
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

    const handleEventDeleted = () => {
        fetchEvents();
    };

    // 스와이프 핸들러
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

    // 필터링 로직
    const filteredMemos = memos.filter(memo => {
        const memoDate = new Date(memo.date);
        const selectedDateStart = new Date(selectedDate);
        selectedDateStart.setHours(0, 0, 0, 0);
        const selectedDateEnd = new Date(selectedDate);
        selectedDateEnd.setHours(23, 59, 59, 999);

        const isSameDate = memoDate >= selectedDateStart && memoDate <= selectedDateEnd;
        const matchesSearch = memo.content.toLowerCase().includes(searchTerm.toLowerCase());

        return (isSameDate || searchTerm !== '') && matchesSearch;
    });

    const filteredEvents = events.filter(event => {
        const eventStart = new Date(event.startTime);
        const eventEnd = new Date(event.endTime);
        const selectedDateStart = new Date(selectedDate);
        selectedDateStart.setHours(0, 0, 0, 0);
        const selectedDateEnd = new Date(selectedDate);
        selectedDateEnd.setHours(23, 59, 59, 999);

        const isOverlapping = (eventStart <= selectedDateEnd && eventEnd >= selectedDateStart);
        const matchesSearch =
        (event.title?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||  // Safely access title
        (event.location?.toLowerCase().includes(searchTerm.toLowerCase()) || '');  // Safely access location

    return (isOverlapping || searchTerm !== '') && matchesSearch;
    });

    // UI 관련 효과
    useEffect(() => {
        setCalendarVisible(isExpanded);
    }, [isExpanded]);

    const topMargin = isExpanded ? 450 : 115;

    // 렌더링
    return (
        <div className="h-screen flex flex-col items-center">
            <div className="w-full max-w-md mt-8 flex justify-between items-center px-4">
                <div className="w-[45px] h-[45px] rounded-full overflow-hidden">
                    {/* 뒤로 가기 버튼 */}
                    <button
                    onClick={handleBackClick}
                    className="absolute top-9 left-4 w-10 h-10 flex items-center justify-center"
                    >
                    <ChevronLeft size={24} color="#6B46C1" />
                    </button>
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
                            className="w-52 p-2 pr-10 rounded-full bg-white bg-opacity-50 focus:outline-none focus:ring-2 focus:ring-purple-300 shadow-md"
                        />
                        <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
                    </div>
                </div>
                <button
                    className="w-[45px] h-[45px] rounded-full overflow-hidden"
                    onClick={handleCheckNotice}
                >
                    <Image src="/img/button/notice.png" alt='공지 확인' width={45} height={45} className="w-full h-full object-cover" />
                </button>
            </div>
            {calendarVisible && (
                <div className="fixed top-[110px] left-0 right-0 z-20 transition-opacity duration-300">
                    <Calendar selectedDate={selectedDate} onDateSelect={handleDateSelect} />
                    <button
                        onClick={handleChatbotClick}
                        className="fixed bottom-100 right-4 w-12 h-12 rounded-full bg-purple-500 text-white flex items-center justify-center shadow-lg hover:bg-purple-600 transition-colors duration-200 z-40"
                    >
                        <MessageCircle size={24} />
            </button>
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
                            className={(activeView === 'home' || activeView === 'todo') ? 'font-bold' : ''}
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
                    {(activeView === 'home' || activeView === 'todo') && (
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
                                            target={event.target}
                                            information={event.information}
                                            notes={event.notes}
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
            <RecordModal
                isOpen={isVoiceRecordModalOpen}
                onClose={() => setIsVoiceRecordModalOpen(false)}
                onSave={saveVoiceRecord}
            />
        </div>
    );
}