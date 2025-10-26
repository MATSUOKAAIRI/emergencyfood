import { NextResponse, type NextRequest } from 'next/server';

import type { DisasterBoardData } from '@/types/forms';
import { adminAuth, adminDb } from '@/utils/firebase/admin';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const teamId = decodedToken.teamId as string;

    if (!teamId) {
      return NextResponse.json(
        { error: 'チームIDが必要です' },
        { status: 400 }
      );
    }

    const disasterBoardDoc = await adminDb
      .collection('disaster-boards')
      .doc(teamId)
      .get();

    if (!disasterBoardDoc.exists) {
      return NextResponse.json({ data: null });
    }

    const data = disasterBoardDoc.data();
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Disaster board fetch error:', error);
    return NextResponse.json(
      { error: '災害用伝言板の取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const teamId = decodedToken.teamId as string;

    if (!teamId) {
      return NextResponse.json(
        { error: 'チームIDが必要です' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const disasterBoardData: DisasterBoardData = {
      evacuationSites: body.evacuationSites || [],
      evacuationRoutes: body.evacuationRoutes || [],
      safetyMethods: body.safetyMethods || [],
      familyAgreements: body.familyAgreements || [],
      useDisasterDial: body.useDisasterDial ?? true,
      lastUpdated: new Date(),
      lastUpdatedBy: decodedToken.name || decodedToken.email || 'ユーザー',
    };

    await adminDb
      .collection('disaster-boards')
      .doc(teamId)
      .set(disasterBoardData, { merge: true });

    return NextResponse.json({
      success: true,
      message: '災害用伝言板の情報を保存しました',
    });
  } catch (error) {
    console.error('Disaster board save error:', error);
    return NextResponse.json(
      { error: '災害用伝言板の保存に失敗しました' },
      { status: 500 }
    );
  }
}
