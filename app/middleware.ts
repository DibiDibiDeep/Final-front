import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify, JWTPayload } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;

interface CustomJWTPayload extends JWTPayload {
    userId: number;
    email: string;
}

async function verifyToken(token: string): Promise<CustomJWTPayload> {
    try {
        const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
        return payload as CustomJWTPayload;
    } catch (error) {
        console.error('Token verification failed:', error);
        throw new Error('Invalid token');
    }
}

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const protectedPaths = ['/home', '/diary', '/story', '/profile'];
    const isProtectedPath = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path));

    if (isProtectedPath) {
        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        try {
            await verifyToken(token);
            return NextResponse.next();
        } catch (error) {
            console.error('Token verification error:', error);
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};