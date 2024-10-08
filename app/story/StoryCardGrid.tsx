'use client';
import React, { useEffect, useState } from 'react';
import StoryCard from './StoryCard';
import { DropdownMenu, Dropdown, DropdownItem, DropdownTrigger } from '@nextui-org/dropdown';
import { getCurrentUser, getAuthToken } from '@/utils/authUtils';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/utils/api';
import { useAuth } from '@/hooks/useAuth';
import { Menu } from 'lucide-react'; 

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

const currentDate = new Date().toISOString().split('T')[0];

interface Book {
    bookId: number;
    title: string;
    coverPath: string;
}

interface TodaySum {
    todayId: number;
    userId: number;
    babyId: number;
    content: string;
    date: string;
}

function BookSkeleton() {
    return <div className="w-full h-64 bg-gray-200 rounded animate-pulse"></div>;
}

function StoryCardList({ books, onDelete }: { books: Book[]; onDelete: (id: number) => void; }) {
    return (
        <>
            {books.map((book, index) => (
                <StoryCard
                    key={book.bookId}
                    id={book.bookId}
                    title={book.title}
                    coverPath={book.coverPath}
                    priority={index < 4}
                    onDelete={onDelete}
                />
            ))}
        </>
    );
}

function TodaySumList({ todaySums }: { todaySums: TodaySum[] }) {
    return (
        <>
            {todaySums.map((todaySum) => (
                <div key={todaySum.todayId} className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold">내 일기</h3>
                    <p className="text-sm text-gray-600">{new Date(todaySum.date).toLocaleDateString()}</p>
                    <p className="mt-2">{todaySum.content}</p>
                </div>
            ))}
        </>
    );
}

function ErrorFallback({ error }: { error: Error }) {
    return (
        <div className="text-center text-red-500">
            <p>콘텐츠를 불러오는 데 문제가 발생했습니다.</p>
            <p>{error.message}</p>
        </div>
    );
}

function LoginRequired() {
    return (
        <div className="text-center text-white">
            <p>로그인이 필요합니다. 책 목록을 보려면 로그인해 주세요.</p>
        </div>
    );
}

async function getUserBooks(userId: number, token: string): Promise<Book[]> {
    try {
        const books = await fetchWithAuth(`${BACKEND_API_URL}/api/books/user/${userId}`, {
            method: 'GET'
        });
        if (!books) {
            throw new Error('Failed to fetch books');
        }
        return books;
    } catch (error: any) {
        if (error.name === 'AbortError') {
            console.error('Request timed out');
        } else if (error.message) {
            console.error('Failed to fetch books:', error.message);
        } else {
            console.error('Unknown error:', error);
        }
        throw error;
    }
}

async function getUserTodaySums(userId: number, token: string): Promise<TodaySum[]> {
    try {
        const todaySums = await fetchWithAuth(`${BACKEND_API_URL}/api/today-sum/user/${userId}`, {
            method: 'GET'
        });
        if (!todaySums) {
            throw new Error('Failed to fetch today sums');
        }
        return todaySums;
    } catch (error: any) {
        console.error('Failed to fetch today sums:', error);
        throw error;
    }
}


async function deleteUserBook(bookId: number, token: string): Promise<void> {
    try {
        const response = await fetchWithAuth(`${BACKEND_API_URL}/api/books/${bookId}`, {
            method: 'DELETE'
        });

        if (!response) {
            throw new Error('Failed to delete the book.');
        }
    } catch (error: any) {
        console.error('error:', error);
    }
}

export default function StoryCardGrid() {
    const [books, setBooks] = useState<Book[] | null>(null);
    const [todaySums, setTodaySums] = useState<TodaySum[] | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState(true);
    const [contentType, setContentType] = useState<'books' | 'todaySums'>('books');
    const router = useRouter();
    const { token, userId, error: authError } = useAuth();


    useEffect(() => {
        if (userId && token) {
            const fetchData = async () => {
                try {
                    const [fetchedBooks, fetchedTodaySums] = await Promise.all([
                        getUserBooks(userId, token),
                        getUserTodaySums(userId, token)
                    ]);
                    setBooks(fetchedBooks);
                    setTodaySums(fetchedTodaySums);
                    setLoading(false);
                } catch (err) {
                    setError(err as Error);
                    setLoading(false);
                }
            };
            fetchData();
        } else {
            setLoading(false);
        }
    }, [userId, token]);

    const handleDelete = async (bookId: number) => {
        console.log('Deleting book with id:', bookId); // 추가
        if (!token) return;
        try {
            await deleteUserBook(bookId, token);
            setBooks((prevBooks) => prevBooks?.filter((book) => book.bookId !== bookId) || null);
        } catch (error) {
            setError(error as Error);
        }
    };


    if (loading) {
        return (
            <main className="container mx-auto px-4 py-8 sm:py-12 md:py-16 mb-[100px]">
                <h1 className="text-2xl font-bold text-gray-700 text-center mb-8">내 동화</h1>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:gap-6">
                    {[...Array(8)].map((_, i) => <BookSkeleton key={i} />)}
                </div>
            </main>
        );
    }

    if (error) {
        return <ErrorFallback error={error} />;
    }

    const user = getCurrentUser();
    if (!userId || !books) {
        return <LoginRequired />;
    }

    return (
        <main className="container mx-auto px-4 py-8 sm:py-12 md:py-16 mb-[100px]">
            <div className="flex justify-between items-center mb-8">
                <Dropdown>
                    <DropdownTrigger className="flex justify-center items-center px-4 py-2 bg-white/20 backdrop-blur-xl rounded-[20px] shadow-lg border-2 border-white">
                        <h1 className="text-2xl font-bold text-gray-700">내 콘텐츠</h1> 
                    </DropdownTrigger>
                    <DropdownMenu>
                        <DropdownItem onClick={() => setContentType('books')}>
                            내 동화
                        </DropdownItem>
                        <DropdownItem onClick={() => setContentType('todaySums')}>
                            내 일기
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:gap-6">
                {contentType === 'books' && books && <StoryCardList books={books} onDelete={handleDelete} />}
                {contentType === 'todaySums' && todaySums && <TodaySumList todaySums={todaySums} />}
            </div>
        </main>
    );
}