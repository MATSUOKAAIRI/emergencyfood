import { NextResponse } from 'next/server';

import { adminDb } from '@/utils/firebase/admin';

const EVENT_CONFIG = {
  TEAM_ID: process.env.EVENT_TEAM_ID || 'giikuHaku-2025',
  PASSWORD: process.env.EVENT_PASSWORD || 'event-password-2024',
  SESSION_SECRET: process.env.EVENT_SESSION_SECRET || 'event-session-secret',
};

export async function POST(req: Request) {
  try {
    const { eventPassword } = await req.json();

    if (!eventPassword) {
      return NextResponse.json(
        { error: 'パスワードを入力してください' },
        { status: 400 }
      );
    }

    if (eventPassword !== EVENT_CONFIG.PASSWORD) {
      return NextResponse.json(
        { error: 'パスワードが正しくありません' },
        { status: 401 }
      );
    }

    const teamRef = adminDb.collection('teams').doc(EVENT_CONFIG.TEAM_ID);
    const teamDoc = await teamRef.get();

    if (!teamDoc.exists) {
      await teamRef.set({
        name: 'イベント用チーム',
        password: EVENT_CONFIG.PASSWORD,
        members: [],
        admins: [],
        ownerId: 'event-system',
        createdAt: new Date(),
        createdBy: 'event-system',
      });
    }

    const eventUserId = `event-anonymous-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const sessionData = {
      eventUserId,
      name: 'イベント参加者',
      teamId: EVENT_CONFIG.TEAM_ID,
      isEventUser: true,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    const response = NextResponse.json({
      success: true,
      teamId: EVENT_CONFIG.TEAM_ID,
      eventUserId,
      message: 'イベントに参加しました',
    });

    response.cookies.set('event-session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60,
    });

    return response;
  } catch (_error: unknown) {
    return NextResponse.json(
      { error: 'イベント参加に失敗しました' },
      { status: 500 }
    );
  }
}
