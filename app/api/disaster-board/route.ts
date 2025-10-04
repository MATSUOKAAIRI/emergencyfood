import type { DisasterBoardData } from '@/types/forms';
import { adminAuth, adminDb } from '@/utils/firebase/admin';
import { NextRequest, NextResponse } from 'next/server';

// GET: 災害用伝言板データの取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');

    if (!teamId) {
      return NextResponse.json(
        { success: false, error: 'チームIDが必要です' },
        { status: 400 }
      );
    }

    // 認証チェック
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // チームメンバーシップの確認
    const teamDoc = await adminDb.collection('teams').doc(teamId).get();
    if (!teamDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'チームが見つかりません' },
        { status: 404 }
      );
    }

    const teamData = teamDoc.data();
    if (!teamData?.members?.includes(uid)) {
      return NextResponse.json(
        { success: false, error: 'このチームへのアクセス権限がありません' },
        { status: 403 }
      );
    }

    // 災害用伝言板データの取得
    const disasterBoardDoc = await adminDb
      .collection('disaster-boards')
      .doc(teamId)
      .get();

    if (!disasterBoardDoc.exists) {
      // データが存在しない場合は空のデータを返す
      return NextResponse.json({
        success: true,
        data: null,
      });
    }

    const rawData = disasterBoardDoc.data();

    // Firestore Timestampを適切にDateに変換
    const data: DisasterBoardData = {
      ...rawData,
      lastUpdated: rawData?.lastUpdated?.toDate
        ? rawData.lastUpdated.toDate()
        : rawData?.lastUpdated,
      lastUpdatedBy: rawData?.lastUpdatedBy || undefined,
    } as DisasterBoardData;

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('災害用伝言板データの取得に失敗:', error);
    return NextResponse.json(
      { success: false, error: 'データの取得に失敗しました' },
      { status: 500 }
    );
  }
}

// POST: 災害用伝言板データの保存
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { teamId, ...disasterBoardData } = body as DisasterBoardData & {
      teamId: string;
    };

    if (!teamId) {
      return NextResponse.json(
        { success: false, error: 'チームIDが必要です' },
        { status: 400 }
      );
    }

    // 認証チェック
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // チームメンバーシップの確認
    const teamDoc = await adminDb.collection('teams').doc(teamId).get();
    if (!teamDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'チームが見つかりません' },
        { status: 404 }
      );
    }

    const teamData = teamDoc.data();
    if (!teamData?.members?.includes(uid)) {
      return NextResponse.json(
        { success: false, error: 'このチームへのアクセス権限がありません' },
        { status: 403 }
      );
    }

    // データの検証
    if (!disasterBoardData || typeof disasterBoardData !== 'object') {
      return NextResponse.json(
        { success: false, error: '無効なデータです' },
        { status: 400 }
      );
    }

    // ユーザー情報を取得して最終更新者名を設定
    let lastUpdatedBy = decodedToken.email || 'Unknown User';
    try {
      const userRecord = await adminAuth.getUser(uid);
      lastUpdatedBy =
        userRecord.displayName || userRecord.email || 'Unknown User';
    } catch (error) {
      console.warn('ユーザー情報の取得に失敗:', error);
      // デフォルト値を使用
    }

    // 災害用伝言板データの保存
    const saveData: DisasterBoardData = {
      ...disasterBoardData,
      updatedAt: new Date(),
      lastUpdated: new Date(),
      lastUpdatedBy,
    };

    await adminDb
      .collection('disaster-boards')
      .doc(teamId)
      .set(saveData, { merge: true });

    return NextResponse.json({
      success: true,
      message: '災害用伝言板データを保存しました',
    });
  } catch (error) {
    console.error('災害用伝言板データの保存に失敗:', error);
    return NextResponse.json(
      { success: false, error: 'データの保存に失敗しました' },
      { status: 500 }
    );
  }
}
