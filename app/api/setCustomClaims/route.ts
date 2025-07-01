import { NextResponse } from 'next/server';

import { adminAuth } from '@/utils/firebase/admin';

export async function POST(req: Request) {
  const body = await req.json();
  const { uid, teamId } = body;

  const idTokenFromClient = body.idToken;

  if (
    !uid ||
    (typeof teamId !== 'string' && teamId !== null) ||
    !idTokenFromClient
  ) {
    return NextResponse.json(
      {
        error:
          'Invalid request: uid, teamId (string or null), and idToken are required',
      },
      { status: 400 }
    );
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(idTokenFromClient);

    if (decodedToken.uid !== uid) {
      return NextResponse.json(
        { error: 'Unauthorized: UID mismatch' },
        { status: 401 }
      );
    }

    await adminAuth.setCustomUserClaims(uid, { teamId: teamId });
    return NextResponse.json({ message: 'カスタムクレームを設定しました' });
  } catch (_error: unknown) {
    const errorMessage =
      _error instanceof Error
        ? _error.message
        : 'カスタムクレームの設定に失敗しました';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json(
    {
      message:
        'This API only supports POST requests for setting custom claims.',
    },
    { status: 405 }
  );
}
