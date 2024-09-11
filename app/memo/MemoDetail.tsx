'use client';

import React, { useState } from 'react';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import DeleteModal from '../modal/DeleteModal';
import { useRouter } from 'next/navigation';

interface MemoDetailProps {
  memoId: number;
  date: string;
  content: string;
  userId: number;
  todayId: number | null;
  fairyTaleId: number | null;
}

const MemoDetail: React.FC<MemoDetailProps> = ({ 
  memoId, 
  date, 
  content, 
  userId, 
  todayId, 
  fairyTaleId 
}) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const router = useRouter();

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  }

  const handleEditClick = () => {
    router.push(`/editMemo/${memoId}`);
  }

  const handleCloseModal = () => {
    setIsDeleteModalOpen(false);
  }

  return (
    <div className="w-full px-4 py-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-700">{content}</span>
        <div className="flex items-center">
          <span className="text-xs text-gray-500 mr-2">
            {new Date(date).toLocaleString()} {/* Changed from toLocaleDateString to toLocaleString for more precise time */}
          </span>
          <Dropdown>
            <DropdownTrigger>
              <button>
                <EllipsisVerticalIcon className="h-6 w-6 text-gray-500" />
              </button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Static Actions"
              selectionMode='single'>
              <DropdownItem key="edit" className="text-gray-700" onPress={handleEditClick}>
                Edit
              </DropdownItem>
              <DropdownItem key="delete" className="text-danger" color="danger" onPress={handleDeleteClick}>
                Delete
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
      {/* Optionally display additional information */}
      <div className="text-xs text-gray-500 mt-1">
        {todayId && <span className="mr-2">Today ID: {todayId}</span>}
        {fairyTaleId && <span>Fairy Tale ID: {fairyTaleId}</span>}
      </div>
      <DeleteModal isOpen={isDeleteModalOpen} onClose={handleCloseModal} />
    </div>
  );
};

export default MemoDetail;