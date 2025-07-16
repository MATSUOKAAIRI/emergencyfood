import { Suspense } from 'react';

import { ERROR_MESSAGES } from '@/utils/constants';

import ReviewsClient from './ReviewsClient';

export default function FoodReviewsPage() {
  return (
    <div>
      <div className='container mx-auto py-8 min-h-screen'>
        <h2 className='text-2xl font-bold mb-4 text-[#333] border-b border-gray-300'>
          食品レビュー
        </h2>
        <Suspense fallback={<p>{ERROR_MESSAGES.LOADING}</p>}>
          <ReviewsClient />
        </Suspense>
      </div>
    </div>
  );
}
