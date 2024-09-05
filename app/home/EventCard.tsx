import React, { useState } from 'react';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@nextui-org/react";
import { CalendarIcon, MapPinIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import DeleteModal from '../modal/DeleteModal';
import Link from 'next/link';

interface EventCardProps {
  id: number;
  eventName: string;
  date: string;
  location: string;
}

const EventCard: React.FC<EventCardProps> = ({ id, eventName, date, location }) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  }

  const handleCloseModal = () => {
    setIsDeleteModalOpen(false);
  }

  return (
    <div className="w-full px-4 py-2">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold text-black">{eventName}</h2>
        <Dropdown>
          <DropdownTrigger>
            <button>
              <EllipsisVerticalIcon className="h-6 w-6 text-gray-500" />
            </button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Static Actions"
            selectionMode='single'>
            <DropdownItem key="edit">
              <Link href={`/editEvent?id=${id}`} className='text-gray-700'>Edit</Link>
            </DropdownItem>
            <DropdownItem key="delete" className="text-danger" color="danger" onPress={handleDeleteClick}>
              Delete
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
      <div className="flex items-center mb-2">
        <CalendarIcon className="h-5 w-5 mr-2 text-gray-600" />
        <span className="text-sm text-gray-700">{date}</span>
      </div>
      <div className="flex items-center">
        <MapPinIcon className="h-5 w-5 mr-2 text-gray-600" />
        <span className="text-sm text-gray-700">{location}</span>
      </div>
      <DeleteModal isOpen={isDeleteModalOpen} onClose={handleCloseModal} />
    </div>
  );
};

export default EventCard;