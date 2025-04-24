'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; // useSearchParams をインポート
import { auth, onAuthStateChanged } from '@/utils/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/utils/firebase';
import FoodForm from '@/components/foods/FoodForm';
import Link from 'next/link';

export default function AddFoodPage() {
  const router = useRouter();
  const searchParams = useSearchParams(); // useSearchParams を使用
  const [user, setUser] = useState<any>(null);
  const [teamIdFromURL, setTeamIdFromURL] = useState<string | null>(null); // URL からの teamId
  const [userTeamId, setUserTeamId] = useState<string | null>(null); // users ドキュメントの teamId

  useEffect(() => {
    const teamIdParam = searchParams.get('teamId');
    setTeamIdFromURL(teamIdParam);
  }, [searchParams]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUserTeamId(userDocSnap.data()?.teamId || null);
        } else {
          router.push('/teams/select');
        }
      } else {
        router.push('/auth/login');
      }
    });
    return () => unsubscribeAuth();
  }, [router]);

  // URL の teamId を優先して使用する
  const currentTeamId = teamIdFromURL || userTeamId;

  if (!user || currentTeamId === null) {
    return (
      <div>
        <div className="p-4">
          {user ? <p>チーム情報を取得中です...</p> : <p>ログインしてください。</p>}
        </div>
      </div>
    );
  }

  return (
    <div>
      
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">新しい非常食を登録</h1>
        <FoodForm uid={user.uid} teamId={currentTeamId} />
        <div className="mt-4">
          <Link href={`/foods/list?teamId=${currentTeamId}`} className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            非常食一覧に戻る
          </Link>
        </div>
      </div>
    </div>
  );
}