'use client'

import React, { useState, useEffect } from 'react';
import { Search, MoreVertical } from 'lucide-react';
import { Memo } from '@/types';

interface DiaryListProps {
  memos: Memo[];
  onMemoSelect: (memo: Memo) => void;
}

const DiaryList: React.FC<DiaryListProps> = ({ memos, onMemoSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMemos, setFilteredMemos] = useState<Memo[]>([]);

  useEffect(() => {
    // 검색어에 따라 메모를 필터링합니다.
    const result = memos.filter(memo =>
      memo.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMemos(result);
  }, [memos, searchTerm]);

  return (
    <div>
      <header className="p-4">
        <div className="relative bottom-5">
          <input
            type="text"
            placeholder="검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 pr-10 rounded-full bg-white bg-opacity-50 focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
          <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
        </div>
      </header>
      {filteredMemos.map((memo) => (
          <div key={memo.id} className="bg-white bg-opacity-50 rounded-lg shadow p-4 mb-4" onClick={() => onMemoSelect(memo)}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">{memo.date}</p>
                <p className="text-gray-800">{memo.content.substring(0, 50)}...</p>
              </div>
              <button className="text-gray-400">
                <MoreVertical size={16} />
              </button>
            </div>
          </div>
        ))}
    </div>
  );
};

export default DiaryList;