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

// 더미 메모 데이터
const dummyMemos: Memo[] = [
  {
    id: 1,
    date: '2024-09-01',
    content:  "오늘은 동화 ‘스스로 할 수 있어요’를    \n읽어보았습니다. 동화를 들은 후 내가 할수     \n있는,일이 무엇인지 이야기해 보았습니다.     \n그리고 연계 활동으로 활동지를 통해 제공된    \n그림들을 보고 내가 할 수 있는 일들을 직접    \n골라 언어로 표현해보고, 선택한 할 수 있는     \n일들에 대해 이야기해 보았습니다.",
  },
  {
    id: 2,
    date: '2024-09-02',
    content: "공휴일은 잘 보내셨나요?    \n우리 수빈이가 차량에서 내려서 교실에 와서    \n조금 눈물을 글썽 거리는 모습이 있었지만    \n친구들에게 줄 간식을 수빈이가 나눠주자고    \n하였더니 금세 얼굴이 화사해졌답니다.    \n쥬쥬 스토리에서 당나귀 친구가 와서    \n거부감 없이 멋지게 당나귀를 타 보았어요.    \n처음에는 당나귀를 처음 봐서 그런지    \n잠깐 보고 있다가 동생반이 타고 있을 때    \n괜찮다고 무섭지 않다고 말해 주었더니    \n씩씩하게 당나귀를 탔답니다.    \n점심을 먹자고 하니 우리 수빈이 그때부터    \n울었어요.    \n점심시간은 처음 안 먹고 있다가 제가 한번\n먹여 주고 스스로 먹어보자고 이야기를    \n해 주었어요.    \n밥을 떠서 먹여 준 후 수빈이가 먹기 싫다고     \n말해서 한 번 더 떠서 먹자고 이야기를 하니    \n수빈이가 국물을 밥에 찍어서 거의 다     \n먹었답니다    \n반찬으로 나온 브로콜리와 메추리알은    \n안 먹는다고 하더라고요.",
  },
  {
    id: 3,
    date: '2024-09-03',
    content: "꿀꿀이의 아이스크림가게 역할놀이를 했어요\n맡은 역할에 진지한 자세로 열심히 역을 말아하는 지수 ~~\n아이스크림 먹는 연기도 잘 합니다 ~~    \n시원한 바람을 맞으며 놀이터에 나가 신나게 놀고요    \n놀이터 가는 길에 나무 위에 앉은 잠자리를 잡으려는 데 잠자리가 달아나자    \n지수가 무서워서 잠자리가 도망갔다 네요 ~~    \n놀이터에서 붓으로 그림을 그리는데 지수 웃음소리만 들리네요. ^^",
  },
];

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [topMargin, setTopMargin] = useState(450);
  const [calendarOpacity, setCalendarOpacity] = useState(1);
  const [activeView, setActiveView] = useState<'todo' | 'memo'>('todo');
  const [memos, setMemos] = useState<Memo[]>(dummyMemos);
  const [selectedMemo, setSelectedMemo] = useState<Memo | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [calendarVisible, setCalendarVisible] = useState(true);

  // 메모 클릭시 변경 부분
  useEffect(() => {
    const storedMemos = loadMemos();
    if (storedMemos.length > 0) {
      setMemos(storedMemos);
    }
  }, []);

  useEffect(() => {
    saveMemos(memos);
  }, [memos]);
  
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

  // 메모 추가,수정,삭제 부분
  const addMemo = () => {
    const newMemo: Memo = {
      id: Date.now(),
      date: new Date().toLocaleDateString('ko-KR'),
      content: '새 메모',
    };
    setMemos([newMemo, ...memos]);
    setSelectedMemo(newMemo);
  };

  const updateMemo = (updatedMemo: Memo) => {
    setMemos(memos.map(memo => memo.id === updatedMemo.id ? updatedMemo : memo));
    setSelectedMemo(null);
  };

  const deleteMemo = (id: number) => {
    setMemos(memos.filter(memo => memo.id !== id));
    setSelectedMemo(null);
  };

  // 선택된 날짜에 맞는 메모 필터링
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
          <Image src="/img/button/addSchedule.png" alt='Add Schedule' width={45} height={45} className="w-full h-full object-cover" />
        </button>
        {/* <button
          className="w-[45px] h-[45px] rounded-full overflow-hidden"
          onClick={handleOpenModal}
        >
          <Image src="/img/button/changeDate.png" alt='Change Date' width={45} height={45} className="w-full h-full object-cover" />
        </button> */}
      </div>
      <div
        className="fixed top-[110px] left-0 right-0 z-20 transition-opacity duration-300"
        style={{ opacity: calendarOpacity }}
      >
        <Calendar selectedDate={selectedDate} onDateSelect={handleDateSelect} />
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
          <div className="text-4xl text-black mb-[33px] flex space-x-4">
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
          </div>
          <p className="text-2xl text-black mb-[33px]">
            {selectedDate.toLocaleDateString('default', { year: 'numeric', month: 'numeric', day: 'numeric' })}
          </p>
          {activeView === 'todo' && (
            <>
              {dummyEvents.map((event) => (
                <DetailedContainer key={event.id} className="mb-[33px]">
                  <EventCard
                    eventName={event.eventName}
                    date={event.date}
                    location={event.location}
                  />
                </DetailedContainer>
              ))}
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
              <button onClick={addMemo} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">Add Memo</button>
            </>
          )}
        </div>
      </MainContainer>
    </div>
  );
}