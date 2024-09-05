import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import axios from 'axios';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8080';
const HEADERS = { 'Content-Type': 'application/json' };

// 이벤트 단일 수정
export async function PUT(request: NextRequest, { params }: { params: { slug: number } }) {
    try {
        const { title, description, date, location } = await request.json();

        // 데이터 확인용 로그
        console.log({ id: params.slug, title, description, date, location });

        await axios.put(`${BACKEND_API_URL}/api/calendars/${params.slug}`, {
            title,
            description,
            date,
            location
        }, { headers: HEADERS });

        return NextResponse.json({ message: 'Event updated successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error updating event:', error);
        return NextResponse.json({ message: 'Failed to update event', error: (error as Error).message }, { status: 500 });
    }
}

// 이벤트 단일 삭제
export async function DELETE(request: NextRequest, { params }: { params: { slug: number } }) {
    try {
        await axios.delete(`${BACKEND_API_URL}/api/calendars/${params.slug}`, { headers: HEADERS });

        return NextResponse.json({ message: 'Event deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting event:', error);
        return NextResponse.json({ message: 'Failed to delete event', error: (error as Error).message }, { status: 500 });
    }
}
