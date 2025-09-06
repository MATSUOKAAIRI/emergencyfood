import { Suspense } from 'react';

import { ERROR_MESSAGES } from '@/utils/constants';

import SupplyListClient from './SupplyListClient';

export default function SupplyListPage() {
  return (
    <div className='container mx-auto py-8 mix-h-screen'>
      <h1 className='text-2xl font-bold mb-6 text-black border-b border-gray-300 pb-4'>
        備蓄品リスト
      </h1>
      <Suspense fallback={<p>{ERROR_MESSAGES.LOADING}</p>}>
        <SupplyListClient />
      </Suspense>
    </div>
  );
}
