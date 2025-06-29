// app/api/actions/archive-food/route.ts
import * as admin from 'firebase-admin';
import { NextRequest, NextResponse } from 'next/server';

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
    } catch (error) {
      console.error('ID Token verification failed:', error);
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

    await foodDocRef.update({
      isArchived: true,
      archivedAt: admin.firestore.FieldValue.serverTimestamp(), // アーカイブ日時も記録すると便利
    });

    return NextResponse.json({
      message: `Food item ${foodId} archived successfully.`,
    });
  } catch (error: any) {
    console.error('API Error in archive-food:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to archive food item.' },
      { status: 500 }
    );
  }
}
