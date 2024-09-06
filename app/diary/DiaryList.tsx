'use client'

import React, { useState, useEffect } from 'react';
import { Search, MoreVertical } from 'lucide-react';


type Memo = {
  memoId: number;
  createdAt: string;
  content: string;
};

interface DiaryListProps {
  memos: Memo[];
  selectedDate: Date;  // 추가된 prop
  onMemoSelect: (memo: Memo) => void;
}

const DiaryList: React.FC<DiaryListProps> = ({ memos, selectedDate, onMemoSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMemos, setFilteredMemos] = useState<Memo[]>([]);

  useEffect(() => {
    // 검색어에 따라 메모를 필터링합니다.
    const result = memos.filter(memo => {
      const memoDate = new Date(memo.createdAt).toISOString().split('T')[0];
      const selectedDateString = selectedDate.toISOString().split('T')[0];
      return memoDate === selectedDateString &&
        memo.content.toLowerCase().includes(searchTerm.toLowerCase());
    });
    setFilteredMemos(result);
  }, [memos, searchTerm, selectedDate]);


  return (
    <div>
    {memos.length > 0 ? (
      memos.map(memo => (
        <div key={memo.memoId}>
          <p>{memo.content}</p>
        </div>
      ))
    ) : (
      <p className='text-gray-500'>이 날짜에 해당하는 메모가 없습니다.</p>
    )}
  </div>
  );
};

export default DiaryList;