'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function EventJoinClient() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    eventPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/event/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'イベント参加に失敗しました');
      }

      router.push('/event/foods');
    } catch (_error: unknown) {
      const errorMessage =
        _error instanceof Error ? _error.message : 'エラーが発生しました';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=''>
      <form className='space-y-4 sm:space-y-6' onSubmit={handleSubmit}>
        {error && (
          <div className='bg-red-200 border text-black px-3 sm:px-4 py-3 rounded-md text-sm'>
            {error}
          </div>
        )}

        <div className='space-y-3 sm:space-y-4'>
          <div>
            <label
              className='block text-sm font-medium text-gray-900 mb-1 sm:mb-2'
              htmlFor='eventPassword'
            >
              イベントパスワード *
            </label>
            <input
              required
              className='w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 text-base'
              id='eventPassword'
              name='eventPassword'
              placeholder='イベント用のパスワードを入力'
              type='password'
              value={formData.eventPassword}
              onChange={handleChange}
            />
          </div>
        </div>

        <button
          className='w-full bg-black text-white font-semibold py-3 px-6 rounded-md hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 text-base disabled:opacity-50'
          disabled={loading}
          type='submit'
        >
          {loading ? '参加中...' : 'イベントに参加'}
        </button>

        <div className='text-center mt-4 sm:mt-6'>
          <p className='text-sm text-gray-600'>
            通常のログインは
            <a
              className='text-black underline ml-1 hover:text-gray-700'
              href='/auth/login'
            >
              こちら
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}
