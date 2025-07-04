import { NextResponse } from 'next/server';

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
  cacheDuration: 0, // キャッシュ無効化（リアルタイム性を最優先）
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get('teamId');
    const forceRefresh = searchParams.get('refresh') === 'true';

    if (teamId !== 'giikuHaku-2025') {
      return NextResponse.json(
        { error: 'イベント用のチームIDではありません' },
        { status: 400 }
      );
    }

    const now = Date.now();
    if (
      !forceRefresh &&
      eventCache.foods &&
      now - eventCache.lastUpdated < eventCache.cacheDuration
    ) {
      return NextResponse.json({
        foods: eventCache.foods,
        cached: true,
        lastUpdated: eventCache.lastUpdated,
      });
    }

    const foodsSnapshot = await adminDb
      .collection('foods')
      .where('teamId', '==', teamId)
      .where('isArchived', '==', false)
      .get();

    const foods: FoodData[] = foodsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as FoodData[];

    foods.sort((a, b) => {
      const aTime = a.registeredAt?.seconds || 0;
      const bTime = b.registeredAt?.seconds || 0;
      return bTime - aTime;
    });

    eventCache.foods = foods;
    eventCache.lastUpdated = now;

    return NextResponse.json({
      foods,
      cached: false,
      lastUpdated: now,
    });
  } catch (_error: unknown) {
    if (_error instanceof Error) {
      return NextResponse.json(
        { error: '食品データの取得に失敗しました' },
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

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get('teamId');
    const foodData = await req.json();

    if (teamId !== 'giikuHaku-2025') {
      return NextResponse.json(
        { error: 'イベント用のチームIDではありません' },
        { status: 400 }
      );
    }

    const foodRef = await adminDb.collection('foods').add({
      name: foodData.name,
      quantity: Number(foodData.quantity) || 1,
      expiryDate: foodData.expiryDate,
      isArchived: false,
      category: foodData.category || 'その他',
      registeredAt: new Date(),
      teamId,
      uid: `event-anonymous-${Date.now()}`,
      userName: 'イベント参加者',
      amount: null,
      purchaseLocation: null,
      label: null,
      storageLocation: foodData.location || '未設定',
    });

    eventCache.foods = null;
    eventCache.lastUpdated = 0;

    return NextResponse.json({
      success: true,
      foodId: foodRef.id,
      message: '食品を追加しました',
    });
  } catch (_error: unknown) {
    if (_error instanceof Error) {
      return NextResponse.json(
        { error: '食品の追加に失敗しました' },
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
