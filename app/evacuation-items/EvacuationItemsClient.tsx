'use client';

import { Card } from '@/components/ui/layout/Card';
import { useState } from 'react';
import PrimaryEvacuationItems from './_components/PrimaryEvacuationItems';
import SecondaryEvacuationItems from './_components/SecondaryEvacuationItems';

export default function EvacuationItemsClient() {
  const [activeTab, setActiveTab] = useState<'primary' | 'secondary'>(
    'primary'
  );

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center mb-8 border-gray-200 border-b p-4'>
          <h1 className='text-3xl font-bold text-gray-900 mb-4'>
            避難用持ち物リスト
          </h1>
          <p className='text-lg text-gray-600'>
            災害時の避難に必要な持ち物を確認しよう
          </p>
        </div>

        <div className='mb-8'>
          <div className='flex justify-center'>
            <div className='flex bg-gray-100 rounded-lg p-1'>
              <button
                onClick={() => setActiveTab('primary')}
                className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'primary'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                一次避難
              </button>
              <button
                onClick={() => setActiveTab('secondary')}
                className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'secondary'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                二次避難
              </button>
            </div>
          </div>
        </div>

        <Card className='p-6'>
          {activeTab === 'primary' ? (
            <PrimaryEvacuationItems />
          ) : (
            <SecondaryEvacuationItems />
          )}
        </Card>

        <div className='mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-2'>
            避難の基本知識
          </h3>
          <div className='text-gray-800 space-y-2'>
            <p>
              <strong>一次避難：</strong>
              災害発生時に身の安全を確保するための緊急避難。
              最低限の貴重品と身を守るためのものを持参。
            </p>
            <p>
              <strong>二次避難：</strong>
              避難所での生活が長期化する場合に備えた避難。
              生活に必要な物品を追加で持参。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
