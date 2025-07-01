'use client';
import { useAuth, useTeam } from '@/hooks';
import { ERROR_MESSAGES } from '@/utils/constants';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

export default function JoinTeamForm() {
  const [teamNameInput, setTeamNameInput] = useState('');
  const [teamPasswordInput, setTeamPasswordInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();
  const { joinTeam } = useTeam(user);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!user) {
      setError(ERROR_MESSAGES.UNAUTHORIZED);
      return;
    }

    try {
      const result = await joinTeam(teamNameInput, teamPasswordInput);
      setSuccessMessage(result.message || `チームに参加しました！`);

      if (result.teamId) {
        router.replace(`/foods/list?teamId=${result.teamId}`);
        console.log(
          `EMERGENCY REDIRECT: Navigating to /foods/list?teamId=${result.teamId}`
        );
      } else {
        router.replace('/foods/list');
        console.log(
          'EMERGENCY REDIRECT: Navigating to /foods/list (teamId not returned).'
        );
      }
    } catch (error: any) {
      console.error('Error joining team:', error);
      setError(
        `チームへの参加に失敗しました: ${error.message || ERROR_MESSAGES.UNKNOWN_ERROR}`
      );
    }
  };

  return (
    <form className='space-y-6' onSubmit={handleSubmit}>
      <h1 className='text-3xl font-bold mb-6 text-black text-center'>
        既存のチームに参加
      </h1>
      {error && (
        <div className='bg-red-200 border text-black px-4 py-3 relative mb-4 rounded-b-md'>
          {error}
        </div>
      )}
      {successMessage && (
        <div className='bg-green-200 border text-black px-4 py-3 relative mb-4 rounded-b-md'>
          {successMessage}
        </div>
      )}
      <div className='mb-4'>
        <label
          className='block text-black text-sm font-bold mb-2'
          htmlFor='teamNameInput'
        >
          チーム名
        </label>
        <input
          required
          className='w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-gray-900'
          id='teamNameInput'
          type='text'
          value={teamNameInput}
          onChange={e => setTeamNameInput(e.target.value)}
          placeholder='チーム名を入力'
        />
      </div>
      <div className='mb-4'>
        <label
          className='block text-black text-sm font-bold mb-2'
          htmlFor='teamPasswordInput'
        >
          パスワード
        </label>
        <input
          required
          className='w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-gray-900'
          id='teamPasswordInput'
          type='password'
          value={teamPasswordInput}
          onChange={e => setTeamPasswordInput(e.target.value)}
          placeholder='パスワードを入力'
        />
      </div>
      <button
        className='w-full bg-black text-white font-semibold py-3 px-6 rounded-md hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2'
        type='submit'
      >
        参加
      </button>
    </form>
  );
}
