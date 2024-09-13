'use client'

import React, { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Textarea } from "@nextui-org/react";

interface CreateDiaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateDiary: (content: string) => void;
}

const CreateDiaryModal: React.FC<CreateDiaryModalProps> = ({ isOpen, onClose, onCreateDiary }) => {
    const [content, setContent] = useState('');

    const handleSubmit = () => {
        if (content.trim()) {
            onCreateDiary(content);
            setContent('');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1 text-gray-700">일기장 입력</ModalHeader>
                <ModalBody>
                    <Textarea
                        placeholder="일기장 내용을 입력하세요"
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

export default CreateDiaryModal;