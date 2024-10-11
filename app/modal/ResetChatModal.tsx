import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@nextui-org/react";
import { fetchWithAuth } from '@/utils/api';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

interface ResetChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    onReset: () => void;
    userId: number | null;
    babyId: number | null;
}

const ResetChatModal: React.FC<ResetChatModalProps> = ({ isOpen, onClose, onReset, userId, babyId }) => {
    const { onOpenChange } = useDisclosure();

    const handleReset = async () => {
        if (userId === null || babyId === null) {
            // console.error('User ID or Baby ID is not available');
            return;
        }

        try {
            // 서버에 채팅 히스토리 리셋 요청 보내기
            await fetchWithAuth(`${BACKEND_API_URL}/api/chat/reset`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userId,
                    babyId: babyId,
                    resetHistory: true  // ML 서비스의 reset_history를 true로 설정
                }),
            });
            
            // 서버 요청이 성공하면 로컬 초기화 진행
            onReset();
            onClose();
        } catch (error) {
            // console.error('Failed to reset chat history on server:', error);
            // 에러 처리 (예: 사용자에게 알림)
        }
    };

    return (
        <Modal
            size='md'
            isOpen={isOpen}
            onOpenChange={() => {
                onOpenChange();
                onClose();
            }}
            backdrop="blur"
            className="bg-opacity-60 flex items-center justify-center"
            placement='center'
        >
            <ModalContent className="m-auto">
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1 text-gray-700">채팅 내용 삭제</ModalHeader>
                        <ModalBody className="flex flex-col items-center text-center">
                            <p className="text-black">
                                모든 채팅을 삭제하시겠습니까?
                            </p>
                            <p className="text-gray-600">
                                삭제된 채팅은 복구할 수 없습니다.
                            </p>
                        </ModalBody>
                        <ModalFooter className="justify-center">
                            <Button className='text-gray-700' variant="light" onPress={onClose}>
                                취소
                            </Button>
                            <Button color="danger" onPress={handleReset}>
                                삭제
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}

export default ResetChatModal;