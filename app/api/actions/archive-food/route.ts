// app/api/actions/archive-food/route.ts
import { FieldValue } from 'firebase-admin/firestore';
import { NextResponse } from 'next/server';

import { adminAuth, adminDb } from '@/utils/firebase/admin';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header missing or malformed' },
        { status: 401 }
      );
    }
    const idToken = authHeader.split('Bearer ')[1];
    try {
      await adminAuth.verifyIdToken(idToken);
    } catch (_error) {
      return NextResponse.json(
        { error: 'Invalid or expired ID token' },
        { status: 403 }
      );
    }

    const { foodId } = await req.json();

    if (!foodId) {
      return NextResponse.json(
        { error: 'Food ID is required' },
        { status: 400 }
      );
    }

    const foodDocRef = adminDb.collection('foods').doc(foodId);

    await foodDocRef.update({
      isArchived: true,
      archivedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      message: `Food item ${foodId} archived successfully.`,
    });
  } catch (_error: unknown) {
    const errorMessage =
      _error instanceof Error
        ? _error?.message
        : 'Failed to archive food item.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
