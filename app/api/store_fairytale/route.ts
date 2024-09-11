import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

interface Page {
    text: string;
    illustration_prompt: string;
    image_url: string;
}

interface FairyTale {
    title: string;
    pages: Page[];
    title_img_path: string;
    user_id: string;
    baby_id: string;
}

export async function POST(request: Request) {
    const fairyTale: FairyTale = await request.json();

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    try {
        await connection.beginTransaction();

        const [bookResult] = await connection.execute(
            'INSERT INTO Book (user_id, title, cover_path, start_date, end_date, generated_date) VALUES (?, ?, ?, NOW(), NOW(), NOW())',
            [fairyTale.user_id, fairyTale.title, fairyTale.title_img_path]
        );

        const bookId = (bookResult as mysql.OkPacket).insertId;

        for (let i = 0; i < fairyTale.pages.length; i++) {
            const page = fairyTale.pages[i];
            await connection.execute(
                'INSERT INTO Page (book_id, page_num, text, illust_prompt, image_path) VALUES (?, ?, ?, ?, ?)',
                [bookId, i + 1, page.text, page.illustration_prompt, page.image_url]
            );
        }

        await connection.commit();
        return NextResponse.json({ message: 'Fairy tale stored successfully', bookId });
    } catch (error) {
        await connection.rollback();
        console.error('Error storing fairy tale:', error);
        return NextResponse.json({ message: 'Error storing fairy tale' }, { status: 500 });
    } finally {
        await connection.end();
    }
}