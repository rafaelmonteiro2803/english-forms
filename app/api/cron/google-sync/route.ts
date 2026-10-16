import { NextResponse, type NextRequest } from 'next/server';
import { syncAll } from '@/lib/google/sync';

// Vercel Cron calls this every 10 minutes (see vercel.json) with
// "Authorization: Bearer $CRON_SECRET".
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ results: await syncAll() });
}
