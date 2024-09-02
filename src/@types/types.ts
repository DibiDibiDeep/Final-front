export interface Meeting {
    id: string;
    name: string;
    date: string;
    time: string;
    location: string;
}

export interface CalendarDate {
    day: number;
    month: number;
    year: number;
    isCurrentMonth: boolean;
    isToday: boolean;
}