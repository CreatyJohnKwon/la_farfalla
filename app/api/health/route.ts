import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // 서버가 살아있다는 사실만 알림
  return NextResponse.json({ status: 'ok' }, { status: 200 });
}