'use client';

import { useRouter } from 'next/navigation';

export default function BackButton() {
  const router = useRouter();

  const handleBack = () => {
    // ブラウザの履歴があるかチェック
    if (window.history.length > 1) {
      router.back();
    } else {
      // 履歴がない場合はホームに戻る
      router.push('/');
    }
  };

  return (
    <button
      className='w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium'
      onClick={handleBack}
    >
      前のページに戻る
    </button>
  );
}
