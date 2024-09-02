'use client';
import React, { useState } from 'react';
import DatePickerModal from './DatePickerModal';
import DeleteModal from './DeleteModal';

const ModalTestPage: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    // const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);
    // const handleDateSelect = (date: Date) => setSelectedDate(date);

    return (
        <div>
            <button onClick={handleOpenModal}>Open Modal</button>
            <DeleteModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}></DeleteModal>
            {/* {selectedDate && <p>Selected Date: {selectedDate.toLocaleDateString()}</p>}
            <DatePickerModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onDateSelect={handleDateSelect}
            /> */}
        </div>
    );
};

export default ModalTestPage;