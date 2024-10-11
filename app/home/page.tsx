'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useSwipeable } from 'react-swipeable';
import { Search, MessageCircle } from 'lucide-react';
import Cookies from 'js-cookie';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";

// 커스텀 컴포넌트 및 훅 임포트
import MainContainer from "@/components/MainContainer";
import DetailedContainer from "@/components/DetailedContainer";
import Calendar from '@/app/calendarapp/Calendar';
import MemoDetail from '@/app/memo/MemoDetail';
import CreateMemoModal from '@/app/modal/CreateModal';
import RecordModal from '@/app/modal/RecordModal';
import EventCard from "./EventCard";
import { Event, Memo, Baby } from '@/types/index';
import { useBottomContainer } from '@/contexts/BottomContainerContext';
import { useAuth, useBabySelection } from '@/hooks/authHooks';
import { fetchWithAuth } from '@/utils/api';

// 환경 변수
const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

// 유틸리티 함수
const formatDateForBackend = (date: Date) => {
    return date.toISOString().split('T')[0];
};

export default function Home() {
    // 상태 관리
    const [selectedDate, setSelectedDate] = useState(() => new Date());
    const [memos, setMemos] = useState<Memo[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [isExpanded, setIsExpanded] = useState(true);
    const [calendarVisible, setCalendarVisible] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [babies, setBabies] = useState<Baby[]>([]);
    const [selectedBaby, setSelectedBaby] = useState<Baby | null>(null);
    const [babyPhoto, setBabyPhoto] = useState<string | undefined>("/img/mg-logoback.png");
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [displayDate, setDisplayDate] = useState<Date>(() => new Date());

    // 훅 사용
    const router = useRouter();
    const { token, userId } = useAuth();
    const { babyId } = useBabySelection();
    const {
        activeView,
        setActiveView,
        isCreateMemoModalOpen,
        setIsCreateMemoModalOpen,
        isVoiceRecordModalOpen,
        setIsVoiceRecordModalOpen
    } = useBottomContainer();

    // 키보드 높이 변화 감지
    useEffect(() => {
        const resizeHandler = () => {
            if (typeof window !== 'undefined' && window.visualViewport) {
                const keyboardHeight = window.innerHeight - window.visualViewport.height;
                setKeyboardHeight(keyboardHeight);
            }
        };

        if (typeof window !== 'undefined' && window.visualViewport) {
            window.visualViewport.addEventListener('resize', resizeHandler);
        }

        return () => {
            if (typeof window !== 'undefined' && window.visualViewport) {
                window.visualViewport.removeEventListener('resize', resizeHandler);
            }
        };
    }, []);

    // MainContainer의 스타일을 동적으로 조정
    const mainContainerStyle = {
        transform: `translateY(-${keyboardHeight}px)`,
        transition: 'transform 0.3s ease-out',
    };

    // API 호출 함수
    const fetchBabiesInfo = async (userId: number) => {
        try {
            const userResponse = await fetchWithAuth(`${BACKEND_API_URL}/api/baby/user/${userId}`, { method: 'GET' });
            if (userResponse && Array.isArray(userResponse) && userResponse.length > 0) {
                const fetchedBabies: Baby[] = await Promise.all(userResponse.map(async (baby: any) => {
                    const photoResponse = await fetchWithAuth(`${BACKEND_API_URL}/api/baby-photos/baby/${baby.babyId}`, { method: 'GET' });
                    return {
                        userId: baby.userId,
                        babyId: baby.babyId,
                        babyName: baby.babyName,
                        photoUrl: photoResponse[0]?.filePath || "/img/mg-logoback.png",
                        gender: baby.gender,
                        birth: baby.birth
                    };
                }));

                setBabies(fetchedBabies);

                // 저장된 선택 아이 정보 확인
                if (babyId) {
                    const foundBaby = fetchedBabies.find(baby => baby.babyId === babyId);
                    if (foundBaby) {
                        setSelectedBaby(foundBaby);
                        setBabyPhoto(foundBaby.photoUrl);
                    } else {
                        handleBabySelect(fetchedBabies[0]);
                    }
                } else {
                    handleBabySelect(fetchedBabies[0]);
                }
            }
        } catch (error) {
            // console.error('Failed to fetch baby information:', error);
        }
    };

    const fetchMemos = async () => {
        if (!userId || !selectedBaby) return;
        try {
            const formattedDate = formatDateForBackend(selectedDate);
            const response = await fetchWithAuth(`${BACKEND_API_URL}/api/memos/user/${userId}/baby/${selectedBaby.babyId}`, { method: 'GET' });
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
        } catch (error) {
            // console.error('Failed to fetch memos:', error);
        }
    };

    const fetchEvents = async () => {
        if (!userId || !selectedBaby) return;
        try {
            const response = await fetchWithAuth(`${BACKEND_API_URL}/api/calendars/user/${userId}/baby/${selectedBaby.babyId}`, { method: 'GET' });
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
            // console.error('Failed to fetch events:', error);
        }
    }

    // 이벤트 핸들러
    const handleBabySelection = (fetchedBabies: Baby[], storedBabyId: number | null) => {
        let selectedBaby: Baby;
        if (storedBabyId) {
            selectedBaby = fetchedBabies.find(baby => baby.babyId === storedBabyId) || fetchedBabies[0];
        } else {
            selectedBaby = fetchedBabies[0];
        }
        setSelectedBaby(selectedBaby);
        setBabyPhoto(selectedBaby.photoUrl);
        Cookies.set('selectedBaby', JSON.stringify(selectedBaby), { expires: 7, path: '/', sameSite: 'strict', secure: window.location.protocol === 'https:' });
    };

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        setDisplayDate(date);
        setSearchTerm('');
    };

    const handleBabySelect = (baby: Baby) => {
        setSelectedBaby(baby);
        setBabyPhoto(baby.photoUrl || "/img/mg-logoback.png");
        Cookies.set('selectedBaby', JSON.stringify({
            babyId: baby.babyId,
            babyName: baby.babyName,
            userId: baby.userId,
            gender: baby.gender,
            birth: baby.birth
        }), { expires: 7, path: '/', sameSite: 'strict', secure: window.location.protocol === 'https:' });
    };


    const handleCreateMemo = async (content: string) => {
        if (!userId || !selectedBaby) {
            // console.error('User ID or Selected Baby is not available');
            return;
        }

        const newMemoData: Omit<Memo, 'memoId'> = {
            userId: userId,
            babyId: selectedBaby.babyId,
            todayId: null,
            bookId: null,
            date: new Date().toISOString(),
            content: content
        };

        try {
            const response = await fetchWithAuth(`${BACKEND_API_URL}/api/memos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newMemoData)
            });

            if (response && typeof response.memoId === 'number') {
                await fetchMemos();
                setIsCreateMemoModalOpen(false);
            } else {
                // console.error('Invalid response from server when creating memo:', response);
            }
        } catch (error) {
            // console.error('Failed to create memo or fetch memos:', error);
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

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        if (term === '') {
            setDisplayDate(selectedDate);
        }
    };

    const handleSaveAudio = async (audioBlob: Blob, userId: number, babyId: number) => {
        try {
            const formData = new FormData();
            formData.append('file', audioBlob, 'recorded_audio.webm');
            formData.append('userId', String(userId));
            formData.append('babyId', String(babyId));

            const response = await fetchWithAuth(`${BACKEND_API_URL}/api/voice-memos`, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                // console.log('Audio successfully sent to the server');
                setIsVoiceRecordModalOpen(false);
            } else {
                // console.error('Failed to send audio');
            }
        } catch (error) {
            // console.error('Error sending audio:', error);
        }
    };

    // 스와이프 핸들러
    const handlers = useSwipeable({
        onSwipedUp: () => setIsExpanded(false),
        onSwipedDown: () => setIsExpanded(true),
        trackMouse: true,
        delta: 150,
        preventScrollOnSwipe: isExpanded,
    });

    // 필터링 로직
    const filteredMemos = memos.filter(memo => {
        const memoDate = new Date(memo.date);
        const selectedDateStart = new Date(selectedDate.setHours(0, 0, 0, 0));
        const selectedDateEnd = new Date(selectedDate.setHours(23, 59, 59, 999));
        const isSameDate = memoDate >= selectedDateStart && memoDate <= selectedDateEnd;
        const matchesSearch = memo.content.toLowerCase().includes(searchTerm.toLowerCase());
        return (isSameDate || searchTerm !== '') && matchesSearch;
    });

    const filteredEvents = events.filter(event => {
        const eventStart = new Date(event.startTime);
        const eventEnd = new Date(event.endTime);
        const selectedDateStart = new Date(selectedDate.setHours(0, 0, 0, 0));
        const selectedDateEnd = new Date(selectedDate.setHours(23, 59, 59, 999));
        const isOverlapping = (eventStart <= selectedDateEnd && eventEnd >= selectedDateStart);
        const matchesSearch =
            (event.title?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
            (event.location?.toLowerCase().includes(searchTerm.toLowerCase()) || '');
        return (isOverlapping || searchTerm !== '') && matchesSearch;
    });

    // 부수 효과
    useEffect(() => {
        if (token && userId) {
            fetchBabiesInfo(userId);
        }
    }, [token, userId, babyId]);

    useEffect(() => {
        if (userId && selectedBaby) {
            fetchEvents();
            fetchMemos();
        }
    }, [userId, selectedBaby]);

    useEffect(() => {
        setCalendarVisible(isExpanded);
    }, [isExpanded]);

    useEffect(() => {
        if (searchTerm) {
            const allDates = [
                ...filteredEvents.map(event => new Date(event.startTime)),
                ...filteredMemos.map(memo => new Date(memo.date))
            ];
            if (allDates.length > 0) {
                const earliestDate = new Date(Math.min(...allDates.map(date => date.getTime())));
                setDisplayDate(earliestDate);
            } else {
                setDisplayDate(selectedDate);
            }
        } else {
            setDisplayDate(selectedDate);
        }
    }, [searchTerm, filteredEvents, filteredMemos, selectedDate]);

    // 렌더링
    return (
        <div className="h-screen flex flex-col items-center">
            {/* 헤더 부분 */}
            <div className="w-full max-w-md mt-8 flex justify-between items-center px-4 gap-4">
                {/* 아기 선택 드롭다운 */}
                <Dropdown>
                    <DropdownTrigger>
                        <button className="w-[45px] h-[45px] rounded-full overflow-hidden flex items-center justify-center focus:outline-none focus:ring-0">
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

                {/* 검색 입력 필드 */}
                <div className="flex justify-center items-center">
                    <div className="relative w-full max-w-md">
                        <input
                            type="text"
                            placeholder="검색"
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-52 p-2 pr-10 rounded-full bg-white bg-opacity-50 focus:outline-none focus:ring-2 focus:ring-purple-300 shadow-md"
                        />
                        <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
                    </div>
                </div>

                {/* 공지 확인 버튼 */}
                <button
                    className="w-[45px] h-[45px] rounded-full overflow-hidden"
                    onClick={() => router.push('/notice')}
                >
                    <Image src="/img/button/notice.png" alt="공지 확인" width={45} height={45} className="w-full h-full object-cover" />
                </button>
            </div>

            {/* 캘린더 컴포넌트 */}
            {calendarVisible && (
                <div className="fixed top-[110px] left-0 right-0 z-20 transition-opacity duration-300">
                    <Calendar
                        selectedDate={selectedDate}
                        onDateSelect={handleDateSelect}
                        events={events}
                    />
                    <button
                        onClick={() => router.push('/chatbot')}
                        className="fixed bottom-100 right-4 w-12 h-12 rounded-full bg-purple-500 text-white flex items-center justify-center shadow-lg hover:bg-purple-600 transition-colors duration-200 z-40"
                    >
                        <MessageCircle size={24} />
                    </button>
                </div>
            )}

            {/* 메인 컨테이너 */}
            <MainContainer
                className='pb-6'
                topMargin={isExpanded ? 450 : 115}
                style={mainContainerStyle}
                {...(isExpanded ? handlers : {})}
            >
                <div className="w-full max-w-[76vw]">
                    {/* 네비게이션 버튼 */}
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

                    {/* 날짜 표시 */}
                    <p className="text-2xl text-black mb-[33px]">
                        {displayDate.toLocaleDateString('default', { year: 'numeric', month: 'numeric', day: 'numeric' })}
                    </p>

                    {/* 일정 목록 */}
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

                    {/* 메모 목록 */}
                    {activeView === 'memo' && (
                        <>
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

            {/* 모달 컴포넌트 */}
            <CreateMemoModal
                isOpen={isCreateMemoModalOpen}
                onClose={() => setIsCreateMemoModalOpen(false)}
                onCreateMemo={handleCreateMemo}
            />
            <RecordModal
                isOpen={isVoiceRecordModalOpen}
                onClose={() => setIsVoiceRecordModalOpen(false)}
                onSave={(audioBlob: Blob) => handleSaveAudio(audioBlob, userId!, babyId!)}
                userId={userId!}
                babyId={babyId!}
            />

        </div>
    );
}