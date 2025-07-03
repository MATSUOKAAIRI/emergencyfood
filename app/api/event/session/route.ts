import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const eventSession = cookieStore.get('event-session');

    if (!eventSession) {
      return NextResponse.json({ eventUser: null });
    }

    const sessionData = JSON.parse(eventSession.value);

    const expiresAt = new Date(sessionData.expiresAt);
    if (expiresAt <= new Date()) {
      return NextResponse.json({ eventUser: null });
    }

    return NextResponse.json({ eventUser: sessionData });
  } catch (_error) {
    return NextResponse.json({ eventUser: null });
  }
}
