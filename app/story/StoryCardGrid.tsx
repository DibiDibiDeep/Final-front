'use client';
import React, { useEffect, useState } from 'react';
import StoryCard from './StoryCard';

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

async function getUserBooks(userId: number): Promise<Book[]> {
    try {
        const response = await fetch(`${BACKEND_API_URL}/api/books/user/${userId}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: Book[] = await response.json();

        if (!Array.isArray(data)) {
            throw new Error('Response is not a valid array');
        }

        return data;
    } catch (error) {
        console.error('Failed to fetch books:', error);
        throw error;
    }
}

export default function StoryCardGrid() {
    const [userId, setUserId] = useState<number | null>(null);
    const [books, setBooks] = useState<Book[] | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) {
            setUserId(parseInt(storedUserId));
        } else {
            setUserId(null);
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (userId !== null) {
            getUserBooks(userId)
                .then((fetchedBooks) => {
                    setBooks(fetchedBooks);
                    setLoading(false);
                })
                .catch((err) => {
                    setError(err);
                    setLoading(false);
                });
        }
    }, [userId]);

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

    if (userId === null || books === null) {
        return <LoginRequired />;
    }

    return (
        <main className="container mx-auto px-4 py-8 sm:py-12 md:py-16 mb-[100px]">
            <h1 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">내 동화</h1>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:gap-6">
                <StoryCardList books={books} onDelete={handleDelete} />
            </div>
        </main>
    );
}
