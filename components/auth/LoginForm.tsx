// components/auth/LoginForm.tsx
'use client';
import React, { useState } from 'react';
import { signInWithEmailAndPassword,  getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/utils/firebase'; 
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        const firestoreTeamId: string | null = userDocSnap.exists() ? userDocSnap.data().teamId : null;

        let idTokenResult = await user.getIdTokenResult(true);
        const claimTeamId: string | null = idTokenResult.claims.teamId as string | null;

        if (firestoreTeamId && firestoreTeamId !== claimTeamId) {
          const idToken = await user.getIdToken();
          const res = await fetch('/api/setCustomClaims',{
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              uid: user.uid,
              teamId: firestoreTeamId,
              idToken,
            }),
          });

          if (!res.ok) {
            setError('クレームの同期に失敗しました');
            const errorText = await res.text();
            console.error('クレーム同期APIエラー:', errorText);
            return;
          }
          await user.getIdToken(true);
        }

        idTokenResult = await user.getIdTokenResult();
        const finalTeamId: string | null = idTokenResult.claims.teamId as string | null;

        if (finalTeamId) {
          router.push(`/foods/list?teamId=${finalTeamId}`);
        } else {
          router.push('/teams/select');
        }
      }
    } catch (error: any) {
      console.error(error);
      switch (error.code) {
        case 'auth/invalid-email':
          setError('無効なメールアドレス形式です。');
          break;
        case 'auth/user-disabled':
          setError('このアカウントは無効化されています。');
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          setError('メールアドレスまたはパスワードが間違っています。');
          break;
        case 'auth/too-many-requests':
          setError('何度もログインに失敗しました。しばらく待ってから再度お試しください。');
          break;
        default:
          setError('ログインに失敗しました。時間をおいて再度お試しください。');
          break;
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto p-4 border rounded mb-4 border-[#333] w-2/3 z-10">
      <h2 className="text-xl font-bold pb-4 text-[#333]">ログイン</h2>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</div>}
      <div className="mb-4">
        <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">メールアドレス</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">パスワード</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>
      <button
        type="submit"
        className="bg-[#333333] text-white hover:bg-[#332b1e] hover:text-gray-500  font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        ログイン
      </button>
    </form>
  );
}