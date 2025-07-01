// app/auth/login/page.tsx
import Link from 'next/link';
import { Suspense } from 'react';

import { ERROR_MESSAGES, UI_CONSTANTS } from '@/utils/constants';

import LoginClient from './LoginClient';

export default function Login() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-6'>
      <div className='max-w-md w-full'>
        <div className='bg-white rounded-xl shadow-lg border border-gray-200 p-8'>
          <Suspense
            fallback={
              <div className='text-center py-8'>
                <p className='text-gray-600'>{ERROR_MESSAGES.LOADING}</p>
              </div>
            }
          >
            <LoginClient />
          </Suspense>
        </div>

        <div className='text-center mt-6'>
          <p className='text-gray-600 mb-2'>
            {UI_CONSTANTS.NO_ACCOUNT_MESSAGE}
          </p>
          <Link
            className='text-black font-medium hover:text-gray-600 transition-colors focus:underline rounded'
            href='/auth/register'
          >
            {UI_CONSTANTS.REGISTER_LINK}
          </Link>
        </div>
      </div>
    </div>
  );
}
