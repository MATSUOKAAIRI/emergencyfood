import { NextResponse } from 'next/server';

import { adminAuth, adminDb } from '@/utils/firebase/admin';
// import { getAuth } from 'firebase-admin/auth';
// import { cert, getApps, initializeApp } from 'firebase-admin/app';
// //import { db } from '@/utils/firebase-admin';

// if (!getApps().length) {
//   initializeApp({
//     credential: cert({
//       projectId: process.env.FIREBASE_PROJECT_ID,
//       clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
//       privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
//     }),
//   });
// }

export async function POST(req: Request) {
  const { idToken } = await req.json();
  if (!idToken)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    const uid = decoded.uid;

    const userDoc = await adminDb.collection('users').doc(uid).get();
    const teamId = userDoc.data()?.teamId;

    if (!teamId) {
      return NextResponse.json(
        { error: 'teamId が存在しません' },
        { status: 400 }
      );
    }

    await adminAuth.setCustomUserClaims(uid, { teamId });

    return NextResponse.json({ message: 'カスタムクレームが設定されました' });
  } catch (error: any) {
    console.error('Error setting team claim:', error);
    return NextResponse.json(
      { error: error.message || 'カスタムクレームの設定に失敗しました' },
      { status: 500 }
    );
  }
}
