import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // DB 연결이나 다른 복잡한 로직 없이, 서버가 살아있다는 사실만 알림
  return NextResponse.json({ status: 'ok' }, { status: 200 });
}