import { Suspense } from 'react';

import { ERROR_MESSAGES } from '@/utils/constants';

import EventSupplyAddClient from './EventSupplyAddClient';

export default function EventSupplyAddPage() {
  return (
    <div className='max-w-2xl mx-auto'>
      <div className='mb-6 sm:mb-8'>
        <h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>
          新しい備蓄品を登録
        </h1>
        <p className='text-gray-600 mt-2 text-sm sm:text-base'>
          イベント用の備蓄品を登録できます
        </p>
      </div>
      <Suspense
        fallback={<p className='text-center py-8'>{ERROR_MESSAGES.LOADING}</p>}
      >
        <EventSupplyAddClient />
      </Suspense>
    </div>
  );
}
