import React from 'react';
import { Suspense } from 'react';
import Image from 'next/image';
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

async function getAllBooks(): Promise<Book[]> {
    try {
        const response = await fetch(`${BACKEND_API_URL}/api/books`, { next: { revalidate: 3600 } });
        if (!response.ok) {
            throw new Error('Failed to fetch books');
        }
        return response.json();
    } catch (error) {
        console.error('Failed to fetch books:', error);
        throw new Error('Failed to fetch books');
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

export default async function StoryCardGrid() {
    const books = await getAllBooks();

    return (
        <main className="container mx-auto px-4 py-8 sm:py-12 md:py-16 mb-[100px]">
            <h1 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Favorite Stories</h1>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:gap-6">
                <Suspense fallback={[...Array(8)].map((_, i) => <BookSkeleton key={i} />)}>
                    <StoryCardList books={books} />
                </Suspense>
            </div>
        </main>
    );
}