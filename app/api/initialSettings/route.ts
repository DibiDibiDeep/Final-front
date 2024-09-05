import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import axios from 'axios';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8080';

export async function POST(request: NextRequest) {
    try {
        // 요청의 JSON 본문을 읽습니다.
        const data = await request.json();

        // 데이터 확인용 로그
        console.log('Received baby info:', data);

        // 백엔드 API 호출
        const response = await axios.post(`${BACKEND_API_URL}/api/baby-info`, data, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // 성공적인 응답을 반환합니다.
        return NextResponse.json({ message: 'Baby information sent successfully' }, { status: 200 });
    } catch (error) {
        // 에러 로깅
        console.error('Error sending baby information:', error);

        // 에러 메시지를 반환합니다.
        return NextResponse.json(
            { message: 'Failed to send baby information', error: (error as Error).message },
            { status: 500 }
        );
    }
}