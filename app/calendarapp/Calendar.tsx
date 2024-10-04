'use client'
import React, { useState, useMemo, useCallback } from 'react';
import { Card } from "@nextui-org/card";
import { Button } from "@nextui-org/button";
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const daysOfWeek: string[] = ['일', '월', '화', '수', '목', '금', '토'];

interface CalendarButtonProps {
    day: number | null;
    isCurrentMonth: boolean;
    isToday: boolean;
    isSelected: boolean;
    hasEvent: boolean;
    onClick: () => void;
}

const CalendarButton: React.FC<CalendarButtonProps> = React.memo(({ day, isCurrentMonth, isToday, isSelected, hasEvent, onClick }) => (
    <Button
        size="sm"
        variant={isToday ? "solid" : isSelected ? "bordered" : "light"}
        className={`
      min-w-[30px] h-[30px] p-0 rounded-full relative flex justify-center items-center
      ${isToday
                ? 'bg-primary text-white hover:bg-primary-600'
                : isSelected
                    ? 'border-primary text-primary hover:bg-primary-100'
                    : isCurrentMonth
                        ? 'bg-transparent text-gray-700 hover:bg-gray-100'
                        : 'bg-transparent text-gray-400 hover:bg-gray-100'}
      `}
        onClick={onClick}
    >
        {day}
        {hasEvent && (
            <span className={`absolute bottom-[-8px] text-xl ${isToday ? 'text-white' : 'text-fuchsia-700'}`}>
                •
            </span>
        )}
    </Button>
));

CalendarButton.displayName = 'CalendarButton';

interface CalendarProps {
    selectedDate: Date | null;
    onDateSelect: (date: Date) => void;
    events: { startTime: string; endTime: string }[];
}

const Calendar: React.FC<CalendarProps> = ({ selectedDate: propSelectedDate, onDateSelect, events }) => {
    const today = useMemo(() => new Date(), []);
    const [currentDate, setCurrentDate] = useState(() => today);
    const [selectedDate, setSelectedDate] = useState(() => propSelectedDate || today);

    const getDaysInMonth = useCallback((date: Date): number => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    }, []);

    const getFirstDayOfMonth = useCallback((date: Date): number => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    }, []);

    const hasEventOnDay = useCallback((day: number) => {
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();
        const date = new Date(currentYear, currentMonth, day);
        return events.some(event => {
            const startDate = new Date(event.startTime);
            const endDate = new Date(event.endTime);
            return (date >= startDate && date <= endDate) ||
                (date.getDate() === startDate.getDate() &&
                    date.getMonth() === startDate.getMonth() &&
                    date.getFullYear() === startDate.getFullYear());
        });
    }, [currentDate, events]);

    const calendarDays = useMemo(() => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDayOfMonth = getFirstDayOfMonth(currentDate);
        const daysInPrevMonth = getDaysInMonth(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));

        const days: (number | null)[] = [];

        for (let i = firstDayOfMonth - 1; i >= 0; i--) {
            days.push(daysInPrevMonth - i);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i);
        }

        const remainingDays = 42 - days.length;
        for (let i = 1; i <= remainingDays; i++) {
            days.push(i);
        }

        return days;
    }, [currentDate, getDaysInMonth, getFirstDayOfMonth]);

    const changeMonth = useCallback((increment: number) => {
        setCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth() + increment, 1));
    }, []);

    const isSameDay = useCallback((date1: Date, date2: Date) => {
        return date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear();
    }, []);

    const handleDateClick = useCallback((day: number, isCurrentMonth: boolean) => {
        if (isCurrentMonth) {
            const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            setSelectedDate(newDate);
            onDateSelect(newDate);
        }
    }, [currentDate, onDateSelect]);

    const formattedCurrentDate = useMemo(() =>
        currentDate.toLocaleString('ko-KR', { month: 'long', year: 'numeric' }),
        [currentDate]);

    return (
        <Card className="w-[285px] bg-white/40 backdrop-blur-md border border-white/30 rounded-3xl p-3 shadow-lg mx-auto">
            <div className="flex justify-between items-center mb-3">
                <Button size="sm" variant="light" className="text-gray-700" onClick={() => changeMonth(-1)}><ChevronLeftIcon className="h-3 w-3 text-gray-500" /></Button>
                <h4 className="text-gray-800 text-base font-semibold">
                    {formattedCurrentDate}
                </h4>
                <Button size="sm" variant="light" className="text-gray-700" onClick={() => changeMonth(1)}><ChevronRightIcon className="h-3 w-3 text-gray-500" /></Button>
            </div>
            <div>
                <div className="grid grid-cols-7 gap-1">
                    {daysOfWeek.map((day) => (
                        <div key={day} className="text-center text-gray-500 text-xs">
                            {day}
                        </div>
                    ))}
                    {calendarDays.map((day, index) => {
                        const isCurrentMonth = index >= getFirstDayOfMonth(currentDate) && index < getFirstDayOfMonth(currentDate) + getDaysInMonth(currentDate);
                        const currentDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), day || 1);
                        const isToday = isCurrentMonth && isSameDay(currentDay, today);
                        const isSelected = selectedDate !== null && isCurrentMonth && isSameDay(currentDay, selectedDate);
                        const hasEvent = isCurrentMonth && day !== null && hasEventOnDay(day);
                        return (
                            <CalendarButton
                                key={index}
                                day={day}
                                isCurrentMonth={isCurrentMonth}
                                isToday={isToday}
                                isSelected={isSelected}
                                hasEvent={hasEvent}
                                onClick={() => handleDateClick(day || 0, isCurrentMonth)}
                            />
                        );
                    })}
                </div>
            </div>
        </Card>
    );
};

export default Calendar;