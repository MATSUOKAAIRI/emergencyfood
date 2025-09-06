import { Card } from '@/components/ui';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import DisasterBoardClient from './DisasterBoardClient';

// Server Component: Metadata generation
export const metadata: Metadata = {
  title: '災害用伝言板 - SonaBase',
  description:
    '災害時の避難場所や安否確認方法など、家族で事前に共有すべき情報を管理します。',
  keywords: ['災害', '避難場所', '安否確認', '防災', '伝言板', '家族'],
};

// Server Component: Layout and static content
export default function DisasterBoardPage() {
  return (
    <div className='container mx-auto py-8 min-h-screen'>
      <header className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>災害用伝言板</h1>
        <p className='text-gray-600'>
          災害時に備えて、避難場所や安否確認方法など、家族で事前に共有すべき情報を登録・管理しましょう。
        </p>
      </header>

      <main>
        <Suspense
          fallback={
            <div className='space-y-6'>
              <Card>
                <div className='animate-pulse'>
                  <div className='h-6 bg-gray-200 rounded w-1/4 mb-4' />
                  <div className='space-y-3'>
                    <div className='h-4 bg-gray-200 rounded' />
                    <div className='h-4 bg-gray-200 rounded w-3/4' />
                    <div className='h-4 bg-gray-200 rounded w-1/2' />
                  </div>
                </div>
              </Card>
              <Card>
                <div className='animate-pulse'>
                  <div className='h-6 bg-gray-200 rounded w-1/3 mb-4' />
                  <div className='space-y-3'>
                    <div className='h-4 bg-gray-200 rounded' />
                    <div className='h-4 bg-gray-200 rounded w-2/3' />
                  </div>
                </div>
              </Card>
              <Card>
                <div className='animate-pulse'>
                  <div className='h-6 bg-gray-200 rounded w-1/4 mb-4' />
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='h-20 bg-gray-200 rounded' />
                    <div className='h-20 bg-gray-200 rounded' />
                  </div>
                </div>
              </Card>
            </div>
          }
        >
          <DisasterBoardClient />
        </Suspense>
      </main>
    </div>
  );
}
