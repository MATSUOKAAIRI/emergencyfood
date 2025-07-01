// components/teams/CreateTeamForm.tsx
'use client';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { useAuth, useTeam } from '@/hooks';
import { ERROR_MESSAGES } from '@/utils/constants';

export default function CreateTeamForm() {
  const [teamName, setTeamName] = useState('');
  const [teamPassword, setTeamPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const { createTeam } = useTeam(user);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    if (!user) {
      setError(ERROR_MESSAGES.UNAUTHORIZED);
      setLoading(false);
      return;
    }

    if (teamPassword !== confirmPassword) {
      setError('パスワードが一致しません');
      setLoading(false);
      return;
    }

    try {
      const result = await createTeam(teamName, teamPassword);
      setSuccessMessage(
        result.message || `チーム "${teamName}" を作成し、参加しました！`
      );

      if (result.teamId) {
        router.replace(`/foods/list?teamId=${result.teamId}`);
      } else {
        router.replace('/foods/list');
      }
    } catch (_error: unknown) {
      let msg: string = ERROR_MESSAGES.UNKNOWN_ERROR;
      if (_error instanceof Error) msg = _error.message;
      setError(`チームの作成に失敗しました: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className='space-y-6' onSubmit={handleCreateTeam}>
      <h1 className='text-3xl font-bold mb-6 text-black text-center'>
        新しいチームを作成
      </h1>
      {error && (
        <div className='bg-red-200 border text-black px-4 py-3 relative mb-4 rounded-md'>
          {error}
        </div>
      )}
      {successMessage && (
        <div className='bg-green-200 border text-black px-4 py-3 relative mb-4 rounded-md'>
          {successMessage}
        </div>
      )}
      <div className='space-y-4'>
        <div>
          <label
            className='block text-black text-sm font-medium mb-2'
            htmlFor='teamName'
          >
            チーム名
          </label>
          <input
            required
            className='w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-gray-900'
            disabled={loading}
            id='teamName'
            placeholder='チーム名を決めてください'
            type='text'
            value={teamName}
            onChange={e => setTeamName(e.target.value)}
          />
        </div>
        <div>
          <label
            className='block text-black text-sm font-medium mb-2'
            htmlFor='teamPassword'
          >
            パスワード
          </label>
          <input
            required
            className='w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-gray-900'
            disabled={loading}
            id='teamPassword'
            placeholder='パスワードを入力'
            type='password'
            value={teamPassword}
            onChange={e => setTeamPassword(e.target.value)}
          />
        </div>
        <div>
          <label
            className='block text-black text-sm font-medium mb-2'
            htmlFor='confirmPassword'
          >
            パスワードを再入力
          </label>
          <input
            required
            className='w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-gray-900'
            disabled={loading}
            id='confirmPassword'
            placeholder='パスワードを再入力'
            type='password'
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
          />
        </div>
      </div>
      <button
        className='w-full bg-black text-white font-semibold py-3 px-6 rounded-md hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2'
        type='submit'
      >
        {loading ? '作成中...' : '作成'}
      </button>
    </form>
  );
}
