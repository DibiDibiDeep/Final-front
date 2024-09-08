import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@nextui-org/react";

interface DeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDelete: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ isOpen, onClose, onDelete }) => {
    const { onOpenChange } = useDisclosure();

    const handleDelete = () => {
        onDelete(); // 3
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
                            <ModalHeader className="flex flex-col gap-1" />
                            <ModalBody className="flex flex-col items-center text-center">
                                <p className="text-black">
                                    이 일정을 삭제하시겠습니까?
                                </p>
                                <p className="text-gray-600">
                                    일정을 삭제하면 복구할 수 없습니다.
                                </p>
                            </ModalBody>
                            <ModalFooter className="justify-center">
                                <Button className='text-gray-700' variant="light" onPress={onClose}>
                                    취소
                                </Button>
                                <Button color="primary" onPress={handleDelete}>
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

export default DeleteModal;

// 최하위 컴포넌트(DeleteModal) 에서 상위 컴포넌트(EventCard)로 버블링 → 최상위 컴포넌트(Home)까지 도달하여 전체 상태 업데이트
// 상태 업데이트로 인한 변경사항이 다시 하위 컴포넌트로 캡처링되어 내려가는 형태로 UI 업데이트