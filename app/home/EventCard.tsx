'use client';
import React, { useEffect, useState } from 'react';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";
import { CalendarIcon, MapPinIcon, EllipsisVerticalIcon, FaceSmileIcon, InformationCircleIcon, TagIcon } from '@heroicons/react/24/outline';
import DeleteModal from '../modal/DeleteModal';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/utils/api';
import { useAuth } from '@/hooks/authHooks';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

interface EventCardProps {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  location: string;
  target: string; // 새로 추가
  information: string;
  notes: string;
  onEventDeleted: () => void;
  selectedDate: Date;
}

const EventCard: React.FC<EventCardProps> = ({
  id,
  title,
  startTime,
  endTime,
  location,
  target,
  information,
  notes,
  onEventDeleted,
  selectedDate
}) => {
  const { token, error: authError } = useAuth();
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
      await fetchWithAuth(`${BACKEND_API_URL}/api/calendars/${id}`, {
        method: 'DELETE'
      });
      onEventDeleted();
      handleCloseModal();
    } catch (error) {
      // console.error('Error deleting event:', error);
    }
    window.location.reload();
  };




  const formatDateTimeForDisplay = (dateTime: string) => {
    const date = new Date(dateTime);
    const eventDate = new Date(dateTime);
    eventDate.setHours(0, 0, 0, 0);
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? '오후' : '오전';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = String(minutes).padStart(2, '0');

    if (eventDate.getTime() === selected.getTime()) {
      return `${ampm} ${formattedHours}:${formattedMinutes}`;
    } else {
      return `${month}.${day} ${ampm} ${formattedHours}:${formattedMinutes}`;
    }
  };

  return (
    <div className="w-full px-4 py-2">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold text-black">{title}</h2>
        <Dropdown>
          <DropdownTrigger>
            <button>
              <EllipsisVerticalIcon className="h-6 w-6 text-gray-500" />
            </button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Static Actions" selectionMode='single'>
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
        <span className="text-sm text-gray-700">
          {`${formatDateTimeForDisplay(startTime)} ~ ${formatDateTimeForDisplay(endTime)}`}
        </span>
      </div>
      {location && (
        <div className="flex items-center mb-2">
          <MapPinIcon className="h-5 w-5 mr-2 text-gray-600" />
          <span className="text-sm text-gray-700">{location}</span>
        </div>
      )}
      {target && (
        <div className="flex items-center mb-2">
          <FaceSmileIcon className="h-5 w-5 mr-2 text-gray-600" />
          <span className="text-sm text-gray-700">{target}</span>
        </div>
      )}
      {information && (
        <div className="flex items-center mb-2">
          <InformationCircleIcon className="h-5 w-5 mr-2 text-gray-600" />
          <span className="text-sm text-gray-700">{information}</span>
        </div>
      )}
      {notes && (
        <div className="flex items-center mb-2">
          <TagIcon className="h-5 w-5 mr-2 text-gray-600" />
          <span className="text-sm text-gray-700">{notes}</span>
        </div>
      )}
      <DeleteModal isOpen={isDeleteModalOpen} onClose={handleCloseModal} onDelete={handleDelete} />
    </div>
  );
};

export default EventCard;