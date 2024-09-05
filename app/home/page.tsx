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

// 이벤트 타입 정의
type Event = {
  id: number;
  eventName: string;
  date: string;
  location: string;
};

// 더미 이벤트 데이터
const dummyEvents: Event[] = [
  {
    id: 1,
    eventName: "저녁 식사",
    date: "2024-09-05",
    location: "서울특별시 송파구 올림픽로 240"
  },
  {
    id: 2,
    eventName: "컨퍼런스",
    date: "2024-09-15",
    location: "서울특별시 강남구 디지털로 123"
  },
  {
    id: 3,
    eventName: "생일 파티",
    date: "2024-10-05",
    location: "서울특별시 용산구 이태원로 56"
  },
  // 추가 더미 이벤트
  ...Array(3).fill(null).map((_, index) => ({
    id: 4 + index,
    eventName: `이벤트 ${4 + index}`,
    date: "2024-11-01",
    location: "서울 여러 장소"
  }))
];

// 더미 메모 데이터
const dummyMemos: Memo[] = [
  {
    id: 1,
    date: '2024-09-01',
    content: `오늘은 동화 '스스로 할 수 있어요'를 읽어보았습니다. 동화를 들은 후 내가 할수 있는, 일이 무엇인지 이야기해 보았습니다. 그리고 연계 활동으로 활동지를 통해 제공된 그림들을 보고 내가 할 수 있는 일들을 직접 골라 언어로 표현해보고, 선택한 할 수 있는 일들에 대해 이야기해 보았습니다.`,
  },
  {
    id: 2,
    date: '2024-09-02',
    content: `공휴일은 잘 보내셨나요? 우리 수빈이가 차량에서 내려서 교실에 와서 조금 눈물을 글썽 거리는 모습이 있었지만 친구들에게 줄 간식을 수빈이가 나눠주자고 하였더니 금세 얼굴이 화사해졌답니다. 쥬쥬 스토리에서 당나귀 친구가 와서 거부감 없이 멋지게 당나귀를 타 보았어요. 처음에는 당나귀를 처음 봐서 그런지 잠깐 보고 있다가 동생반이 타고 있을 때 괜찮다고 무섭지 않다고 말해 주었더니 씩씩하게 당나귀를 탔답니다. 점심을 먹자고 하니 우리 수빈이 그때부터 울었어요. 점심시간은 처음 안 먹고 있다가 제가 한번 먹여 주고 스스로 먹어보자고 이야기를 해 주었어요. 밥을 떠서 먹여 준 후 수빈이가 먹기 싫다고 말해서 한 번 더 떠서 먹자고 이야기를 하니 수빈이가 국물을 밥에 찍어서 거의 다 먹었답니다. 반찬으로 나온 브로콜리와 메추리알은 안 먹는다고 하더라고요.`,
  },
  {
    id: 3,
    date: '2024-09-03',
    content: `꿀꿀이의 아이스크림가게 역할놀이를 했어요. 맡은 역할에 진지한 자세로 열심히 역을 말아하는 지수~~ 아이스크림 먹는 연기도 잘 합니다~~ 시원한 바람을 맞으며 놀이터에 나가 신나게 놀고요. 놀이터 가는 길에 나무 위에 앉은 잠자리를 잡으려는 데 잠자리가 달아나자 지수가 무서워서 잠자리가 도망갔다네요~~ 놀이터에서 붓으로 그림을 그리는데 지수 웃음소리만 들리네요. ^^`,
  },
];

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const router = useRouter();
  const [calendarOpacity, setCalendarOpacity] = useState(1);
  const [activeView, setActiveView] = useState<'todo' | 'memo'>('todo');
  const [memos, setMemos] = useState<Memo[]>(dummyMemos);
  const [selectedMemo, setSelectedMemo] = useState<Memo | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [calendarVisible, setCalendarVisible] = useState(true);

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

  const handleAddSchedule = () => {
    router.push('/editEvent');
  };

  const handleDateSelect = (date: Date) => setSelectedDate(date);

  useEffect(() => {
    setCalendarVisible(isExpanded);
  }, [isExpanded]);

  // 가끔 Todo랑 Memo 선택하는 버튼이 안 나오는 버그가 발생
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
    trackMouse: true, // 마우스 드래그 동작이 다른 인터페이스(예: 클릭 및 드래그로 요소를 이동하는 기능)와 충돌할 가능성이 있을 때 제거 필요
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

  // 선택된 날짜에 해당하는 이벤트 필터링
  const filteredEvents = dummyEvents.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate.toDateString() === selectedDate.toDateString();
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
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event) => (
                  <DetailedContainer key={event.id} className="mb-[33px]">
                    <EventCard
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
              <button onClick={addMemo} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">메모 추가</button>
            </>
          )}
        </div>
      </MainContainer>
    </div>
  );
}