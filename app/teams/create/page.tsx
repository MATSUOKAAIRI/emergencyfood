'use client';
import Link from 'next/link';
import CreateTeamForm from '@/components/teams/CreateTeamForm';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, onAuthStateChanged } from '@/utils/firebase';

export default function CreateTeamPage() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/auth/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">新しいチームを作成</h1>
      <CreateTeamForm />
      <Link href="/teams/select" className="inline-block mt-4 text-blue-500 hover:underline">
        チーム選択画面に戻る
      </Link>
    </div>
  );
}