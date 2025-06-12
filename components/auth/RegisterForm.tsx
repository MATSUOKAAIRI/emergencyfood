// components/auth/RegisterForm.tsx
'use client';
import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '@/utils/firebase';
import { useRouter } from 'next/navigation';

export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          teamId: null, 
        });
        console.log('登録成功');
        const idToken = await userCredential.user.getIdToken();
        const res = await fetch('/api/setCustomClaims', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            uid: userCredential.user.uid,
            teamId: null,
            idToken: idToken
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
        setError('このメールアドレスはすでに使われています。');
      } else if (error.code === 'auth/invalid-email') {
        setError('メールアドレスの形式が正しくありません。');
      } else if (error.code === 'auth/weak-password') {
        setError('パスワードは6文字以上にしてください。');
      } else {
        setError('登録に失敗しました。');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto p-4 border rounded mb-4 border-[#333] w-2/3">
      <h2 className="text-xl font-bold mb-4 text-[#333]">ユーザー登録</h2>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</div>}
      <div className="mb-4">
        <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">メールアドレス</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-[#333] leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="password" className="block text-[#333] text-sm font-bold mb-2">パスワード</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-[#333] leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="confirmPassword" className="block text-[#333] text-sm font-bold mb-2">パスワードを再入力</label>
        <input
          type="password"
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>
      <button
        type="submit"
        className="bg-[#333333] text-white hover:bg-[#332b1e] over:text-gray-500 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline items-center justify-center flex flex-col bottom-0 " 
      >
        登録
      </button>
    </form>
  );
}