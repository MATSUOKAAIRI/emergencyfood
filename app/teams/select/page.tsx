import Link from 'next/link';
import { Suspense } from 'react';

import { ERROR_MESSAGES, UI_CONSTANTS } from '@/utils/constants';

import TeamSelectClient from './TeamSelectClient';

export default function TeamSelectPage() {
  return (
    <div className='min-h-screen flex items-center justify-center p-4 sm:p-6'>
      <div className='max-w-lg w-full text-center'>
        <h1 className='text-2xl sm:text-4xl font-bold text-gray-900 mb-8 sm:mb-12'>
          {UI_CONSTANTS.TEAM_SELECTION_TITLE}
        </h1>

        <div className='space-y-6 sm:space-y-10 mb-8 sm:mb-12'>
          <div>
            <p className='text-gray-600 mb-3 sm:mb-4 text-base sm:text-lg'>
              既存のチームに参加する
            </p>
            <Link
              className='inline-block w-full max-w-xs bg-gray-800 text-white font-semibold py-3 sm:py-4 px-6 rounded-md hover:bg-gray-700 transition-colors text-sm sm:text-base'
              href='/teams/join'
            >
              チームに参加
            </Link>
          </div>

          <div>
            <p className='text-black mb-3 sm:mb-4 text-base sm:text-lg'>
              新しいチームを作成する
            </p>
            <Link
              className='inline-block w-full max-w-xs bg-black text-white font-semibold py-3 sm:py-4 px-6 rounded-md hover:bg-gray-800 transition-colors text-sm sm:text-base'
              href='/teams/create'
            >
              チームを作成
            </Link>
          </div>
        </div>

        <Suspense
          fallback={<p className='text-black'>{ERROR_MESSAGES.LOADING}</p>}
        >
          <TeamSelectClient />
        </Suspense>
      </div>
    </div>
  );
}
