import type { Metadata } from 'next';
import { Suspense } from 'react';

import { Card } from '@/components/ui';

import SupplyListClient from './SupplyListClient';

// Server Component: Metadata generation
export const metadata: Metadata = {
  title: '備蓄品リスト - SonaBase',
  description: '登録された備蓄品の一覧を確認し、管理できます。',
  keywords: ['備蓄品', '一覧', 'リスト', '管理', '防災'],
};

// Server Component: Layout and static content
export default function SupplyListPage() {
  return (
    <div className='container mx-auto py-8 min-h-screen'>
      <header className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>備蓄品リスト</h1>
        <p className='text-gray-600'>
          登録された備蓄品を確認し、賞味期限や在庫を管理しましょう。
        </p>
      </header>

      <main>
        <Suspense
          fallback={
            <div className='space-y-4'>
              <Card>
                <div className='animate-pulse'>
                  <div className='flex justify-between items-center mb-4'>
                    <div className='h-6 bg-gray-200 rounded w-1/4' />
                    <div className='h-8 bg-gray-200 rounded w-20' />
                  </div>
                  <div className='space-y-3'>
                    <div className='h-4 bg-gray-200 rounded' />
                    <div className='h-4 bg-gray-200 rounded w-3/4' />
                    <div className='h-4 bg-gray-200 rounded w-1/2' />
                  </div>
                </div>
              </Card>
              <Card>
                <div className='animate-pulse'>
                  <div className='flex justify-between items-center mb-4'>
                    <div className='h-6 bg-gray-200 rounded w-1/3' />
                    <div className='h-8 bg-gray-200 rounded w-20' />
                  </div>
                  <div className='space-y-3'>
                    <div className='h-4 bg-gray-200 rounded' />
                    <div className='h-4 bg-gray-200 rounded w-2/3' />
                  </div>
                </div>
              </Card>
            </div>
          }
        >
          <SupplyListClient />
        </Suspense>
      </main>
    </div>
  );
}
