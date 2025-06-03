import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/utils/firebase-admin';
import * as admin from 'firebase-admin';

// const adminAuth = getAdminAuth();
// const adminDb = getAdminFirestore();

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
    const q = teamsRef.where('name', '==', teamName);
    const querySnapshot = await q.get();

    if (querySnapshot.empty) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    const teamDoc = querySnapshot.docs[0];
    const teamData = teamDoc.data();
    const foundTeamId = teamDoc.id;
// Check if the team has a password
    if (teamData?.password !== teamPassword) {
      return NextResponse.json({ error: 'Incorrect team name or password' }, { status: 401 });
    }

    await adminDb.runTransaction(async (transaction) => {
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
          throw new Error('You are already a member of another team. Please leave it first.');
      }

      const currentTeamMembers = teamDataAfterTransaction?.members || [];

      if (currentTeamMembers.includes(uid)) {
        return;
      }

      transaction.update(userDocRef, { teamId: foundTeamId });
      transaction.update(teamDocRef, { members: [...currentTeamMembers, uid] });
    });
//
    // const setClaimsApiUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/set-custom-claims`;

    // const currentCustomTeamIds = decodedToken.teamIds || [];
    // const newCustomTeamIds = [...new Set([...currentCustomTeamIds, foundTeamId])];

    // const setClaimsResponse = await fetch(setClaimsApiUrl, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${process.env.ADMIN_SECRET}`,
    //   },
    //   body: JSON.stringify({ uid, teamIds: newCustomTeamIds }),
    // });

    // if (!setClaimsResponse.ok) {
    //   const errorData = await setClaimsResponse.json();
    //   throw new Error(`Failed to set custom claims: ${errorData.error}`);
    // }

    await adminAuth.setCustomUserClaims(uid, { teamId: foundTeamId });
    console.log(`Custom claim 'teamId' set for user ${uid}: ${foundTeamId}`);
    return NextResponse.json({ message: `Successfully joined team "${teamName}" and updated claims.`, teamId: foundTeamId });

  } catch (error: any) {
    console.error('API Error in join-team:', error);
    if (error.message.includes('You are already a member of another team')) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}