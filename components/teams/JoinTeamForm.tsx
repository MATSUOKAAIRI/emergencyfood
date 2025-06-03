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
  //     const teamsRef = collection(db, 'teams');
  //     const q = query(teamsRef, where('name', '==', teamNameInput));
  //     const querySnapshot = await getDocs(q);

  //     if (querySnapshot.empty) {
  //       console.log('指定されたチーム名が見つかりません');
  //       setError('指定されたチーム名は見つかりません。');
  //       return;
  //     }

  //     let foundTeamId = null;
  //     let passwordMatch = false;
  //     querySnapshot.forEach((doc) => {
  //       const teamData = doc.data();

  //       if (teamData?.password === teamPasswordInput) {
  //         foundTeamId = doc.id;
  //         passwordMatch = true;
  //       }
  //     });

  //     if (foundTeamId && passwordMatch) {
  //       const teamDocRef = doc(db, 'teams', foundTeamId);
  //       const teamDocSnap = await getDoc(teamDocRef);

  //       if (teamDocSnap.exists()) {
  //         const teamData = teamDocSnap.data();
  //         const currentMemberIds = teamData?.members || [];

  //         if (!currentMemberIds.includes(user.uid)) {
  //           await updateDoc(doc(db, 'users', user.uid), { teamId: arrayUnion(foundTeamId) });
  //           await updateDoc(teamDocRef, { members: [...currentMemberIds, user.uid] });
            
  //           const idToken = await user.getIdToken();
  //           await fetch('/api/setMyCustomClaims', {
  //             method: 'POST',
  //             headers: { 'Content-Type': 'application/json' },
  //             body: JSON.stringify({ idToken }),
  //           });
  //           await user.getIdToken(true); // クレーム反映のため再取得
            
  //           setSuccessMessage(`チーム "${teamData?.name || teamNameInput}" に参加しました！`);
  //           router.push(`/foods/list?teamId=${foundTeamId}`);
  //         } else {
  //           setSuccessMessage('既にこのチームに参加しています。');
  //           router.push(`/foods/list?teamId=${foundTeamId}`);
  //         }
  //       } else {
  //         setError('チーム情報の取得に失敗しました。');
  //       }
  //     } else {
  //       setError('チーム名またはパスワードが間違っています。');
  //     }
  //   } catch (error: any) {
  //     setError('チームへの参加に失敗しました。');
  //   }
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
      const setClaimsRes = await fetch('/api/setCustomClaims', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: user.uid,
        teamId: result.teamId,
        idToken: idToken
      }),
    });

    if (!setClaimsRes.ok) {
        const errorData = await setClaimsRes.json();
        console.error('カスタムクレーム更新APIエラー:', errorData);
        setError(`クレームの同期に失敗しました: ${errorData.error || setClaimsRes.statusText}`);
        return;
    }

      
      await user.getIdToken(true);

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