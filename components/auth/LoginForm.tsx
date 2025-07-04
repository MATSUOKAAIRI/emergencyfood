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
        let idTokenResult = await user.getIdTokenResult(true);
        let claimTeamId: string | null = idTokenResult.claims.teamId as
          | string
          | null;

        if (!claimTeamId) {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          const firestoreTeamId: string | null = userDocSnap.exists()
            ? userDocSnap.data().teamId
            : null;

          if (firestoreTeamId) {
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

            if (res.ok) {
              await user.getIdToken(true);
              idTokenResult = await user.getIdTokenResult();
              claimTeamId = idTokenResult.claims.teamId as string | null;
            }
          }
        }

        if (claimTeamId) {
          router.push(`/foods/list?teamId=${claimTeamId}`);
        } else {
          router.push('/teams/select');
        }
      }
    } catch (_error: unknown) {
      if (_error instanceof Error && 'code' in _error) {
        switch (_error.code) {
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
      } else {
        setError(ERROR_MESSAGES.LOGIN_FAILED);
      }
    }
  };

  return (
    <form
      className='space-y-4 sm:space-y-6 max-w-md mx-auto w-full px-4 sm:px-0'
      onSubmit={handleSubmit}
    >
      <h2 className='text-2xl sm:text-4xl font-bold pb-2 sm:pb-4 text-gray-900 text-center mb-4 sm:mb-6'>
        ログイン
      </h2>

      {error && (
        <div className='bg-red-200 border text-black px-3 sm:px-4 py-3 rounded text-sm'>
          {error}
        </div>
      )}

      <div className='space-y-3 sm:space-y-4'>
        <div>
          <label
            className='block text-gray-900 text-sm font-medium mb-1 sm:mb-2'
            htmlFor='email'
          >
            メールアドレス
          </label>
          <input
            required
            className='w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 text-base'
            id='email'
            placeholder='example@email.com'
            type='email'
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label
            className='block text-gray-900 text-sm font-medium mb-1 sm:mb-2'
            htmlFor='password'
          >
            パスワード
          </label>
          <input
            required
            className='w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 text-base'
            id='password'
            placeholder='パスワードを入力'
            type='password'
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
      </div>

      <button
        className='w-full bg-black text-white font-semibold py-3 px-6 rounded-md hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 text-base'
        type='submit'
      >
        ログイン
      </button>
    </form>
  );
}
