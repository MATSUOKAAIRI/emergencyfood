import { NextResponse, type NextRequest } from 'next/server';

import { adminDb } from '@/utils/firebase/admin';

interface FoodData {
  id: string;
  name: string;
  quantity: number;
  expiryDate: string;
  isArchived: boolean;
  category: string;
  registeredAt: { seconds: number; nanoseconds: number };
  teamId: string;
  uid: string;
  userName?: string;
  amount?: number | null;
  purchaseLocation?: string | null;
  label?: string | null;
  storageLocation?: string;
}

const eventCache = {
  foods: null as FoodData[] | null,
  lastUpdated: 0,
};

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

    const batch = adminDb.batch();

    batch.delete(adminDb.collection('foods').doc(foodId));

    const reviewsSnapshot = await adminDb
      .collection('foodReviews')
      .where('foodId', '==', foodId)
      .get();

    reviewsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    eventCache.foods = null;
    eventCache.lastUpdated = 0;

    return NextResponse.json({
      success: true,
      message: '食品を削除しました',
    });
  } catch (_error) {
    return NextResponse.json(
      { error: '食品の削除に失敗しました' },
      { status: 500 }
    );
  }
}
