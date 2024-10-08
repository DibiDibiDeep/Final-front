export interface Event {
    id: number;
    userId: number;
    babyId: number;
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
    babyId: number;
    todayId: number | null;
    bookId: number | null;
    date: string;
    content: string;
}

export interface Baby {
    userId: number;
    babyId: number;
    babyName: string;
    gender: string;
    birth: string;
    photoUrl?: string;
}