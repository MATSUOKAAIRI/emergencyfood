import { Suspense } from 'react';

import { ERROR_MESSAGES } from '@/utils/constants';

import EventFoodEditClient from './EventFoodEditClient';

interface EventFoodEditPageProps {
  params: Promise<{
    foodId: string;
  }>;
}

export default async function EventFoodEditPage({
  params,
}: EventFoodEditPageProps) {
  const { foodId } = await params;

  return (
    <div className='mt-12 items-center flex flex-col mix-h-screen'>
      <h1 className='text-5xl font-bold mb-10 text-[#333]'>非常食編集</h1>
      <Suspense fallback={<p>{ERROR_MESSAGES.LOADING}</p>}>
        <EventFoodEditClient foodId={foodId} />
      </Suspense>
    </div>
  );
}
