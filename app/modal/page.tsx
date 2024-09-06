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
        </div>
    );
};

export default ModalTestPage;