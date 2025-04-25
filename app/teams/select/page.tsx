'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, onAuthStateChanged } from '@/utils/firebase';
import { db } from '@/utils/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

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
        router.push('/auth/login');
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
    } catch (error: any) {
      console.error('Error leaving team: ', error);
      setLeaveError('チームから離れることができませんでした。');
    } finally {
      setLeavingTeam(false);
    }
  };

  return (
    <div className='p-4 items-center justify-center flex flex-col bg-[#ffd699] bottom-0 pt-40'>
      <div className="p-4 items-center justify-center flex flex-col bottom-0 ">
        <h1 className="text-5xl font-bold mb-28 text-[#333] ">チームへの参加または作成</h1>
        {leaveError && <p className="text-red-500">{leaveError}</p>}
        <p className="mb-4 text-[#333]">既存のチームに参加する場合は、チームIDを入力してください。</p>
        <Link href="/teams/join" className="inline-block bg-[#333333] hover:bg-[#332b1e] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2 mb-10">
          既存のチームに参加
        </Link>
        <p className="mt-4 mb-4 text-[#333]">新しいチームを作成する場合は、以下のボタンをクリックしてください。</p>
        <Link href="/teams/create" className="inline-block bg-[#333333] text-white hover:bg-[#332b1e] font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          新しいチームを作成
        </Link>
      </div>
     
    </div>
  );
}