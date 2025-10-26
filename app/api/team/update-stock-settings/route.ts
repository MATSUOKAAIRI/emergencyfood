import { NextResponse } from 'next/server';

import type { TeamStockSettings } from '@/types';
import { adminAuth, adminDb } from '@/utils/firebase/admin';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header missing' },
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
    const { teamId, stockSettings } = await req.json();

    if (!teamId || !stockSettings) {
      return NextResponse.json(
        { error: 'Team ID and stock settings are required' },
        { status: 400 }
      );
    }

    // バリデーション
    if (
      typeof stockSettings.householdSize !== 'number' ||
      stockSettings.householdSize < 1 ||
      stockSettings.householdSize > 50
    ) {
      return NextResponse.json(
        { error: 'Household size must be between 1 and 50' },
        { status: 400 }
      );
    }

    if (
      typeof stockSettings.stockDays !== 'number' ||
      ![3, 7, 14, 30].includes(stockSettings.stockDays)
    ) {
      return NextResponse.json(
        { error: 'Stock days must be 3, 7, 14, or 30' },
        { status: 400 }
      );
    }

    const teamDoc = await adminDb.collection('teams').doc(teamId).get();
    if (!teamDoc.exists) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    const teamData = teamDoc.data();
    const isOwner = teamData?.ownerId === uid;
    const isAdmin = teamData?.admins?.includes(uid);

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Only team owners or admins can update stock settings' },
        { status: 403 }
      );
    }

    const settingsToSave: TeamStockSettings = {
      householdSize: stockSettings.householdSize,
      stockDays: stockSettings.stockDays,
      hasPets: stockSettings.hasPets || false,
      dogCount: stockSettings.dogCount || 0,
      catCount: stockSettings.catCount || 0,
      updatedAt: new Date().toISOString(),
    };

    await adminDb.collection('teams').doc(teamId).update({
      stockSettings: settingsToSave,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      message: 'Stock settings updated successfully',
      stockSettings: settingsToSave,
    });
  } catch (_error: unknown) {
    console.error('Update stock settings error:', _error);
    const errorMessage =
      _error instanceof Error ? _error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
