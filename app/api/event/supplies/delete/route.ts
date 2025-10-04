import { NextResponse, type NextRequest } from 'next/server';

import { adminDb } from '@/utils/firebase/admin';

interface SupplyData {
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
  supplies: null as SupplyData[] | null,
  lastUpdated: 0,
};

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

    const batch = adminDb.batch();

    batch.delete(adminDb.collection('supplies').doc(supplyId));

    const reviewsSnapshot = await adminDb
      .collection('supplyReviews')
      .where('supplyId', '==', supplyId)
      .get();

    reviewsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    eventCache.supplies = null;
    eventCache.lastUpdated = 0;

    return NextResponse.json({
      success: true,
      message: '備蓄品を削除しました',
    });
  } catch (_error) {
    return NextResponse.json(
      { error: '備蓄品の削除に失敗しました' },
      { status: 500 }
    );
  }
}
