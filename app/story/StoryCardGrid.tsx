'use client';
import React, { useEffect, useState } from 'react';
import StoryCard from './StoryCard';
import { getCurrentUser, getAuthToken } from '@/utils/authUtils';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

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
                    onDelete={onDelete} // Pass the delete handler to StoryCard
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

async function getUserBooks(userId: number): Promise<Book[]> {
    const token = getAuthToken();
    if (!token) {
        throw new Error('인증 토큰이 없습니다. 다시 로그인해 주세요.');
    }

    try {
        const response = await fetch(`${BACKEND_API_URL}/api/books/user/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    } catch (error) {
        console.error('Failed to fetch books:', error);
        throw error;
    }
}

async function deleteUserBook(bookId: number): Promise<void> {
    try {
        const response = await fetch(`${BACKEND_API_URL}/api/books/${bookId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Failed to delete the book.');
        }
    } catch (error) {
        console.error('Failed to delete book:', error);
        throw error;
    }
}

export default function StoryCardGrid() {
    const [books, setBooks] = useState<Book[] | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const user = getCurrentUser();
        if (user) {
            getUserBooks(user.userId)
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
    }, []);

    const handleDelete = async (bookId: number) => {
        try {
            await deleteUserBook(bookId);
            setBooks((prevBooks) => prevBooks?.filter((book) => book.bookId !== bookId) || null);
        } catch (error) {
            setError(error as Error); // Type assertion here
        }
    };

    if (loading) {
        return (
            <main className="container mx-auto px-4 py-8 sm:py-12 md:py-16 mb-[100px]">
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
    if (!user || !books) {
        return <LoginRequired />;
    }

    return (
        <div>
            <div className="fixed top-[37px] left-0 w-full">
                <div className="flex items-center w-full max-w-[90%] sm:max-w-md p-4 mx-auto">
                    <h1 className="text-2xl font-bold text-gray-700 text-center flex-grow mb-0"> {/* Ensure no bottom margin */}
                        내 동화
                    </h1>
                </div>
            </div>
            <main className="container mb-[100px]"> {/* Set padding top and bottom to 0 */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:gap-6">
                    <StoryCardList books={books} onDelete={handleDelete} />
                </div>
            </main>
        </div>
    );
}