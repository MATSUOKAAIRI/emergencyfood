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
    const {
      foodId,
      name,
      quantity,
      expiryDate,
      category,
      amount,
      purchaseLocation,
      label,
      storageLocation,
      notes,
      updatedBy,
    } = body;

    const teamId = 'giikuHaku-2025';

    if (!foodId || !name || !quantity || !expiryDate || !category) {
      return NextResponse.json(
        { error: '必須フィールドが不足しています' },
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

    await adminDb
      .collection('foods')
      .doc(foodId)
      .update({
        name,
        quantity: Number(quantity),
        expiryDate,
        category,
        amount: amount !== undefined ? Number(amount) : null,
        purchaseLocation: purchaseLocation || null,
        label: label || null,
        storageLocation: storageLocation || '未設定',
        notes: notes || null,
        updatedAt: new Date(),
        updatedBy: updatedBy || 'イベント参加者',
      });

    eventCache.foods = null;
    eventCache.lastUpdated = 0;

    return NextResponse.json({
      success: true,
      message: '食品を更新しました',
    });
  } catch (_error) {
    return NextResponse.json(
      { error: '食品の更新に失敗しました' },
      { status: 500 }
    );
  }
}
