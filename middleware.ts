import { NextRequest, NextResponse } from 'next/server';
import { fetchWithAuth } from './utils/api';
import { getAuthToken } from './utils/authUtils';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

async function verifyToken(token: string, req: NextRequest): Promise<boolean> {
    try {
        // console.log('Sending token verification request:', `${BACKEND_API_URL}/api/auth/validate-token`);
        const response = await fetchWithAuth(
            `${BACKEND_API_URL}/api/auth/validate-token`,
            {
                method: 'POST',
                body: { token }
            },
            req
        );
        // console.log('Token verification response:', response);
        return response.isValid;
    } catch (error) {
        // console.error('Token verification failed:', error);
        return false;
    }
}

// 미들웨어에서 사용할 getAuthToken 함수
function getAuthTokenFromRequest(request: NextRequest): string | undefined {
    return request.cookies.get('authToken')?.value;
}

export async function middleware(request: NextRequest) {
    const token = getAuthTokenFromRequest(request);
    const protectedPaths = ['/home', '/diary', '/story', '/profile', '/chatbot', '/initialSettings', '/addEvent', '/calendarapp', '/editEvent', '/editMemo', '/notice'];
    const isProtectedPath = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path));

    // 로그인 페이지 처리
    if (request.nextUrl.pathname === '/login') {
        if (token) {
            try {
                const isValid = await verifyToken(token, request);
                if (isValid) {
                    // console.log('Valid token found on login page, redirecting to /home');
                    return NextResponse.redirect(new URL('/home', request.url));
                }
            } catch (error) {
                // console.error('Token verification error on login page:', error);
            }
        }
        return NextResponse.next();
    }

    // 보호된 경로 처리
    if (isProtectedPath) {
        // console.log('Checking token for protected path:', token);
        if (!token) {
            // console.log('No token found, redirecting to login');
            return NextResponse.redirect(new URL('/login', request.url));
        }
        try {
            const isValid = await verifyToken(token, request);
            if (!isValid) {
                // console.log('Invalid token, redirecting to login');
                const response = NextResponse.redirect(new URL('/login', request.url));
                response.cookies.delete('authToken');
                return response;
            }
            // console.log('Token verified successfully');
            return NextResponse.next();
        } catch (error) {
            // console.error('Token verification error:', error);
            const response = NextResponse.redirect(new URL('/login', request.url));
            response.cookies.delete('authToken');
            return response;
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};