import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import axios from 'axios';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8080';
const HEADERS = { 'Content-Type': 'application/json' };

// 모든 일정 가져오기
export async function GET(request: NextRequest) {
    try {
        const { data } = await axios.get(`${BACKEND_API_URL}/api/calendars`, { headers: HEADERS });
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error('Failed to fetch events:', (error as Error).message);
        return NextResponse.json({ message: 'Failed to fetch events', error: (error as Error).message }, { status: 500 });
    }
}

// 일정 추가
export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        console.log('Request Data:', data);

        await axios.post(`${BACKEND_API_URL}/api/calendars`, data, { headers: HEADERS });
        return NextResponse.json({ message: 'Event added successfully' }, { status: 200 });
    } catch (error) {
        console.error('Failed to add event:', (error as Error).message);
        return NextResponse.json({ message: 'Failed to add event', error: (error as Error).message }, { status: 500 });
    }
}
