// utils/api.ts

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface FetchOptions extends Omit<RequestInit, 'method' | 'body'> {
    method: HttpMethod;
    body?: BodyInit | Record<string, any> | null;
    timeout?: number; // 타임아웃 옵션 추가
}

export async function fetchWithAuth(url: string, token: string, options: FetchOptions) {
    if (!token) {
        throw new Error('No JWT token provided');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || 10000); // 기본 10초 타임아웃

    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${token}`);
    headers.set('Content-Type', 'application/json');

    const fetchOptions: RequestInit = {
        ...options,
        headers,
        body: options.body instanceof Object ? JSON.stringify(options.body) : options.body,
        signal: controller.signal,
    };

    try {
        const response = await fetch(url, fetchOptions);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                console.error('Request timed out');
                throw new Error('Request timed out');
            } else {
                console.error('Fetch error:', error.message);
                throw error;
            }
        } else {
            console.error('Unknown error:', error);
            throw new Error('Unknown error occurred');
        }
    } finally {
        clearTimeout(timeoutId);
    }
}

// 사용 예시:
// import { fetchWithAuth } from '@/utils/api';
//
// async function postEventData(token: string, eventData: { userId: number | null; babyId: number | null; title: string; startTime: string; endTime: string; location: string; }) {
//   try {
//     const data = await fetchWithAuth(`${BACKEND_API_URL}/api/calendars`, token, { 
//       method: 'POST', 
//       body: eventData 
//     });
//     console.log(data);
//   } catch (error) {
//     console.error('Error posting event data:', error);
//   }
// }