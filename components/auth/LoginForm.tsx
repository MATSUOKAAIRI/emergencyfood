// components/auth/LoginForm.tsx
'use client';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { ERROR_MESSAGES } from '@/utils/constants';
import { auth, db } from '@/utils/firebase';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        const firestoreTeamId: string | null = userDocSnap.exists()
          ? userDocSnap.data().teamId
          : null;

        let idTokenResult = await user.getIdTokenResult(true);
        const claimTeamId: string | null = idTokenResult.claims.teamId as
          | string
          | null;

        if (firestoreTeamId && firestoreTeamId !== claimTeamId) {
          const idToken = await user.getIdToken();
          const res = await fetch('/api/setCustomClaims', {
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
        const finalTeamId: string | null = idTokenResult.claims.teamId as
          | string
          | null;

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
          setError(ERROR_MESSAGES.INVALID_EMAIL);
          break;
        case 'auth/user-disabled':
          setError(ERROR_MESSAGES.USER_DISABLED);
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          setError(ERROR_MESSAGES.INVALID_CREDENTIALS);
          break;
        case 'auth/too-many-requests':
          setError(ERROR_MESSAGES.TOO_MANY_REQUESTS);
          break;
        default:
          setError(ERROR_MESSAGES.LOGIN_FAILED);
          break;
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      <h2 className='text-4xl font-bold pb-4 text-gray-900 text-center mb-6'>
        ログイン
      </h2>

      {error && (
        <div className='bg-red-200 border text-black px-4 py-3'>{error}</div>
      )}

      <div className='space-y-4'>
        <div>
          <label
            className='block text-gray-900 text-sm font-medium mb-2'
            htmlFor='email'
          >
            メールアドレス
          </label>
          <input
            required
            className='w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-gray-900'
            id='email'
            type='email'
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder='example@email.com'
          />
        </div>

        <div>
          <label
            className='block text-gray-900 text-sm font-medium mb-2'
            htmlFor='password'
          >
            パスワード
          </label>
          <input
            required
            className='w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-gray-900'
            id='password'
            type='password'
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder='パスワードを入力'
          />
        </div>
      </div>

      <button
        className='w-full bg-black text-white font-semibold py-3 px-6 rounded-md hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2'
        type='submit'
      >
        ログイン
      </button>
    </form>
  );
}
