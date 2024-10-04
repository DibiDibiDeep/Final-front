import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { fetchWithAuth } from '@/utils/api';
import { useAuth } from '@/hooks/useAuth';

const { token, error: authError } = useAuth();
const BACKEND_API_URL = process.env.BACKEND_API_URL;

// 모든 일정 가져오기
export async function GET(request: NextRequest) {
    try {
        if (!token) return;
        const { data } = await fetchWithAuth(`${BACKEND_API_URL}/api/calendars`, token, {method: 'GET'});
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error('Failed to fetch events:', (error as Error).message);
        return NextResponse.json({ message: 'Failed to fetch events', error: (error as Error).message }, { status: 500 });
    }
}

// 일정 추가
export async function POST(request: NextRequest) {
    try {
        if (!token) return;
        const data = await request.json();
        console.log('Request Data:', data);

        await fetchWithAuth(`${BACKEND_API_URL}/api/calendars`, token, {method: 'POST', body: data});
        return NextResponse.json({ message: 'Event added successfully' }, { status: 200 });
    } catch (error) {
        console.error('Failed to add event:', (error as Error).message);
        return NextResponse.json({ message: 'Failed to add event', error: (error as Error).message }, { status: 500 });
    }
}
