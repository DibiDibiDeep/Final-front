// // ml이랑 테스트했던 코드
// import { NextResponse } from 'next/server';
// import mysql from 'mysql2/promise';

// interface Page {
//     text: string;
//     illustration_prompt: string;
//     image_url: string;
// }

// interface FairyTale {
//     title: string;
//     pages: Page[];
//     title_img_path: string;
//     user_id: string;
//     baby_id: string;
// }

// async function getConnection() {
//     return await mysql.createConnection({
//         host: process.env.DB_HOST,
//         user: process.env.DB_USER,
//         password: process.env.DB_PASSWORD,
//         database: process.env.DB_NAME,
//     });
// }

// export async function POST(request: Request) {
//     const fairyTale: FairyTale = await request.json();
//     const connection = await getConnection();

//     try {
//         await connection.beginTransaction();
//         const [bookResult] = await connection.execute(
//             'INSERT INTO Book (user_id, title, cover_path, start_date, end_date, generated_date) VALUES (?, ?, ?, NOW(), NOW(), NOW())',
//             [fairyTale.user_id, fairyTale.title, fairyTale.title_img_path]
//         );
//         const bookId = (bookResult as mysql.OkPacket).insertId;

//         for (let i = 0; i < fairyTale.pages.length; i++) {
//             const page = fairyTale.pages[i];
//             await connection.execute(
//                 'INSERT INTO Page (book_id, page_num, text, illust_prompt, image_path) VALUES (?, ?, ?, ?, ?)',
//                 [bookId, i + 1, page.text, page.illustration_prompt, page.image_url]
//             );
//         }

//         await connection.commit();
//         return NextResponse.json({ message: 'Fairy tale stored successfully', bookId });
//     } catch (error) {
//         await connection.rollback();
//         console.error('Error storing fairy tale:', error);
//         return NextResponse.json({ message: 'Error storing fairy tale' }, { status: 500 });
//     } finally {
//         await connection.end();
//     }
// }

// export async function GET(request: Request) {
//     const connection = await getConnection();

//     try {
//         // 모든 동화 목록 조회
//         const [booksResult] = await connection.execute(
//             'SELECT book_id, title, cover_path, generated_date FROM Book ORDER BY generated_date DESC'
//         );

//         return NextResponse.json(booksResult);
//     } catch (error) {
//         console.error('Error fetching fairy tales:', error);
//         return NextResponse.json({ message: 'Error fetching fairy tales' }, { status: 500 });
//     } finally {
//         await connection.end();
//     }
// }