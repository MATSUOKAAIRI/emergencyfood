import { Suspense } from 'react';

import { ERROR_MESSAGES } from '@/utils/constants';

import FoodListClient from './FoodListClient';

export default function FoodListPage() {
  return (
    <div className='container mx-auto py-8 mix-h-screen'>
      <h1 className='text-2xl font-bold mb-6 text-black border-b border-gray-300 pb-4'>
        非常食リスト
      </h1>
      <Suspense fallback={<p>{ERROR_MESSAGES.LOADING}</p>}>
        <FoodListClient />
      </Suspense>
    </div>
  );
}
