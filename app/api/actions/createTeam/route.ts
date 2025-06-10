// app/api/actions/create-team/route.ts
import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/utils/firebase-admin'; // Firebase Admin SDKの初期化とインポート
import * as admin from 'firebase-admin'; // Firestoreトランザクションの型のため

// ★ bcryptjs のインポートはコメントアウトしたままで、ご要望通り平文パスワードを使用します
// import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization header missing or malformed' }, { status: 401 });
    }
    const idToken = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (error) {
      console.error('ID Token verification failed:', error);
      return NextResponse.json({ error: 'Invalid or expired ID token' }, { status: 403 });
    }

    const uid = decodedToken.uid;
    const { teamName, teamPassword } = await req.json();

    if (!teamName || !teamPassword) {
      return NextResponse.json({ error: 'Team name and password are required' }, { status: 400 });
    }

    const teamsRef = adminDb.collection('teams');
    const existingTeamSnapshot = await teamsRef.where('name', '==', teamName).get();
    if (!existingTeamSnapshot.empty) {
      return NextResponse.json({ error: 'Team name already exists' }, { status: 409 });
    }

    // パスワードはご要望により、平文のまま
    const hashedPassword = teamPassword;

    // ★修正点1: トランザクションの結果を newTeamId に代入
    const newTeamId = await adminDb.runTransaction(async (transaction: admin.firestore.Transaction) => {
      const userDocRef = adminDb.collection('users').doc(uid);
      const userDoc = await transaction.get(userDocRef);

      if (!userDoc.exists) {
        throw new Error('User document not found.');
      }

      const userData = userDoc.data();
      if (userData?.teamId !== null && userData?.teamId !== undefined) {
          throw new Error('You are already a member of another team. Please leave it first.');
      }

      const newTeamRef = teamsRef.doc(); // 新しいドキュメントIDを自動生成
      const generatedId = newTeamRef.id; // 生成されたIDを変数に格納

      transaction.set(newTeamRef, {
        name: teamName,
        password: hashedPassword,
        members: [uid],
        createdAt: new Date(),
        createdBy: uid,
      });

      transaction.update(userDocRef, { teamId: generatedId });

      return generatedId; // ★修正点2: トランザクションから生成されたIDを返す
    });

    // カスタムクレームの更新
    // newTeamId はトランザクションの解決によって確実にstring型になる
    await adminAuth.setCustomUserClaims(uid, { teamId: newTeamId }); 
    console.log(`Custom claim 'teamId' set for user ${uid}: ${newTeamId}`);

    return NextResponse.json({ 
      message: `Team "${teamName}" created and you joined.`, 
      teamId: newTeamId 
    });

  } catch (error: any) {
    console.error('API Error in create-team:', error);
    if (error.message.includes('You are already a member of another team')) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error.message.includes('Team name already exists')) {
        return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}