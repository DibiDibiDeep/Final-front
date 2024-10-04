'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useSwipeable } from 'react-swipeable';
import axios from 'axios';
import { Search, MessageCircle, ChevronLeft } from 'lucide-react';

// 커스텀 컴포넌트 임포트
import MainContainer from "@/components/MainContainer";
import BottomContainer from '@/components/BottomContainer';
import DetailedContainer from "@/components/DetailedContainer";
import EventCard from "./EventCard";
import Calendar from '../calendarapp/Calendar';
import MemoDetail from '../memo/MemoDetail';
import CreateMemoModal from '../modal/CreateModal';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";
import { Event, Memo, Baby } from '@/types/index';
import { useBottomContainer } from '@/contexts/BottomContainerContext';
import { fetchWithAuth } from '@/utils/api';
import { useAuth, useBabySelection } from '@/hooks/useAuth';
import RecordModal from '../modal/RecordModal';


// 유틸리티 함수
const formatDateForBackend = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
    // const [userId, setUserId] = useState<number | null>(null);
    const [babies, setBabies] = useState<Baby[]>([]);
    const [selectedBaby, setSelectedBaby] = useState<Baby | null>(null);
    const [babyPhoto, setBabyPhoto] = useState<string | undefined>("/img/mg-logoback.png");
    const [displayDate, setDisplayDate] = useState<Date>(() => new Date());
    const { token, userId, error: authError } = useAuth();
    const { babyId } = useBabySelection();

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
        handleScanButtonClick
    } = useBottomContainer();


    // 아이 정보 가져오기
    useEffect(() => {
        if (!token) return;
        console.log('homepage token: ', token);
        console.log('homepage userId: ', userId);
        if (userId) {
            fetchBabiesInfo(userId).then(() => {
                console.log('Babies fetched and set');
            });
        }
    }, [token]);

    // selectedBaby가 변경될 때마다 fetchEvents 호출
    useEffect(() => {
        if (!token) return;
        if (userId) {
            fetchEvents();
        }
    }, [userId, token, selectedBaby]);

    const isTokenExpired = (token: string) => {
        const payload = JSON.parse(atob(token.split('.')[1])); // 토큰의 payload 부분을 디코딩
        const currentTime = Math.floor(Date.now() / 1000); // 현재 시간(초 단위)
        return payload.exp < currentTime; // 만료 시간이 현재 시간보다 과거인지 확인
    };

    const fetchBabiesInfo = async (userId: number) => {
        if (!token) return;
        if (isTokenExpired(token)) {
            console.log("토큰이 만료되었습니다.");
            // 토큰을 재발급하는 로직 추가
        } else {
            console.log("토큰이 유효합니다.");
        }

        console.log('Fetching babies info for user:', userId);
        try {
            const userResponse = await fetchWithAuth(`${BACKEND_API_URL}/api/baby/user/${userId}`, token, {
                method: 'GET',
            });
            console.log('User response:', userResponse);
            if (userResponse && Array.isArray(userResponse) && userResponse.length > 0) {
                const fetchedBabies: Baby[] = await Promise.all(userResponse.map(async (baby: any) => {
                    const photoResponse = await fetchWithAuth(`${BACKEND_API_URL}/api/baby-photos/baby/${baby.babyId}`, token, {
                        method: 'GET',
                    });
                    return {
                        userId: baby.userId,
                        babyId: baby.babyId,
                        babyName: baby.babyName,
                        photoUrl: photoResponse[0]?.filePath || "/img/mg-logoback.png"
                    };
                }));

                setBabies(fetchedBabies);

                // 여기 추가
                if (fetchedBabies.length > 0) {
                    setSelectedBaby(fetchedBabies[0]);
                    setBabyPhoto(fetchedBabies[0].photoUrl);
                    localStorage.setItem('selectedBaby', JSON.stringify(fetchedBabies[0]));
                    console.log('Baby information saved:', fetchedBabies[0]);
                }

                // localStorage에서 저장된 선택된 아이 정보 확인
                if (babyId) {
                    const foundBaby = fetchedBabies.find(baby => baby.babyId === babyId);
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
            if (error instanceof TypeError) {
                console.error('Network error:', error.message);
            } else if (error instanceof Response) {
                console.error('HTTP error:', error.status, error.statusText);
            }
        }
    };


    // 메모 가져오기
    useEffect(() => {
        const fetchMemos = async () => {
            if (!token || !userId || !selectedBaby) return;
            try {
                const formattedDate = formatDateForBackend(selectedDate);
                console.log('Fetching memos for date:', formattedDate, 'userId:', userId, 'babyId:', selectedBaby.babyId);
                const response = await fetchWithAuth(`${BACKEND_API_URL}/api/memos/user/${userId}/baby/${selectedBaby.babyId}`, token, {
                    method: 'GET',
                });
                console.log('Backend response for Memos:', response);
                if (Array.isArray(response)) {
                    const fetchedMemos: Memo[] = response.map((memo: any) => ({
                        memoId: memo.memoId,
                        userId: memo.userId,
                        babyId: selectedBaby.babyId,
                        todayId: memo.todayId,
                        bookId: memo.bookId,
                        date: memo.date,
                        content: memo.content
                    }));
                    setMemos(fetchedMemos);
                } else {
                    console.error('Unexpected response format for memos:', response);
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
        if (!token || !userId || !selectedBaby) return;

        try {
            const response = await fetchWithAuth(`${BACKEND_API_URL}/api/calendars/user/${userId}/baby/${selectedBaby.babyId}`, token, {
                method: 'GET',
            });
            console.log('Backend response:', response);
            const fetchedEvents: Event[] = response.map((event: any) => ({
                id: event.calendarId,
                babyId: selectedBaby.babyId,
                userId: userId,
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
    }

    // }, [selectedDate, userId, selectedBaby]);

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
        if (!userId || !selectedBaby) {
            console.error('User ID or Selected Baby is not available');
            return;
        }

        try {
            const response = await axios.post(`${BACKEND_API_URL}/api/memos`, {
                userId,
                babyId: selectedBaby.babyId,
                date: new Date().toISOString(),
                content: content,
                todayId: null,
                bookId: null
            });

            const newMemo: Memo = {
                memoId: response.data.memoId,
                userId: response.data.userId,
                babyId: selectedBaby.babyId,
                todayId: response.data.todayId,
                bookId: response.data.bookId,
                date: response.data.date,
                content: response.data.content
            };

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

    const saveVoiceRecord = (audioBlob: Blob) => {
        console.log('Audio recorded:', audioBlob);
        console.log('userId', userId, 'babyId', babyId);
        setIsVoiceRecordModalOpen(false);
        // 저장 로직 구현 필요
    };

    // UI 관련 효과
    useEffect(() => {
        setCalendarVisible(isExpanded);
    }, [isExpanded]);

    const topMargin = isExpanded ? 450 : 115;

    // 렌더링
    return (
        <div className="h-screen flex flex-col items-center">
            <div className="w-full max-w-md mt-8 flex justify-between items-center px-4 gap-4">
                <div className="w-[45px] h-[45px] rounded-full overflow-hidden">
                    <Dropdown>
                        <DropdownTrigger>
                            <button className="focus:outline-none focus:ring-0 w-[45px] h-[45px] rounded-full overflow-hidden flex items-center justify-center">
                                <Image
                                    src={selectedBaby?.photoUrl || "/img/mg-logoback.png"}
                                    alt="Baby Photo"
                                    width={45}
                                    height={45}
                                    className="rounded-full object-cover object-center w-[45px] h-[45px]"
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
                    <Image src="/img/button/notice.png" alt="공지 확인" width={45} height={45} className="w-full h-full object-cover" />
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
            <BottomContainer />

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