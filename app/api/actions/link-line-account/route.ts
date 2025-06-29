// app/api/actions/link-line-account/route.ts
import { Client } from '@line/bot-sdk';
import * as admin from 'firebase-admin';
import { NextRequest, NextResponse } from 'next/server';

import { adminAuth, adminDb } from '@/utils/firebase/admin';

const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
};
const lineClient = new Client(lineConfig); // MessagingApiClient

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

    const firebaseUid = decodedToken.uid;
    const { authCode } = await req.json();

    if (!authCode) {
      return NextResponse.json(
        { error: 'Authentication code is required' },
        { status: 400 }
      );
    }

    const lineAuthCodesRef = adminDb.collection('lineAuthCodes');
    const querySnapshot = await lineAuthCodesRef
      .where('code', '==', authCode)
      .limit(1)
      .get();

    if (querySnapshot.empty) {
      return NextResponse.json(
        { error: 'Invalid or expired authentication code.' },
        { status: 400 }
      );
    }

    const authCodeDoc = querySnapshot.docs[0];
    const authCodeData = authCodeDoc.data();
    const lineUserId = authCodeDoc.id;

    const expireAt = authCodeData.expireAt as admin.firestore.Timestamp;
    if (expireAt && expireAt.toDate().getTime() < Date.now()) {
      await authCodeDoc.ref.delete();
      return NextResponse.json(
        { error: 'Authentication code has expired.' },
        { status: 400 }
      );
    }

    const userDocRef = adminDb.collection('users').doc(firebaseUid);
    await userDocRef.update({
      lineUserId: lineUserId,
      lineLinkedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await authCodeDoc.ref.delete();

    await adminAuth.setCustomUserClaims(firebaseUid, {
      ...decodedToken.claims,
      lineUserId: lineUserId,
    });

    return NextResponse.json({
      message: 'LINE account linked successfully!',
      lineUserId: lineUserId,
    });
  } catch (error: any) {
    console.error('LINE account linking API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
