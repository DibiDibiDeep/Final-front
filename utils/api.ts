type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface FetchOptions extends Omit<RequestInit, 'method' | 'body'> {
    method: HttpMethod;
    body?: BodyInit | Record<string, any> | null;
    timeout?: number;
}

export async function fetchWithAuth(url: string, token: string, options: FetchOptions) {
    if (!token) {
        throw new Error('No JWT token provided');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || 10000);

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