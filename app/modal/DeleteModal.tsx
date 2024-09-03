import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@nextui-org/react";

interface DeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ isOpen, onClose }) => {
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
                            <ModalHeader className="flex flex-col gap-1" />
                            <ModalBody className="flex flex-col items-center text-center">
                                <p className="text-black">
                                    Are you sure you want to delete this schedule?
                                </p>
                                <p className="text-gray-600">
                                    If you delete the schedule <br />
                                    you cant recover it.
                                </p>
                            </ModalBody>
                            <ModalFooter className="justify-center">
                                <Button className='text-gray-700' variant="light" onPress={onClose}>
                                    Close
                                </Button>
                                <Button color="primary" onPress={onClose}>
                                    Delete
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