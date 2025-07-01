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
  const router = useRouter();

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

        console.log('登録成功');
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
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setError(ERROR_MESSAGES.EMAIL_ALREADY_IN_USE);
      } else if (error.code === 'auth/invalid-email') {
        setError(ERROR_MESSAGES.INVALID_EMAIL);
      } else if (error.code === 'auth/weak-password') {
        setError(ERROR_MESSAGES.WEAK_PASSWORD);
      } else {
        setError(ERROR_MESSAGES.REGISTRATION_FAILED);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      <h1 className='text-4xl font-bold text-gray-900 text-center mb-6'>
        ユーザー登録
      </h1>

      {error && (
        <div className='bg-red-200 border text-black px-4 py-3 rounded-md'>
          {error}
        </div>
      )}

      <div className='space-y-4'>
        <div>
          <label
            className='block text-gray-900 text-sm font-medium mb-2'
            htmlFor='name'
          >
            名前
          </label>
          <input
            required
            className='w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-gray-900'
            id='name'
            type='text'
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder='表示名を入力'
          />
        </div>

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
            placeholder='6文字以上のパスワード'
          />
        </div>

        <div>
          <label
            className='block text-gray-900 text-sm font-medium mb-2'
            htmlFor='confirmPassword'
          >
            パスワードを再入力
          </label>
          <input
            required
            className='w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-gray-900'
            id='confirmPassword'
            type='password'
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder='パスワードを再入力'
          />
        </div>
      </div>

      <button
        className='w-full bg-black text-white font-semibold py-3 px-6 rounded-md hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2'
        type='submit'
      >
        登録
      </button>
    </form>
  );
}
