'use client';

import React, { useState } from 'react';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, useDisclosure, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Textarea } from "@nextui-org/react";
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import DeleteModal from '../modal/DeleteModal';
import axios from 'axios';

// Memo 타입 정의
type Memo = {
  memoId: number;
  userId: number;
  todayId: number | null;
  bookId: number | null;
  date: string; // ISO 8601 형식의 문자열 (e.g. "2024-03-01T15:30:00")
  content: string;
};

// 유틸리티 함수
const formatDateTimeForBackend = (date: Date): string => {
  return date.toISOString().slice(0, 19).replace('T', ' ');
};

const formatDateTimeForDisplay = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString(); // 또는 원하는 형식으로 포맷팅
};

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

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8080';

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
  const { isOpen: isDeleteModalOpen, onOpen: onOpenDeleteModal, onClose: onCloseDeleteModal } = useDisclosure();
  const { isOpen: isEditModalOpen, onOpen: onOpenEditModal, onClose: onCloseEditModal } = useDisclosure();
  const [editedContent, setEditedContent] = useState(content);

  const handleDelete = async () => {
    try {
      await axios.delete(`${BACKEND_API_URL}/api/memos/${memoId}`);
      onMemoDeleted(memoId);
      onCloseDeleteModal();
    } catch (error) {
      console.error('Failed to delete memo:', error);
      // 에러 처리 로직
    }
  };

  const handleEdit = async () => {
    try {
      const response = await axios.put(`${BACKEND_API_URL}/api/memos/${memoId}`, {
        content: editedContent,
        date: formatDateTimeForBackend(new Date()) // 수정 시 현재 시간으로 업데이트
      });
      const updatedMemo: Memo = response.data;
      onMemoUpdated(updatedMemo);
      onCloseEditModal();
    } catch (error) {
      console.error('Failed to update memo:', error);
      // 에러 처리 로직
    }
  };

  return (
    <div className="w-full px-4 py-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-700">{content}</span>
        <div className="flex items-center">
          <span className="text-xs text-gray-500 mr-2">
            {formatDateTimeForDisplay(date)}
          </span>
          <Dropdown>
            <DropdownTrigger>
              <button>
                <EllipsisVerticalIcon className="h-6 w-6 text-gray-500" />
              </button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Static Actions">
              <DropdownItem key="edit" onPress={onOpenEditModal}>
                Edit
              </DropdownItem>
              <DropdownItem key="delete" className="text-danger" color="danger" onPress={onOpenDeleteModal}>
                Delete
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
      <div className="text-xs text-gray-500 mt-1">
        <span className="mr-2">User ID: {userId}</span>
        {todayId && <span className="mr-2">Today ID: {todayId}</span>}
        {bookId && <span>Book ID: {bookId}</span>}
      </div>
      <DeleteModal 
        isOpen={isDeleteModalOpen}
        onClose={onCloseDeleteModal}
        onDelete={handleDelete}
      />
      <Modal isOpen={isEditModalOpen} onClose={onCloseEditModal}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">메모 수정</ModalHeader>
          <ModalBody>
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              rows={4}
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