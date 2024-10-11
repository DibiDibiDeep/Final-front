// todaySumTypes.tsx

import React, { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@nextui-org/react";

export interface TodaySum {
    todayId: number;
    userId: number;
    babyId: number;
    content: string;
    date: string;
}

export interface TodaySumProps {
    todaySums: TodaySum[];
    onDelete: (id: number) => void;
}

export interface TodaySumModalProps {
    todaySum: TodaySum;
    isOpen: boolean;
    onClose: () => void;
}

export const TodaySumModal: React.FC<TodaySumModalProps> = ({ todaySum, isOpen, onClose }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalContent className='text-gray-700'>
                <ModalHeader>{new Date(todaySum.date).toLocaleDateString()}</ModalHeader>
                <ModalBody>
                    <p>{todaySum.content}</p>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={onClose} color="primary" variant="light">닫기</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export const TodaySumList: React.FC<TodaySumProps> = ({ todaySums, onDelete }) => {
    const [selectedTodaySum, setSelectedTodaySum] = useState<TodaySum | null>(null);
    const { isOpen, onOpen, onClose } = useDisclosure();

    const handleTodaySumClick = (todaySum: TodaySum) => {
        setSelectedTodaySum(todaySum);
        onOpen();
    };

    const truncateContent = (content: string, maxLength: number = 100) => {
        return content.length > maxLength ? `${content.substring(0, maxLength)}...` : content;
    };

    const handleDelete = async (todayId: number) => {
        try {
            await onDelete(todayId);
        } catch (error) {
            // console.error('일기 삭제 중 오류 발생:', error);
            // Here you can add logic to show an error message to the user
        }
    };

    return (
        <>
            {todaySums.map((todaySum) => (
                <div
                    key={todaySum.todayId}
                    className="bg-white/70 p-4 rounded-lg shadow cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleTodaySumClick(todaySum)}
                >
                    <h3 className="text-lg font-semibold text-gray-700">{new Date(todaySum.date).toLocaleDateString()}</h3>
                    <p className="mt-2 text-gray-700">{truncateContent(todaySum.content)}</p>
                    <p
                        className="mt-2 text-red-500 hover:underline"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(todaySum.todayId);
                        }}
                    >
                        삭제
                    </p>
                </div>
            ))}
            {selectedTodaySum && (
                <TodaySumModal
                    todaySum={selectedTodaySum}
                    isOpen={isOpen}
                    onClose={onClose}
                />
            )}
        </>
    );
};