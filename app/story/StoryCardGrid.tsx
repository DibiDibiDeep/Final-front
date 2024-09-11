// 서버 컴포넌트 → 모든 책 정보를 가져와 StoryCard 컴포넌트에 전달
import React from 'react';
import axios from 'axios';
import StoryCard from './StoryCard';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8080';

interface Book {
    bookId: number;
    title: string;
    coverPath: string;
}

async function getAllBooks(): Promise<Book[]> {
    try {
        const response = await axios.get(`${BACKEND_API_URL}/api/books`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch books:', error);
        throw new Error('Failed to fetch books');
    }
}

export default async function StoryCardGrid() {
    const books = await getAllBooks();
    return (
        <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16 mb-[100px]">
            <h1 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Favorite Stories</h1>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:gap-6">
                {books.map((book) => (
                    <StoryCard key={book.bookId} id={book.bookId} title={book.title} coverPath={book.coverPath} />
                ))}
            </div>
        </div>
    );
}
