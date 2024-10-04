import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { fetchWithAuth } from '@/utils/api';
import { useAuth } from '@/hooks/useAuth'; 

const { token, error: authError } = useAuth();

const BACKEND_API_URL = process.env.BACKEND_API_URL;

// 이벤트 단일 수정
export async function PUT(request: NextRequest, { params }: { params: { slug: number } }) {
    try {
        if (!token) return;
        const { title, description, date, location } = await request.json();

        // 데이터 확인용 로그
        console.log({ id: params.slug, title, description, date, location });

        await fetchWithAuth(`${BACKEND_API_URL}/api/calendars/${params.slug}`, token, {
            method: 'PUT',
            body: { title, description, date, location }
        });

        return NextResponse.json({ message: 'Event updated successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error updating event:', error);
        return NextResponse.json({ message: 'Failed to update event', error: (error as Error).message }, { status: 500 });
    }
}

// 이벤트 단일 삭제
export async function DELETE(request: NextRequest, { params }: { params: { slug: number } }) {
    try {
        if (!token) return;
        await fetchWithAuth(`${BACKEND_API_URL}/api/calendars/${params.slug}`, token, {method: 'DELETE'});

        return NextResponse.json({ message: 'Event deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting event:', error);
        return NextResponse.json({ message: 'Failed to delete event', error: (error as Error).message }, { status: 500 });
    }
}
