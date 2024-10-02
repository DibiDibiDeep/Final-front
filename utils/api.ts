// utils/api.ts

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface FetchOptions extends Omit<RequestInit, 'method' | 'body'> {
    method: HttpMethod;
    body?: BodyInit | Record<string, any> | null;
}

export async function fetchWithAuth(url: string, token: string, options: FetchOptions) {
    if (!token) {
        throw new Error('No JWT token provided');
    }

    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${token}`);
    headers.set('Content-Type', 'application/json');

    const fetchOptions: RequestInit = {
        ...options,
        headers,
        body: options.body instanceof Object ? JSON.stringify(options.body) : options.body,
    };

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
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