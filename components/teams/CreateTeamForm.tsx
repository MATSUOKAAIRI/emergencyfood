// components/teams/CreateTeamForm.tsx
'use client';
import React, { useState } from 'react';
import { doc,getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/utils/firebase';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { getAuth } from 'firebase/auth';

export default function CreateTeamForm() {
  const [teamName, setTeamName] = useState('');
  const [teamPassword, setTeamPassword] = useState('');
  const [newTeamId, setNewTeamId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();
  const firebaseAuth = getAuth();

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setNewTeamId(null);

    const user = firebaseAuth.currentUser;
    if (!user) {
      setError('ログインしていません。');
      return;
    }

    const generatedTeamId = uuidv4().substring(0, 8);
    const userDocRef = doc(db, 'users', user.uid);
    try {
        // ドキュメントの存在確認
        const userDocSnap = await getDoc(userDocRef);
    
        if (!userDocSnap.exists()) {
          // ドキュメントが存在しない場合、新規作成
          await setDoc(userDocRef, { teamId: generatedTeamId });
        } else {
          // ドキュメントが存在する場合、更新
          await updateDoc(userDocRef, { teamId: generatedTeamId });
        }
    
        await setDoc(doc(db, 'teams', generatedTeamId), {
          name: teamName,
          password: teamPassword, // ★ 平文で保存 (非推奨)
          members: [user.uid],
          ownerId: user.uid,
        });
    
        setNewTeamId(generatedTeamId);
        setSuccessMessage(`新しいチーム "${teamName}" (ID: ${generatedTeamId}) を作成しました！`);
        router.push(`/foods/list?teamId=${generatedTeamId}`);
      } catch (error: any) {
        console.error('チーム作成エラー:', error);
        setError('チームの作成に失敗しました。');
      }
  };

  return (
    <form onSubmit={handleCreateTeam} className="max-w-sm mx-auto p-4 border rounded mb-4">
      <h2 className="text-xl font-bold mb-4">新しいチームを作成</h2>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</div>}
      {successMessage && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">{successMessage}</div>}
      {newTeamId && <p className="mb-4">チームID: <span className="font-bold">{newTeamId}</span></p>}
      <div className="mb-4">
        <label htmlFor="teamName" className="block text-gray-700 text-sm font-bold mb-2">チーム名</label>
        <input
          type="text"
          id="teamName"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="teamPassword" className="block text-gray-700 text-sm font-bold mb-2">パスワード</label>
        <input
          type="password"
          id="teamPassword"
          value={teamPassword}
          onChange={(e) => setTeamPassword(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>
      <button
        type="submit"
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        作成
      </button>
    </form>
  );
}