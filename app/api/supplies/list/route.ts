import { NextResponse } from 'next/server';

import { adminAuth, adminDb } from '@/utils/firebase/admin';

export async function GET(req: Request) {
  try {
    // 認証チェック
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header missing or malformed' },
        { status: 401 }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];

    try {
      await adminAuth.verifyIdToken(idToken);
    } catch (_error) {
      return NextResponse.json(
        { error: 'Invalid or expired ID token' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get('teamId');
    const isArchived = searchParams.get('isArchived') === 'true';

    if (!teamId) {
      return NextResponse.json(
        { error: 'チームIDが必要です' },
        { status: 400 }
      );
    }

    // 備蓄品を取得
    const suppliesSnapshot = await adminDb
      .collection('supplies')
      .where('teamId', '==', teamId)
      .where('isArchived', '==', isArchived)
      .get();

    const supplies = suppliesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      supplies,
    });
  } catch (_error: unknown) {
    console.error('Supplies list fetch error:', _error);
    if (_error instanceof Error) {
      return NextResponse.json(
        { error: '備蓄品リストの取得に失敗しました' },
        { status: 500 }
      );
    } else {
      return NextResponse.json(
        { error: '不明なエラーが発生しました' },
        { status: 500 }
      );
    }
  }
}
