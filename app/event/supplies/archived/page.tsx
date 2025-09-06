import { Suspense } from 'react';

import { ERROR_MESSAGES } from '@/utils/constants';

import EventArchivedSuppliesClient from './EventArchivedSuppliesClient';

export default function EventArchivedSupplysPage() {
  return (
    <div className='max-w-7xl mx-auto'>
      <div className='mb-6 sm:mb-8'>
        <h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>
          過去の備蓄品
        </h1>
        <p className='text-gray-600 mt-2 text-sm sm:text-base'>
          イベント用の過去の備蓄品を確認できます
        </p>
      </div>
      <Suspense
        fallback={<p className='text-center py-8'>{ERROR_MESSAGES.LOADING}</p>}
      >
        <EventArchivedSuppliesClient />
      </Suspense>
    </div>
  );
}
