'use client';

import React, { useState, useEffect } from 'react';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, useDisclosure, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Textarea } from "@nextui-org/react";
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import DeleteModal from '../modal/DeleteModal';
import { useAuth } from '@/hooks/authHooks';
import { fetchWithAuth } from '@/utils/api';
import { useBottomContainer } from '@/contexts/BottomContainerContext';
import { Memo } from '@/types/index';

interface MemoDetailProps {
  memoId: number;
  userId: number;
  todayId: number | null;
  bookId: number | null;
  date: string;
  content: string;
  onMemoDeleted: (memoId: number) => void;
  onMemoUpdated: (updatedMemo: Memo) => void;
}

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

const formatDateTimeForDisplay = (dateString: string): string => {
  const date = new Date(dateString);
  const kstDate = new Date(date.getTime() + (9 * 60 * 60 * 1000)); // KST is UTC+9
  return kstDate.toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

const MemoDetail: React.FC<MemoDetailProps> = ({
  memoId,
  userId,
  todayId,
  bookId,
  date,
  content,
  onMemoDeleted,
  onMemoUpdated
}) => {
  // State and modal management
  const { isOpen: isDeleteModalOpen, onOpen: onOpenDeleteModal, onClose: onCloseDeleteModal } = useDisclosure();
  const { isOpen: isEditModalOpen, onOpen: onOpenEditModal, onClose: onCloseEditModal } = useDisclosure();
  const [editedContent, setEditedContent] = useState(content);
  const { token, error } = useAuth();

  const { setActiveView } = useBottomContainer();

  useEffect(() => {
    if (error) {
      // console.error('Auth error:', error);
    }
  }, [error]);

  // Memo deletion handler
  const handleDelete = async () => {
    if (!token) {
      // console.error('No authentication token available');
      return;
    }

    try {
      await fetchWithAuth(`${BACKEND_API_URL}/api/memos/${memoId}`, {
        method: 'DELETE'
      });
      onMemoDeleted(memoId);
      onCloseDeleteModal();
    } catch (error) {
      // console.error('Failed to delete memo:', error);
    }

    // setActiveView('memo'); 
    window.location.reload();
  };


  // Memo edit handler
  const handleEdit = async () => {
    if (!token) {
      // console.error('No authentication token available');
      return;
    }

    try {
      const updatedMemoData = {
        userId: userId,
        todayId: todayId,
        bookId: bookId,
        date: new Date().toISOString(),
        content: editedContent
      };

      const updatedMemo: Memo = await fetchWithAuth(`${BACKEND_API_URL}/api/memos/${memoId}`, {
        method: 'PUT',
        body: updatedMemoData
      });

      onMemoUpdated(updatedMemo);
      onCloseEditModal();
    } catch (error) {
      // console.error('Failed to update memo:', error);
      // TODO: Display error message to user
    }
  };

  return (
    <div className="w-full px-4 py-2">
      {/* Memo content and options menu */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-700">{content}</span>
        <div className="flex items-center">
          <span className="text-xs text-gray-500 mr-2">
            {formatDateTimeForDisplay(date)}
          </span>
          <Dropdown>
            <DropdownTrigger>
              <button className="focus:outline-none focus:ring-0">
                <EllipsisVerticalIcon className="h-6 w-6 text-gray-500" />
              </button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Static Actions">
              <DropdownItem key="edit" className="text-gray-700" onPress={onOpenEditModal}>
                수정
              </DropdownItem>
              <DropdownItem key="delete" className="text-danger" color="danger" onPress={onOpenDeleteModal}>
                삭제
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>

      {/* Memo metadata */}
      <div className="text-xs text-gray-500 mt-1">
        {todayId && <span className="mr-2">Today ID: {todayId}</span>}
        {bookId && <span>Book ID: {bookId}</span>}
      </div>

      {/* Delete confirmation modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={onCloseDeleteModal}
        onDelete={handleDelete}
      />

      {/* Edit modal */}
      <Modal isOpen={isEditModalOpen} onClose={onCloseEditModal}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 text-gray-700">메모 수정</ModalHeader>
          <ModalBody>
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              rows={4}
              className="focus:outline-none focus:ring-0 focus:border-gray-300"
            />
          </ModalBody>
          <ModalFooter>
            <Button color="default" variant="light" onPress={onCloseEditModal}>
              취소
            </Button>
            <Button color="primary" onPress={handleEdit}>
              수정
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default MemoDetail;