import { Suspense } from 'react';

import { ERROR_MESSAGES } from '@/utils/constants';

import FoodAddClient from './FoodAddClient';

export default function FoodAddPage() {
  return (
    <div className='container mx-auto py-8 min-h-screen'>
      <h1 className='text-2xl font-bold text-[#333] mb-30 border-b border-gray-300'>
        新しい非常食を登録
      </h1>
      <Suspense fallback={<p>{ERROR_MESSAGES.LOADING}</p>}>
        <FoodAddClient />
      </Suspense>
    </div>
  );
}
