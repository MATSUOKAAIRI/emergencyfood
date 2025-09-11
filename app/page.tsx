import type { Metadata } from 'next';
import Link from 'next/link';

import { UI_CONSTANTS } from '@/utils/constants';

export const metadata: Metadata = {
  title: 'SonaBase - 非常時備蓄品管理アプリ',
  description:
    '家族で非常時の備えを管理するためのアプリケーション。備蓄品の登録・管理、期限チェック、家族間での情報共有が可能です。',
  keywords: [
    '備蓄品',
    '防災',
    '家族',
    '管理',
    '非常時',
    '期限管理',
    'LINE通知',
  ],
  openGraph: {
    title: 'SonaBase - 非常時備蓄品管理アプリ',
    description: '家族で非常時の備えを管理するためのアプリケーション',
    type: 'website',
  },
};

export default function Home() {
  return (
    <div className='min-h-screen bg-white flex items-center justify-center p-4'>
      <div className='max-w-md w-full'>
        <h1 className='text-center mb-12 text-5xl font-bold text-gray-900'>
          SonaBase
        </h1>

        <div className='space-y-6'>
          <div className='bg-gray-50 rounded-lg p-8 border border-gray-200'>
            <h2 className='text-xl font-semibold mb-3 text-gray-900'>
              ログイン
            </h2>
            <p className='text-gray-600 mb-6 text-sm'>
              アカウントをお持ちの方はこちらからログインしてください。
            </p>
            <Link
              className='w-full inline-block bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 text-center'
              href='/auth/login'
            >
              {UI_CONSTANTS.LOGIN_LINK}
            </Link>
          </div>

          <div className='bg-gray-50 rounded-lg p-8 border border-gray-200'>
            <h2 className='text-xl font-semibold mb-3 text-gray-900'>
              新規登録
            </h2>
            <p className='text-gray-600 mb-6 text-sm'>
              初めてご利用の方はこちらからユーザー登録を行ってください。
            </p>
            <Link
              className='w-full inline-block bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 text-center'
              href='/auth/register'
            >
              {UI_CONSTANTS.REGISTER_LINK}
            </Link>
          </div>

          {/* <div className='bg-gray-100 rounded-lg p-8 border border-gray-300'>
            <h2 className='text-xl font-semibold mb-3 text-gray-900'>
              期間限定表示
            </h2>
            <p className='text-gray-600 mb-6 text-sm'>
              技育博用の特別ページです。名前とパスワードで簡単に参加できます。
            </p>
            <Link
              className='w-full inline-block bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 text-center'
              href='/event'
            >
              ボタン
            </Link>
          </div> */}
        </div>
      </div>
    </div>
  );
}
