'use client';
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { auth, db, onAuthStateChanged } from '@/utils/firebase';

export default function FoodsPage() {
  const [userTeamId, setUserTeamId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async user => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const teamId = userDocSnap.data()?.teamId;
          setUserTeamId(teamId);
        } else {
          setUserTeamId(null);
        }
      } else {
        setUserTeamId(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  if (isLoading) {
    return <div>ロード中...</div>;
  }

  return (
    <div>
      {userTeamId ? (
        <p>食品リストにリダイレクト中です...</p>
      ) : (
        <div className='p-4'>
          <h1 className='text-xl font-bold mb-4'>チームへの参加が必要です</h1>
          <p className='mb-4'>
            食品リストを閲覧するには、いずれかのチームに参加してください。
          </p>
          <Link
            className='inline-block text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'
            href='/teams/select'
          >
            チームを選択または作成する
          </Link>
        </div>
      )}
    </div>
  );
}
