export interface Event {
    id: number;
    title: string;
    startTime: string;
    endTime: string;
    location: string;
    target: string;
    information: string;
    notes: string;
}

export interface Memo {
    memoId: number;
    userId: number;
    todayId: number | null;
    bookId: number | null;
    date: string;
    content: string;
}

export interface Baby {
    userId: number;
    babyId: number;
    babyName: string;
    photoUrl?: string;
}