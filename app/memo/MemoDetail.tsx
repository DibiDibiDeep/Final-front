'use client'

import React, { useState } from 'react';
import { Memo } from '@/types';

interface MemoDetailProps {
  memo: Memo;
  onUpdate: (updatedMemo: Memo) => void;
  onDelete: (id: number) => void;
  onClose: () => void;
}

const MemoDetail: React.FC<MemoDetailProps> = ({ memo, onUpdate, onDelete, onClose }) => {
  const [editedContent, setEditedContent] = useState(memo.content);

  const handleSave = async () => {
    try {
      const response = await fetch('/api/memoUpdate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: memo.id,
          diary_id: 1,
          fairy_tale_id: null,
          user_id: 1,
          content: editedContent,
        }),
      });
      
      if (response.ok) {
        const updatedMemo = { ...memo, content: editedContent };
        onUpdate(updatedMemo);
      } else {
        console.error('Failed to save memo');
      }
    } catch (error) {
      console.error('Error saving memo:', error);
    }
  };

  return (
    <div className="h-full flex flex-col p-4">
      <header className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">{memo.date}</h2>
        <button onClick={onClose} className="text-gray-600">닫기</button>
      </header>
      <textarea
        value={editedContent}
        onChange={(e) => setEditedContent(e.target.value)}
        className="flex-1 w-full p-2 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-purple-300"
      />
      <div className="flex justify-end space-x-2 mt-4">
        <button onClick={() => onDelete(memo.id)} className="px-4 py-2 bg-red-500 text-white rounded">삭제</button>
        <button onClick={handleSave} className="px-4 py-2 bg-purple-600 text-white rounded">저장</button>
      </div>
    </div>
  );
};

export default MemoDetail;