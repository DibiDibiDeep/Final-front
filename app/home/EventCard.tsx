'use client';
import React, { useState } from 'react';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";
import { CalendarIcon, MapPinIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import DeleteModal from '../modal/DeleteModal';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8080';

interface EventCardProps {
  id: number;
  title: string;
  date: string; // date is expected in MM-DD format
  location: string;
  onEventDeleted: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ id, title, date, location, onEventDeleted }) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const router = useRouter();

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  }

  const handleCloseModal = () => {
    setIsDeleteModalOpen(false);
  }

  const handleEditClick = () => {
    router.push(`/editEvent/${id}`);
  }

  const handleDelete = async () => {
    try {
      await axios.delete(`${BACKEND_API_URL}/api/calendars/${id}`, {
        headers: { 'Content-Type': 'application/json' }
      });
      onEventDeleted(); // Refresh the event list after deletion
    } catch (error) {
      console.error('Error deleting event:', error);
      // Optionally, show an error message to the user
    }
  }

  const formatDateForDisplay = (date: string) => {
    const [month, day] = date.split('-');
    return `${month}.${day}`;
  };

  return (
    <div className="w-full px-4 py-2">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold text-black">{title}</h2>
        <Dropdown>
          <DropdownTrigger>
            <button>
              <EllipsisVerticalIcon className="h-6 w-6 text-gray-500" />
            </button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Static Actions"
            selectionMode='single'>
            <DropdownItem key="edit" className="text-gray-700" onPress={handleEditClick}>
              수정
            </DropdownItem>
            <DropdownItem key="delete" className="text-danger" color="danger" onPress={handleDeleteClick}>
              삭제
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
      <div className="flex items-center mb-2">
        <CalendarIcon className="h-5 w-5 mr-2 text-gray-600" />
        <span className="text-sm text-gray-700">{formatDateForDisplay(date)}</span>
      </div>
      <div className="flex items-center">
        <MapPinIcon className="h-5 w-5 mr-2 text-gray-600" />
        <span className="text-sm text-gray-700">{location}</span>
      </div>
      <DeleteModal isOpen={isDeleteModalOpen} onClose={handleCloseModal} onDelete={handleDelete} />
    </div>
  );
};

export default EventCard;
