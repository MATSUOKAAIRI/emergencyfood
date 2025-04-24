'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, onAuthStateChanged } from '@/utils/firebase';
import { db } from '@/utils/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function TeamSelectPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [currentTeamId, setCurrentTeamId] = useState<string | null>(null);
  const [leavingTeam, setLeavingTeam] = useState<boolean>(false);
  const [leaveError, setLeaveError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setCurrentTeamId(userDocSnap.data()?.teamId || null);
        }
      } else {
        router.push('/auth/login'); // 未ログインならログイン画面へ
      }
    });
    return () => unsubscribeAuth();
  }, [router]);

  const handleLeaveTeam = async () => {
    if (!user?.uid || !currentTeamId) {
      return;
    }
    setLeavingTeam(true);
    setLeaveError(null);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        teamId: null,
      });
      setCurrentTeamId(null);
      // 必要であれば、離脱後のメッセージなどを設定
    } catch (error: any) {
      console.error('Error leaving team: ', error);
      setLeaveError('チームから離れることができませんでした。');
    } finally {
      setLeavingTeam(false);
    }
  };

  return (
    <div>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">チームへの参加または作成</h1>
        {leaveError && <p className="text-red-500">{leaveError}</p>}
        {currentTeamId && (
          <div className="mb-4 p-4 border rounded">
            <p>現在のチームに所属しています。</p>
            <button
              onClick={handleLeaveTeam}
              disabled={leavingTeam}
              className="inline-block bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-2"
            >
              {leavingTeam ? '離脱処理中...' : 'チームから離れる'}
            </button>
          </div>
        )}
        <p className="mb-4">既存のチームに参加する場合は、チームIDを入力してください。</p>
        <Link href="/teams/join" className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2">
          既存のチームに参加
        </Link>
        <p className="mt-4 mb-4">新しいチームを作成する場合は、以下のボタンをクリックしてください。</p>
        <Link href="/teams/create" className="inline-block bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          新しいチームを作成
        </Link>
      </div>
     
    </div>
  );
}