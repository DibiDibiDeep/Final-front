'use client';

import React, { useState, useEffect } from 'react';
import DiaryList from '../diary/DiaryList';
import MemoDetail from './MemoDetail';
import { Memo } from '@/types';
import { saveMemos, loadMemos } from '../utils/storage';
import { useRouter } from 'next/navigation';
import DatePickerModal from '../modal/DatePickerModal';
import MainContainer from '@/components/MainContainer';

const MemoApp: React.FC = () => {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [selectedMemo, setSelectedMemo] = useState<Memo | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const storedMemos = loadMemos();
    if (storedMemos.length === 0) {
      // 저장된 메모가 없으면 더미 데이터로 초기화
      const dummyMemos: Memo[] = [
        {
          id: 1,
          date: '2024-09-01',
          content: '첫 번째 더미 메모입니다.',
        },
        {
          id: 2,
          date: '2024-09-02',
          content: '두 번째 더미 메모입니다.',
        },
        {
          id: 3,
          date: '2024-09-03',
          content: '세 번째 더미 메모입니다.',
        },
      ];
      setMemos(dummyMemos);
      saveMemos(dummyMemos);
    } else {
      setMemos(storedMemos);
    }
  }, []);

  useEffect(() => {
    saveMemos(memos);
  }, [memos]);

  const handleOpenCamera = () => {
    router.push('/camera');
  };

  const handleAddSchedule = () => {
    router.push('/editEvent');
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleDateSelect = (date: Date) => setSelectedDate(date);

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
    setMemos(memos.map((memo) => (memo.id === updatedMemo.id ? updatedMemo : memo)));
    setSelectedMemo(null);
  };

  const deleteMemo = (id: number) => {
    setMemos(memos.filter((memo) => memo.id !== id));
    setSelectedMemo(null);
  };

  return (
    <div className="h-screen flex flex-col">
      <MainContainer>
        <div className="w-full max-w-[76vw] h-full overflow-y-auto pb-[120px]">
          <p className="text-4xl text-black mb-[33px]">
            {selectedDate.toLocaleDateString('default', { year: 'numeric', month: 'numeric', day: 'numeric' })}
          </p>
          {selectedMemo ? (
            <MemoDetail
              memo={selectedMemo}
              onUpdate={updateMemo}
              onDelete={deleteMemo}
              onClose={() => setSelectedMemo(null)}
            />
          ) : (
            <DiaryList memos={memos} onMemoSelect={setSelectedMemo} />
          )}
        </div>
      </MainContainer>
      <DatePickerModal isOpen={isModalOpen} onClose={handleCloseModal} onDateSelect={handleDateSelect} />
    </div>
  );
};

export default MemoApp;
