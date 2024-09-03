import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // GET 요청 처리 로직
  return NextResponse.json({ message: 'Hello from GET' });
}

export async function POST(request: Request) {
  // POST 요청 처리 로직
  const body = await request.json();
  return NextResponse.json({ message: 'Hello from POST', received: body });
}