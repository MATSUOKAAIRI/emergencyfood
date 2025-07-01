// app/api/actions/restore-food/route.ts
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
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (_error) {
      return NextResponse.json(
        { error: 'Invalid or expired ID token' },
        { status: 403 }
      );
    }

    const uid = decodedToken.uid;
    const { foodId } = await req.json();

    if (!foodId) {
      return NextResponse.json(
        { error: 'Food ID is required' },
        { status: 400 }
      );
    }

    const foodDocRef = adminDb.collection('foods').doc(foodId);

    const foodDocSnap = await foodDocRef.get();
    if (!foodDocSnap.exists) {
      return NextResponse.json(
        { error: 'Food item not found' },
        { status: 404 }
      );
    }
    const existingFoodData = foodDocSnap.data();

    if (
      existingFoodData?.uid !== uid ||
      existingFoodData?.teamId !== decodedToken.teamId
    ) {
      return NextResponse.json(
        {
          error:
            'Unauthorized: You do not own this food item or belong to this team.',
        },
        { status: 403 }
      );
    }

    await foodDocRef.update({
      isArchived: false,
      restoredAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      message: `Food item ${foodId} restored successfully.`,
    });
  } catch (_error: unknown) {
    const errorMessage =
      _error instanceof Error ? _error.message : 'Failed to restore food item.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
