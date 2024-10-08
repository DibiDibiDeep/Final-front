import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@nextui-org/react";

interface ConfirmUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ConfirmUploadModal: React.FC<ConfirmUploadModalProps> = ({ isOpen, onClose }) => {
    const { onOpenChange } = useDisclosure();

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
                            <ModalHeader className="flex flex-col gap-1 text-gray-700">알림</ModalHeader>
                            <ModalBody className="flex flex-col items-center text-center mb-6">
                                <p className="text-gray-600">
                                    사진 업로드가 완료되었습니다.
                                </p>
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}

export default ConfirmUploadModal;