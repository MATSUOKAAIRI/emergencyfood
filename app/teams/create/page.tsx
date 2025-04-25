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
    <div className="p-4 items-center justify-center flex flex-col pt-40">
      <h1 className="text-5xl font-bold text-[#333] mb-30">新しいチームを作成</h1>
      <CreateTeamForm />
      <Link href="/teams/select" className="inline-block mt-4 hover:text-[#a399ff] text-[#a399ff] hover:underline">
        チーム選択画面に戻る
      </Link>
    </div>
  );
}