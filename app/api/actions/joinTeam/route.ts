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
    const { teamName, teamPassword } = await req.json();

    if (!teamName || !teamPassword) {
      return NextResponse.json(
        { error: 'Team name and password are required' },
        { status: 400 }
      );
    }

    const teamsRef = adminDb.collection('teams');
    const q = teamsRef.where('name', '==', teamName);
    const querySnapshot = await q.get();

    if (querySnapshot.empty) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    const teamDoc = querySnapshot.docs[0];
    const teamData = teamDoc.data();
    const foundTeamId = teamDoc.id;
    if (teamData?.password !== teamPassword) {
      return NextResponse.json(
        { error: 'Incorrect team name or password' },
        { status: 401 }
      );
    }

    await adminDb.runTransaction(async transaction => {
      const userDocRef = adminDb.collection('users').doc(uid);
      const teamDocRef = adminDb.collection('teams').doc(foundTeamId);

      const userDoc = await transaction.get(userDocRef);
      const teamDocFromTransaction = await transaction.get(teamDocRef);

      if (!userDoc.exists) {
        throw new Error('User document not found.');
      }
      if (!teamDocFromTransaction.exists) {
        throw new Error('Team document not found.');
      }

      const userData = userDoc.data();
      const teamDataAfterTransaction = teamDocFromTransaction.data();

      if (userData?.teamId !== null && userData?.teamId !== undefined) {
        throw new Error(
          'You are already a member of another team. Please leave it first.'
        );
      }

      const currentTeamMembers = teamDataAfterTransaction?.members || [];

      if (currentTeamMembers.includes(uid)) {
        return;
      }

      transaction.update(userDocRef, { teamId: foundTeamId });
      transaction.update(teamDocRef, { members: [...currentTeamMembers, uid] });
    });

    await adminAuth.setCustomUserClaims(uid, { teamId: foundTeamId });
    return NextResponse.json({
      message: `Successfully joined team "${teamName}" and updated claims.`,
      teamId: foundTeamId,
    });
  } catch (_error: unknown) {
    const errorMessage =
      _error instanceof Error ? _error.message : 'Internal Server Error';
    if (errorMessage.includes('You are already a member of another team')) {
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
