import { NextResponse, type NextRequest } from 'next/server';

import { adminDb } from '@/utils/firebase/admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { foodId, teamId } = body;

    if (!foodId || !teamId) {
      return NextResponse.json(
        { error: '食品IDとチームIDが必要です' },
        { status: 400 }
      );
    }

    if (teamId !== 'giikuHaku-2025') {
      return NextResponse.json(
        { error: 'イベント用のチームIDではありません' },
        { status: 400 }
      );
    }

    const foodDoc = await adminDb.collection('foods').doc(foodId).get();

    if (!foodDoc.exists) {
      return NextResponse.json(
        { error: '食品が見つかりません' },
        { status: 404 }
      );
    }

    const foodData = foodDoc.data();

    if (foodData?.teamId !== teamId) {
      return NextResponse.json(
        { error: 'アクセス権限がありません' },
        { status: 403 }
      );
    }

    await adminDb.collection('foods').doc(foodId).update({
      isArchived: false,
    });

    return NextResponse.json({
      success: true,
      message: '食品をリストに戻しました',
    });
  } catch (_error) {
    return NextResponse.json(
      { error: '食品の復元に失敗しました' },
      { status: 500 }
    );
  }
}
