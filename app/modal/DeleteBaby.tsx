import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@nextui-org/react";

interface DeleteBabyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDelete: (e: React.MouseEvent) => Promise<void>;
}

const DeleteBabyModal: React.FC<DeleteBabyModalProps> = ({ isOpen, onClose, onDelete }: DeleteBabyModalProps) => {
    const { onOpenChange } = useDisclosure();

    const handleDelete = async (e: React.MouseEvent) => {
        await onDelete(e);
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
                            <ModalHeader className="flex flex-col gap-1 text-gray-700">아이 정보 삭제</ModalHeader>
                            <ModalBody className="flex flex-col items-center text-center">
                                <p className="text-black">
                                    아이의 정보를 삭제하시겠습니까?
                                </p>
                                <p className="text-gray-600">
                                    삭제된 아이 정보는 복구할 수 없습니다.
                                </p>
                            </ModalBody>
                            <ModalFooter className="justify-center">
                                <Button className='text-gray-700' variant="light" onPress={onClose}>
                                    취소
                                </Button>
                                <Button color="danger" onClick={handleDelete}>
                                    삭제
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}

export default DeleteBabyModal;