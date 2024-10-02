'use client';

import React, { useState } from 'react';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, useDisclosure, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Textarea } from "@nextui-org/react";
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { Memo } from '@/types/index';
import DeleteModal from '../modal/DeleteModal';
import axios from 'axios';


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

// 환경 변수
const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

// 유틸리티 함수
const formatDateTimeForDisplay = (dateString: string): string => {
  const date = new Date(dateString);
  const kstDate = new Date(date.getTime() + (9 * 60 * 60 * 1000)); // KST는 UTC+9
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
  // 상태 및 모달관리
  const { isOpen: isDeleteModalOpen, onOpen: onOpenDeleteModal, onClose: onCloseDeleteModal } = useDisclosure();
  const { isOpen: isEditModalOpen, onOpen: onOpenEditModal, onClose: onCloseEditModal } = useDisclosure();
  const [editedContent, setEditedContent] = useState(content);

  // 메모 삭제 핸들러
  const handleDelete = async () => {
    try {
      await axios.delete(`${BACKEND_API_URL}/api/memos/${memoId}`);
      onMemoDeleted(memoId);
      onCloseDeleteModal();
    } catch (error) {
      console.error('Failed to delete memo:', error);
      // MEMO: 사용자에게 오류 메시지 표시
    }
  };

  // 메모 수정 핸들러
  const handleEdit = async () => {
    try {
      const updatedMemoData = {
        userId: userId,
        todayId: todayId,
        bookId: bookId,
        date: new Date().toISOString(),
        content: editedContent
      };

      const response = await axios.put(`${BACKEND_API_URL}/api/memos/${memoId}`, updatedMemoData);
      const updatedMemo: Memo = response.data;
      onMemoUpdated(updatedMemo);
      onCloseEditModal();
    } catch (error) {
      console.error('Failed to update memo:', error);
      // MEMO: 사용자에게 오류 메시지 표시
    }
  };

  return (
    <div className="w-full px-4 py-2">
      {/* 메모 내용 및 옵션 메뉴 */}
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

      {/* 메모 메타데이터 */}
      <div className="text-xs text-gray-500 mt-1">
        {todayId && <span className="mr-2">Today ID: {todayId}</span>}
        {bookId && <span>Book ID: {bookId}</span>}
      </div>

      {/* 삭제 확인 모달 */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={onCloseDeleteModal}
        onDelete={handleDelete}
      />

      {/* 수정 모달 */}
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