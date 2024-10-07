import Cookies from 'js-cookie';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface FetchOptions extends Omit<RequestInit, 'method' | 'body'> {
    method: HttpMethod;
    body?: BodyInit | Record<string, any> | null;
    timeout?: number;
}

export async function fetchWithAuth(url: string, options: FetchOptions, req?: any) {
    let token: string | undefined;

    if (typeof window !== 'undefined') {
        // 클라이언트 사이드
        token = Cookies.get('authToken');
    } else {
        // 서버 사이드
        token = req?.cookies?.token;
    }

    if (!token) {
        throw new Error('No JWT token found');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || 100000);

    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${token}`);

    let bodyToSend: BodyInit | null | undefined;
    if (options.body) {
        if (options.body instanceof FormData) {
            bodyToSend = options.body;
            // FormData를 사용할 때는 Content-Type 헤더를 설정하지 않습니다.
            headers.delete('Content-Type');
        } else if (options.body instanceof URLSearchParams || typeof options.body === 'string') {
            bodyToSend = options.body;
        } else if (typeof options.body === 'object') {
            bodyToSend = JSON.stringify(options.body);
            if (!headers.has('Content-Type')) {
                headers.set('Content-Type', 'application/json');
            }
        } else {
            throw new Error('Unsupported body type');
        }
    }

    const fetchOptions: RequestInit = {
        ...options,
        headers,
        body: bodyToSend,
        signal: controller.signal,
    };

    try {
        const response = await fetch(url, fetchOptions);
        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorMessage}`);
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