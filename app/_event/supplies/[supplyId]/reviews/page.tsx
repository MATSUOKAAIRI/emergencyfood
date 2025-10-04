import { Suspense } from 'react';

import { ERROR_MESSAGES } from '@/utils/constants';

import EventReviewsClient from './EventReviewsClient';

interface EventReviewsPageProps {
  params: Promise<{
    supplyId: string;
  }>;
}

export default async function EventReviewsPage({
  params,
}: EventReviewsPageProps) {
  const { supplyId } = await params;

  return (
    <div className='container mx-auto py-8 min-h-screen'>
      <h1 className='text-2xl font-bold mb-10 text-[#333] border-b border-gray-300'>
        備蓄品レビュー
      </h1>
      <Suspense fallback={<p>{ERROR_MESSAGES.LOADING}</p>}>
        <EventReviewsClient supplyId={supplyId} />
      </Suspense>
    </div>
  );
}
