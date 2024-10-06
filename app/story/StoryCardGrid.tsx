'use client';
import React, { useEffect, useState } from 'react';
import StoryCard from './StoryCard';
import { getCurrentUser, getAuthToken } from '@/utils/authUtils';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/utils/api';
import { useAuth } from '@/hooks/useAuth';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

interface Book {
    bookId: number;
    title: string;
    coverPath: string;
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

function ErrorFallback({ error }: { error: Error }) {
    return (
        <div className="text-center text-red-500">
            <p>책을 불러오는 데 문제가 발생했습니다.</p>
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
    if (!token) {
        throw new Error('인증 토큰이 없습니다. 다시 로그인해 주세요.');
    }

    try {
        const books = await fetchWithAuth(`${BACKEND_API_URL}/api/books/user/${userId}`, token, {
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


async function deleteUserBook(bookId: number, token: string): Promise<void> {
    if (!token) {
        throw new Error('인증 토큰이 없습니다. 다시 로그인해 주세요.');
    }

    try {
        const response = await fetchWithAuth(`${BACKEND_API_URL}/api/books/${bookId}`, token, {
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
    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { token, userId, error: authError } = useAuth();


    useEffect(() => {
        // const user = getCurrentUser();
        if (userId && token) {
            getUserBooks(userId, token)
                .then((fetchedBooks) => {
                    setBooks(fetchedBooks);
                    setLoading(false);
                })
                .catch((err) => {
                    setError(err);
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [userId]);

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
            <h1 className="text-2xl font-bold text-gray-700 text-center mb-8">내 동화</h1>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:gap-6">
                <StoryCardList books={books} onDelete={handleDelete} />
            </div>
        </main>
    );
}