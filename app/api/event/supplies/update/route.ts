import { NextResponse, type NextRequest } from 'next/server';

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
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      supplyId,
      name,
      quantity,
      expiryDate,
      category,
      unit,
      amount,
      purchaseLocation,
      label,
      storageLocation,
      notes,
      updatedBy,
    } = body;

    const teamId = 'giikuHaku-2025';

    if (!supplyId || !name || !quantity || !expiryDate || !category || !unit) {
      return NextResponse.json(
        { error: '必須フィールドが不足しています' },
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

    await adminDb
      .collection('supplies')
      .doc(supplyId)
      .update({
        name,
        quantity: Number(quantity),
        expiryDate,
        category,
        unit,
        amount: amount !== undefined ? Number(amount) : null,
        purchaseLocation: purchaseLocation || null,
        label: label || null,
        storageLocation: storageLocation || '未設定',
        notes: notes || null,
        updatedAt: new Date(),
        updatedBy: updatedBy || 'イベント参加者',
      });

    eventCache.supplies = null;
    eventCache.lastUpdated = 0;

    return NextResponse.json({
      success: true,
      message: '備蓄品を更新しました',
    });
  } catch (_error) {
    return NextResponse.json(
      { error: '備蓄品の更新に失敗しました' },
      { status: 500 }
    );
  }
}
