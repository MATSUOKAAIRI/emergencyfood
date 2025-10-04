import { NextResponse } from 'next/server';

import { adminDb } from '@/utils/firebase/admin';

interface SupplyData {
  id: string;
  name: string;
  quantity: number;
  expiryDate: string;
  isArchived: boolean;
  category: string;
  unit: string;
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
  supplies: null as SupplyData[] | null,
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
      eventCache.supplies &&
      now - eventCache.lastUpdated < eventCache.cacheDuration
    ) {
      return NextResponse.json({
        supplies: eventCache.supplies,
        cached: true,
        lastUpdated: eventCache.lastUpdated,
      });
    }

    const suppliesSnapshot = await adminDb
      .collection('supplies')
      .where('teamId', '==', teamId)
      .where('isArchived', '==', false)
      .get();

    const supplies: SupplyData[] = suppliesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as SupplyData[];

    supplies.sort((a, b) => {
      const aTime = a.registeredAt?.seconds || 0;
      const bTime = b.registeredAt?.seconds || 0;
      return bTime - aTime;
    });

    eventCache.supplies = supplies;
    eventCache.lastUpdated = now;

    return NextResponse.json({
      supplies,
      cached: false,
      lastUpdated: now,
    });
  } catch (_error: unknown) {
    if (_error instanceof Error) {
      return NextResponse.json(
        { error: '備蓄品データの取得に失敗しました' },
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
    const suppliesData = await req.json();

    if (teamId !== 'giikuHaku-2025') {
      return NextResponse.json(
        { error: 'イベント用のチームIDではありません' },
        { status: 400 }
      );
    }

    const supplyRef = await adminDb.collection('supplies').add({
      name: suppliesData.name,
      quantity: Number(suppliesData.quantity) || 1,
      expiryDate: suppliesData.expiryDate,
      isArchived: false,
      category: suppliesData.category || 'その他',
      unit: suppliesData.unit || '個',
      registeredAt: new Date(),
      teamId,
      uid: `event-anonymous-${Date.now()}`,
      userName: 'イベント参加者',
      amount: null,
      purchaseLocation: null,
      label: null,
      storageLocation: suppliesData.location || '未設定',
    });

    eventCache.supplies = null;
    eventCache.lastUpdated = 0;

    return NextResponse.json({
      success: true,
      supplyId: supplyRef.id,
      message: '備蓄品を追加しました',
    });
  } catch (_error: unknown) {
    if (_error instanceof Error) {
      return NextResponse.json(
        { error: '備蓄品の追加に失敗しました' },
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
