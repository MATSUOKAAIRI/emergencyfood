import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { adminAuth, adminDb } from '@/utils/firebase/admin';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const userId = decodedToken.uid;

    const { foodId } = await request.json();

    if (!foodId) {
      return NextResponse.json({ error: '食品IDが必要です' }, { status: 400 });
    }

    const foodDoc = await adminDb.collection('foods').doc(foodId).get();
    if (!foodDoc.exists) {
      return NextResponse.json(
        { error: '食品が見つかりません' },
        { status: 404 }
      );
    }

    const foodData = foodDoc.data();
    if (!foodData) {
      return NextResponse.json(
        { error: '食品データが見つかりません' },
        { status: 404 }
      );
    }

    const teamId = foodData.teamId;

    const teamDoc = await adminDb.collection('teams').doc(teamId).get();
    if (!teamDoc.exists) {
      return NextResponse.json(
        { error: 'チームが見つかりません' },
        { status: 404 }
      );
    }

    const teamData = teamDoc.data();
    if (!teamData) {
      return NextResponse.json(
        { error: 'チームデータが見つかりません' },
        { status: 404 }
      );
    }

    const ownerId = teamData.ownerId || teamData.createdBy;
    const admins = teamData.admins || [ownerId];

    const isOwner = ownerId === userId;
    const isAdmin = admins.includes(userId);

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: '管理者権限が必要です' },
        { status: 403 }
      );
    }

    await adminDb.collection('foods').doc(foodId).delete();

    const reviewsQuery = await adminDb
      .collection('reviews')
      .where('foodId', '==', foodId)
      .get();
    const deletePromises = reviewsQuery.docs.map(doc => doc.ref.delete());
    await Promise.all(deletePromises);

    return NextResponse.json({
      success: true,
      message: '食品を削除しました',
    });
  } catch (error) {
    console.error('Error deleting food:', error);
    return NextResponse.json(
      { error: '食品の削除に失敗しました' },
      { status: 500 }
    );
  }
}
