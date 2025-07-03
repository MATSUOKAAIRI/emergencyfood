import { Suspense } from 'react';

import { ERROR_MESSAGES } from '@/utils/constants';

import EventFoodsClient from './EventFoodsClient';

export default function EventFoodsPage() {
  return (
    <div className='max-w-7xl mx-auto'>
      <div className='mb-6 sm:mb-8'>
        <h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>
          非常食一覧
        </h1>
        <p className='text-gray-600 mt-2 text-sm sm:text-base'>
          イベント用の非常食を管理できます
        </p>
      </div>
      <Suspense
        fallback={<p className='text-center py-8'>{ERROR_MESSAGES.LOADING}</p>}
      >
        <EventFoodsClient />
      </Suspense>
    </div>
  );
}
