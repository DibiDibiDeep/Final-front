'use client';
import React, { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, useDisclosure, ModalFooter } from "@nextui-org/react";
import Calendar from '../calendar/Calendar';

interface DatePickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDateSelect: (date: Date) => void;
}

const DatePickerModal: React.FC<DatePickerModalProps> = ({ isOpen, onClose, onDateSelect }) => {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const { onOpenChange } = useDisclosure();

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        onDateSelect(date);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={() => {
                onOpenChange();
                onClose();
            }}
            backdrop="blur"
            className="bg-opacity-60"
            placement='center'
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1 text-black">Select a date</ModalHeader>
                        <ModalBody>
                            <Calendar selectedDate={selectedDate} onDateSelect={handleDateSelect} />
                        </ModalBody>
                        <ModalFooter />
                    </>
                )}
            </ModalContent>

        </Modal>
    );
};

export default DatePickerModal;