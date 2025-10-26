import { ERROR_MESSAGES, UI_CONSTANTS } from '@/utils/constants';
import Link from 'next/link';
import { Suspense } from 'react';
import RegisterClient from './RegisterClient';

export default function Register() {
  return (
    <div className='min-h-screen flex items-center justify-center'>
      <div className='max-w-md w-full'>
        <div className='bg-white rounded-xl border border-gray-200 p-8 mb-4'>
          <Suspense
            fallback={
              <div className='text-center py-8'>
                <p className='text-gray-600'>{ERROR_MESSAGES.LOADING}</p>
              </div>
            }
          >
            <RegisterClient />
          </Suspense>
        </div>

        <div className='text-center'>
          <p className='text-gray-600 mb-2'>
            {UI_CONSTANTS.HAS_ACCOUNT_MESSAGE}
          </p>
          <Link
            className='text-black font-medium hover:text-gray-600 transition-colors focus:underline rounded'
            href='/auth/login'
          >
            {UI_CONSTANTS.LOGIN_LINK}
          </Link>
        </div>
      </div>
    </div>
  );
}
