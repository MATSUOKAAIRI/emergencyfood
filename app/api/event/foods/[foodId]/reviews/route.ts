import { NextResponse, type NextRequest } from 'next/server';

import { adminDb } from '@/utils/firebase/admin';

interface RouteParams {
  params: Promise<{
    foodId: string;
  }>;
}

interface Review {
  id: string;
  foodId: string;
  teamId: string;
  content: string;
  userName: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { foodId } = await params;
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');

    if (!teamId) {
      return NextResponse.json(
        { error: 'チームIDが必要です' },
        { status: 400 }
      );
    }

    const reviewsSnapshot = await adminDb
      .collection('foodReviews')
      .where('foodId', '==', foodId)
      .where('teamId', '==', teamId)
      .get();

    const reviews: Review[] = reviewsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Review[];

    // 日付順にソート（新しい順）
    reviews.sort((a, b) => {
      const dateA = a.createdAt?.seconds || 0;
      const dateB = b.createdAt?.seconds || 0;
      return dateB - dateA;
    });

    return NextResponse.json({ reviews });
  } catch (_error) {
    // console.error removed
    return NextResponse.json(
      { error: 'レビューの取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { foodId } = await params;
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');
    const body = await request.json();
    const { content } = body;

    if (!teamId) {
      return NextResponse.json(
        { error: 'チームIDが必要です' },
        { status: 400 }
      );
    }

    if (!content) {
      return NextResponse.json(
        { error: 'レビュー内容が必要です' },
        { status: 400 }
      );
    }

    // 食品が存在するかチェック
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

    // レビューを追加
    const reviewRef = await adminDb.collection('foodReviews').add({
      foodId,
      teamId,
      content,
      userName: 'イベント参加者',
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      reviewId: reviewRef.id,
      message: 'レビューを投稿しました',
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'レビューの投稿に失敗しました' },
      { status: 500 }
    );
  }
}
