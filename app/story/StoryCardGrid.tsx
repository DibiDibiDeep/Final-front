import React from 'react';
import { Suspense } from 'react';
import { cookies } from 'next/headers';
import StoryCard from './StoryCard';
import { Metadata } from 'next';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

interface Book {
    bookId: number;
    title: string;
    coverPath: string;
}

// SEO를 위한 메타데이터 추가
export const metadata: Metadata = {
    title: 'Favorite Stories | Our Book Collection',
    description: 'Explore our curated collection of favorite stories and books.',
};

async function getUserId(): Promise<number | null> {
    const cookieStore = cookies();
    const userIdCookie = cookieStore.get('userId');
    return userIdCookie ? parseInt(userIdCookie.value) : null;
}

async function getAuthToken(): Promise<string | null> {
    const cookieStore = cookies();
    const tokenCookie = cookieStore.get('authToken');
    return tokenCookie ? tokenCookie.value : null;
}

async function getUserBooks(userId: number): Promise<Book[]> {
    const token = await getAuthToken();
    if (!token) {
        throw new Error('인증 토큰이 없습니다. 다시 로그인해 주세요.');
    }

    try {
        const response = await fetch(`${BACKEND_API_URL}/api/books/user/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            next: { revalidate: 3600 }
        });

        if (response.status === 401) {
            throw new Error('인증에 실패했습니다. 다시 로그인해 주세요.');
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        console.error('Failed to fetch books:', error);
        throw error;
    }
}

function BookSkeleton() {
    return <div className="w-full h-64 bg-gray-200 rounded animate-pulse"></div>;
}

function StoryCardList({ books }: { books: Book[] }) {
    return (
        <>
            {books.map((book, index) => (
                <StoryCard
                    key={book.bookId}
                    id={book.bookId}
                    title={book.title}
                    coverPath={book.coverPath}
                    priority={index < 4}
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

export default async function StoryCardGrid() {
    const userId = await getUserId();

    if (userId === null) {
        return <LoginRequired />;
    }

    let books: Book[];
    try {
        books = await getUserBooks(userId);
    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes('인증')) {
                return <LoginRequired />;
            }
            return <ErrorFallback error={error} />;
        }
        return <ErrorFallback error={new Error('Unknown error')} />;
    }

    return (
        <main className="container mx-auto px-4 py-8 sm:py-12 md:py-16 mb-[100px]">
            <h1 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Your Favorite Stories</h1>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:gap-6">
                <Suspense fallback={[...Array(8)].map((_, i) => <BookSkeleton key={i} />)}>
                    <StoryCardList books={books} />
                </Suspense>
            </div>
        </main>
    );
}