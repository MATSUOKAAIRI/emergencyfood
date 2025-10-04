import type { Metadata } from 'next';
import { Suspense } from 'react';

import { Card } from '@/components/ui';

import SupplyAddClient from './SupplyAddClient';

// Server Component: Metadata generation
export const metadata: Metadata = {
  title: '備蓄品追加 - SonaBase',
  description: '新しい備蓄品を登録して、防災準備を充実させましょう。',
  keywords: ['備蓄品', '防災', '登録', '追加'],
};

// Server Component: Layout and static content
export default function SupplyAddPage() {
  return (
    <div className='container mx-auto py-8 min-h-screen'>
      <header className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>
          新しい備蓄品を登録
        </h1>
        <p className='text-gray-600'>
          備蓄品の詳細情報を入力して、防災準備を記録しましょう。
        </p>
      </header>

      <main>
        <Suspense
          fallback={
            <Card className='max-w-2xl mx-auto'>
              <div className='animate-pulse space-y-6'>
                <div className='h-4 bg-gray-200 rounded w-1/4' />
                <div className='space-y-3'>
                  <div className='h-10 bg-gray-200 rounded' />
                  <div className='h-10 bg-gray-200 rounded' />
                  <div className='h-10 bg-gray-200 rounded' />
                </div>
                <div className='h-12 bg-gray-200 rounded' />
              </div>
            </Card>
          }
        >
          <SupplyAddClient />
        </Suspense>
      </main>
    </div>
  );
}
