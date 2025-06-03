// import { getAuth } from 'firebase-admin/auth';
// import { cert, getApps, initializeApp } from 'firebase-admin/app';
// import { NextResponse } from 'next/server';
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

 export async function POST(req: Request) {}
//   const { idToken } = await req.json();
//   if (!idToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

//   const auth = getAuth();
//   const decoded = await auth.verifyIdToken(idToken);
//   const uid = decoded.uid;

//   // Firestore から teamId を取得
//   const userDoc = await db.collection('users').doc(uid).get();
//   const teamId = userDoc.data()?.teamId;

//   if (!teamId) {
//     return NextResponse.json({ error: 'teamId が存在しません' }, { status: 400 });
//   }

//   // カスタムクレームを設定
//   await auth.setCustomUserClaims(uid, { teamId });

//   return NextResponse.json({ message: 'カスタムクレームが設定されました' });
// }
