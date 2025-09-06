import { Suspense } from 'react';

import { ERROR_MESSAGES } from '@/utils/constants';

import SupplyAddClient from './SupplyAddClient';

export default function SupplyAddPage() {
  return (
    <div className='container mx-auto py-8 min-h-screen'>
      <h1 className='text-2xl font-bold text-[#333] mb-7 sm:mb-30 border-b border-gray-300'>
        新しい備蓄品を登録
      </h1>
      <Suspense fallback={<p>{ERROR_MESSAGES.LOADING}</p>}>
        <SupplyAddClient />
      </Suspense>
    </div>
  );
}
