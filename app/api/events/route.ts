import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
    try {
        // 요청의 JSON 본문을 읽습니다.
        const data = await request.json();

        // 데이터 확인용 로그
        console.log(data);

        // 백엔드 API 호출
        const response = await axios.post('http://localhost:8080/api/events', data, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // 성공적인 응답을 반환합니다.
        return NextResponse.json({ message: 'Event sent successfully' }, { status: 200 });
    } catch (error) {
        // 에러 로깅
        console.error('Error sending event:', error);

        // 에러 메시지를 반환합니다.
        return NextResponse.json({ message: 'Failed to send event', error: (error as Error).message }, { status: 500 });
    }
}
