// src/app/api/auth/session/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-utils';

export async function GET() {
  const session = await getServerSession();

  if (session?.user) {
    return NextResponse.json({ user: session.user });
  }
  
  return NextResponse.json({ user: null });
}
