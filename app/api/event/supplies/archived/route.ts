import { NextResponse, type NextRequest } from 'next/server';

import { adminDb } from '@/utils/firebase/admin';

interface Supply {
  id: string;
  name: string;
  quantity: number;
  expiryDate: string;
  storageLocation: string;
  category: string;
  notes?: string;
  registeredAt: {
    seconds: number;
    nanoseconds: number;
  };
  uid: string;
  userName?: string;
  isArchived?: boolean;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');

    if (!teamId) {
      return NextResponse.json(
        { error: 'チームIDが必要です' },
        { status: 400 }
      );
    }

    if (teamId !== 'giikuHaku-2025') {
      return NextResponse.json(
        { error: 'イベント用のチームIDではありません' },
        { status: 400 }
      );
    }

    const suppliesSnapshot = await adminDb
      .collection('supplies')
      .where('teamId', '==', teamId)
      .where('isArchived', '==', true)
      .get();

    const supplies: Supply[] = suppliesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Supply[];

    return NextResponse.json({ supplies });
  } catch (_error) {
    return NextResponse.json(
      { error: 'アーカイブ済み備蓄品の取得に失敗しました' },
      { status: 500 }
    );
  }
}
