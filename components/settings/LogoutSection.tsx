'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useAuth } from '@/hooks';
import { UI_CONSTANTS } from '@/utils/constants';

export default function LogoutSection() {
  const { logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      setLoading(false);
    }
  };

  return (
    <div className='space-y-6'>
      <h2 className='text-xl font-semibold text-gray-900 mb-4'>
        {UI_CONSTANTS.LOGOUT}
      </h2>
      <div className='flex items-start space-x-3'>
        <div className='flex-1'>
          <div className='mt-2 text-sm text-gray-700'>
            <p>
              ログアウトすると、現在のセッションが終了し、ログイン画面に戻ります。
            </p>
            <p className='mt-1'>
              再度ログインする際は、メールアドレスとパスワードが必要です。
            </p>
          </div>
        </div>
      </div>

      {showConfirm ? (
        <div className='space-y-4'>
          <div className='p-4 bg-red-200 border rounded-lg'>
            <p className='text-sm text-black'>{UI_CONSTANTS.CONFIRM_LOGOUT}</p>
          </div>

          <div className='flex space-x-3'>
            <button
              onClick={handleLogout}
              disabled={loading}
              className='px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 transition-colors'
            >
              {loading ? UI_CONSTANTS.PROCESSING : 'ログアウトする'}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              disabled={loading}
              className='px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50 transition-colors'
            >
              {UI_CONSTANTS.CANCEL}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowConfirm(true)}
          className='px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors font-medium'
        >
          {UI_CONSTANTS.LOGOUT}
        </button>
      )}
    </div>
  );
}
