// components/auth/RegisterForm.tsx
'use client';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { API_ENDPOINTS, ERROR_MESSAGES } from '@/utils/constants';
import { auth, db } from '@/utils/firebase';

export default function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const _router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('名前を入力してください');
      return;
    }

    if (password !== confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: name.trim(),
        });

        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email: email,
          displayName: name.trim(),
          teamId: null,
        });

        const idToken = await userCredential.user.getIdToken();
        const res = await fetch(API_ENDPOINTS.SET_CUSTOM_CLAIMS, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: userCredential.user.uid,
            teamId: null,
            idToken: idToken,
          }),
        });
        if (!res.ok) {
          setError('クレームの同期に失敗しました');
          return;
        }
        await userCredential.user.getIdToken(true);
      }
    } catch (_error: unknown) {
      if (_error instanceof Error && 'code' in _error) {
        if (_error.code === 'auth/email-already-in-use') {
          setError(ERROR_MESSAGES.EMAIL_ALREADY_IN_USE);
        } else if (_error.code === 'auth/invalid-email') {
          setError(ERROR_MESSAGES.INVALID_EMAIL);
        } else if (_error.code === 'auth/weak-password') {
          setError(ERROR_MESSAGES.WEAK_PASSWORD);
        } else {
          setError(ERROR_MESSAGES.REGISTRATION_FAILED);
        }
      } else {
        setError(ERROR_MESSAGES.REGISTRATION_FAILED);
      }
    }
  };

  return (
    <form
      className='space-y-4 sm:space-y-6 max-w-md mx-auto w-full px-4 sm:px-0'
      onSubmit={handleSubmit}
    >
      <h1 className='text-2xl sm:text-4xl font-bold text-gray-900 text-center mb-4 sm:mb-6'>
        ユーザー登録
      </h1>

      {error && (
        <div className='bg-red-200 border text-black px-3 sm:px-4 py-3 rounded-md text-sm'>
          {error}
        </div>
      )}

      <div className='space-y-3 sm:space-y-4'>
        <div>
          <label
            className='block text-gray-900 text-sm font-medium mb-1 sm:mb-2'
            htmlFor='name'
          >
            名前
          </label>
          <input
            required
            className='w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 text-base'
            id='name'
            placeholder='表示名を入力'
            type='text'
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>

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
            placeholder='6文字以上のパスワード'
            type='password'
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        <div>
          <label
            className='block text-gray-900 text-sm font-medium mb-1 sm:mb-2'
            htmlFor='confirmPassword'
          >
            パスワードを再入力
          </label>
          <input
            required
            className='w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 text-base'
            id='confirmPassword'
            placeholder='パスワードを再入力'
            type='password'
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
          />
        </div>
      </div>

      <button
        className='w-full bg-black text-white font-semibold py-3 px-6 rounded-md hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 text-base'
        type='submit'
      >
        登録
      </button>
    </form>
  );
}
