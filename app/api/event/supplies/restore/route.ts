import { NextResponse, type NextRequest } from 'next/server';

import { adminDb } from '@/utils/firebase/admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { supplyId, teamId } = body;

    if (!supplyId || !teamId) {
      return NextResponse.json(
        { error: '備蓄品IDとチームIDが必要です' },
        { status: 400 }
      );
    }

    if (teamId !== 'giikuHaku-2025') {
      return NextResponse.json(
        { error: 'イベント用のチームIDではありません' },
        { status: 400 }
      );
    }

    const supplyDoc = await adminDb.collection('supplies').doc(supplyId).get();

    if (!supplyDoc.exists) {
      return NextResponse.json(
        { error: '備蓄品が見つかりません' },
        { status: 404 }
      );
    }

    const suppliesData = supplyDoc.data();

    if (suppliesData?.teamId !== teamId) {
      return NextResponse.json(
        { error: 'アクセス権限がありません' },
        { status: 403 }
      );
    }

    await adminDb.collection('supplies').doc(supplyId).update({
      isArchived: false,
    });

    return NextResponse.json({
      success: true,
      message: '備蓄品をリストに戻しました',
    });
  } catch (_error) {
    return NextResponse.json(
      { error: '備蓄品の復元に失敗しました' },
      { status: 500 }
    );
  }
}
