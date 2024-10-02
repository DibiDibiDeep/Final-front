import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@nextui-org/react";

interface ResetChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    onReset: () => void;
}

const ResetChatModal: React.FC<ResetChatModalProps> = ({ isOpen, onClose, onReset }) => {
    const { onOpenChange } = useDisclosure();

    const handleReset = () => {
        onReset();
        onClose();
    };

    return (
        <>
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
                            <ModalHeader className="flex flex-col gap-1">채팅 내역 초기화</ModalHeader>
                            <ModalBody className="flex flex-col items-center text-center">
                                <p className="text-black">
                                    모든 채팅을 초기화하시겠습니까?
                                </p>
                                <p className="text-gray-600">
                                    초기화된 채팅은 복구할 수 없습니다.
                                </p>
                            </ModalBody>
                            <ModalFooter className="justify-center">
                                <Button className='text-gray-700' variant="light" onPress={onClose}>
                                    취소
                                </Button>
                                <Button color="danger" onPress={handleReset}>
                                    초기화
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}

export default ResetChatModal;