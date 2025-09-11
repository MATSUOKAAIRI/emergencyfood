import { Suspense } from 'react';

import { ERROR_MESSAGES } from '@/utils/constants';

import EventSupplyEditClient from './EventSupplyEditClient';

interface EventSupplyEditPageProps {
  params: Promise<{
    supplyId: string;
  }>;
}

export default async function EventSupplyEditPage({
  params,
}: EventSupplyEditPageProps) {
  const { supplyId } = await params;

  return (
    <div className='mt-12 items-center flex flex-col mix-h-screen'>
      <h1 className='text-5xl font-bold mb-10 text-[#333]'>備蓄品編集</h1>
      <Suspense fallback={<p>{ERROR_MESSAGES.LOADING}</p>}>
        <EventSupplyEditClient supplyId={supplyId} />
      </Suspense>
    </div>
  );
}
