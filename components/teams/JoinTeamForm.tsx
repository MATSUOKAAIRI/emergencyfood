'use client';
import React, { useState } from 'react';
//import { arrayUnion,doc, getDocs, query, where, updateDoc, collection, getDoc } from 'firebase/firestore';
//import { db } from '@/utils/firebase';
import { useRouter } from 'next/navigation';
import { getAuth } from 'firebase/auth';

export default function JoinTeamForm() {
  const [teamNameInput, setTeamNameInput] = useState('');
  const [teamPasswordInput, setTeamPasswordInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();
  const firebaseAuth = getAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const user = firebaseAuth.currentUser;
    if (!user) {
      setError('ログインしていません。');
      return;
    }

    try {
      const idToken = await user.getIdToken();

      const response = await fetch('/api/actions/joinTeam', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          teamName: teamNameInput,
          teamPassword: teamPasswordInput,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'チームへの参加に失敗しました。');
      }

      setSuccessMessage(result.message || `チームに参加しました！`);

      await user.getIdToken(true);
      if (result.teamId) {
        // router.replace を使用することで、ブラウザの履歴にこの遷移が残らないようにします。
        // これにより、ユーザーが「戻る」ボタンを押しても、参加フォームに戻るのではなく、
        // 参加前のページ（通常はチーム選択画面）に戻ります。
        router.replace(`/foods/list?teamId=${result.teamId}`); 
        console.log(`EMERGENCY REDIRECT: Navigating to /foods/list?teamId=${result.teamId}`);
      } else {
        // 万が一、APIからteamIdが返されない場合は、汎用的なリストページへ（このケースは稀であるべき）
        router.replace('/foods/list');
        console.log("EMERGENCY REDIRECT: Navigating to /foods/list (teamId not returned).");
      }
    } catch (error: any) {
      console.error('Error joining team:', error);
      setError(`チームへの参加に失敗しました: ${error.message || '不明なエラ-'}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto p-4 border rounded mb-4 border-[#333] w-2/3">
      <h2 className="text-xl font-bold mb-4 text-[#333]">既存のチームに参加</h2>
      {error && <div className="bg-red-100 border border-red-600 text-red-700 px-4 py-3 rounded relative mb-4">{error}</div>}
      {successMessage && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">{successMessage}</div>}
      <div className="mb-4">
        <label htmlFor="teamNameInput" className="block text-[#333] text-sm font-bold mb-2">チーム名</label>
        <input
          type="text"
          id="teamNameInput"
          value={teamNameInput}
          onChange={(e) => setTeamNameInput(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-[#333] leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="teamPasswordInput" className="block text-[#333] text-sm font-bold mb-2">パスワード</label>
        <input
          type="password"
          id="teamPasswordInput"
          value={teamPasswordInput}
          onChange={(e) => setTeamPasswordInput(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-[#333] leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>
      <button
        type="submit"
        className="bg-[#333333] text-white hover:bg-[#332b1e] font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        参加
      </button>
    </form>
  );
}