'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import FoodForm from '@/components/foods/FoodForm';
import { useAuth, useTeam } from '@/hooks';
import { ERROR_MESSAGES, UI_CONSTANTS } from '@/utils/constants';

export default function FoodAddClient() {
  const _router = useRouter();

  const { user } = useAuth();
  const { currentTeamId, loading: teamLoading } = useTeam(user);

  if (teamLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <p className='text-gray-600'>{ERROR_MESSAGES.LOADING}</p>
      </div>
    );
  }

  if (!currentTeamId) {
    return (
      <div className='max-w-md mx-auto p-6'>
        <h1 className='text-xl font-semibold mb-4 text-gray-900'>
          チームへの参加が必要です
        </h1>
        <p className='mb-4 text-gray-600'>
          {UI_CONSTANTS.TEAM_SELECTION_REQUIRED}
        </p>
        <Link
          className='inline-block bg-gray-800 text-white font-semibold py-2 px-4 rounded'
          href='/teams/select'
        >
          チームを選択または作成する
        </Link>
      </div>
    );
  }

  return (
    <div className='max-w-2xl mx-auto p-6'>
      <FoodForm teamId={currentTeamId} uid={user?.uid || null} />
    </div>
  );
}
