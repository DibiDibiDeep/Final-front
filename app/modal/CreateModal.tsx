'use client'

import React, { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Textarea } from "@nextui-org/react";

interface CreateMemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateMemo: (content: string) => void;
}

const CreateMemoModal: React.FC<CreateMemoModalProps> = ({ isOpen, onClose, onCreateMemo }) => {
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    if (content.trim()) {
      onCreateMemo(content);
      setContent('');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 text-gray-700">메모 추가</ModalHeader>
        <ModalBody>
          <Textarea
            placeholder="메모 내용을 입력하세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
          />
        </ModalBody>
        <ModalFooter>
          <Button color="default" variant="light" onPress={onClose}>
            취소
          </Button>
          <Button color="primary" onPress={handleSubmit}>
            추가
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateMemoModal;