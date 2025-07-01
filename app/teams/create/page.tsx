import Link from 'next/link';
import { Suspense } from 'react';

import { ERROR_MESSAGES, UI_CONSTANTS } from '@/utils/constants';

import CreateTeamClient from './CreateTeamClient';

export default function CreateTeamPage() {
  return (
    <div className='min-h-screen flex items-center justify-center p-6'>
      <div className='max-w-md w-full'>
        <div className='bg-white rounded-xl shadow-lg border border-gray-200 p-8'>
          <Suspense
            fallback={
              <p className='text-center py-8 text-gray-600'>
                {ERROR_MESSAGES.LOADING}
              </p>
            }
          >
            <CreateTeamClient />
          </Suspense>
        </div>

        <div className='text-center mt-6'>
          <Link
            className='text-black font-medium hover:text-gray-600 transition-colors focus:underline rounded'
            href='/teams/select'
          >
            {UI_CONSTANTS.BACK_TO_TEAM_SELECTION}
          </Link>
        </div>
      </div>
    </div>
  );
}
