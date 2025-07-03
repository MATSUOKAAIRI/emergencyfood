'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useEventAuth } from '@/hooks/event/useEventAuth';
import {
  ERROR_MESSAGES,
  FOOD_CATEGORIES,
  SUCCESS_MESSAGES,
} from '@/utils/constants';

interface EventFoodFormData {
  name: string;
  quantity: number;
  expiryDate: string;
  category: string;
  amount?: number | null;
  purchaseLocation?: string | null;
  label?: string | null;
  storageLocation?: string | null;
}

export default function EventFoodAddClient() {
  const _router = useRouter();
  const { eventUser } = useEventAuth();
  const [formData, setFormData] = useState<EventFoodFormData>({
    name: '',
    quantity: 1,
    expiryDate: '',
    category: FOOD_CATEGORIES[0],
    amount: null,
    purchaseLocation: null,
    label: null,
    storageLocation: null,
  });
  const [_loading, _setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!eventUser) {
      setError('イベントセッションが見つかりません。再度参加してください。');
      return;
    }

    const {
      name,
      quantity,
      expiryDate,
      category,
      amount,
      purchaseLocation,
      label,
      storageLocation,
    } = formData;

    if (!name || !quantity || !expiryDate || !category) {
      setError('必須フィールドをすべて入力してください。');
      return;
    }
    try {
      const response = await fetch('/api/event/foods?teamId=giikuHaku-2025', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          quantity: Number(quantity),
          expiryDate,
          category,
          amount: amount !== undefined ? Number(amount) : null,
          purchaseLocation: purchaseLocation || null,
          label: label || null,
          storageLocation: storageLocation || '未設定',
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || '食品の追加に失敗しました');
      }

      setFormData({
        name: '',
        quantity: 1,
        expiryDate: '',
        category: FOOD_CATEGORIES[0],
        amount: null,
        purchaseLocation: null,
        label: null,
        storageLocation: null,
      });
      setSuccessMessage(SUCCESS_MESSAGES.FOOD_CREATED);
    } catch (_error: unknown) {
      // console.error removed
      const errorMessage =
        _error instanceof Error
          ? _error.message
          : ERROR_MESSAGES.FOOD_CREATE_FAILED;
      setError(errorMessage);
    }
  };

  return (
    <div className='max-w-2xl mx-auto p-6'>
      <h1 className='text-2xl font-semibold mb-6 text-gray-900'>
        イベント用 新しい非常食を登録
      </h1>

      {eventUser && (
        <div className='mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
          <p className='text-sm text-blue-800'>
            登録者: <span className='font-medium'>イベント参加者</span>
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {error && (
          <div className='bg-red-200 border text-black px-4 py-3 rounded mb-4'>
            {error}
          </div>
        )}
        {successMessage && (
          <div className='bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4'>
            {successMessage}
          </div>
        )}

        <div className='space-y-4'>
          <div>
            <label
              className='block text-sm font-medium text-gray-700 mb-1'
              htmlFor='name'
            >
              品名 *
            </label>
            <input
              required
              className='w-full px-3 py-2 border border-gray-300 rounded text-gray-900 bg-white'
              id='name'
              name='name'
              type='text'
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label
              className='block text-sm font-medium text-gray-700 mb-1'
              htmlFor='quantity'
            >
              数量 *
            </label>
            <input
              required
              className='w-full px-3 py-2 border border-gray-300 rounded text-gray-900 bg-white'
              id='quantity'
              min='1'
              name='quantity'
              type='number'
              value={formData.quantity}
              onChange={handleChange}
            />
          </div>

          <div>
            <label
              className='block text-sm font-medium text-gray-700 mb-1'
              htmlFor='expiryDate'
            >
              賞味期限 *
            </label>
            <input
              required
              className='w-full px-3 py-2 border border-gray-300 rounded text-gray-900 bg-white'
              id='expiryDate'
              min={new Date().toISOString().split('T')[0]}
              name='expiryDate'
              type='date'
              value={formData.expiryDate}
              onChange={handleChange}
            />
          </div>

          <div>
            <label
              className='block text-sm font-medium text-gray-700 mb-1'
              htmlFor='category'
            >
              カテゴリ *
            </label>
            <select
              required
              className='w-full px-3 py-2 border border-gray-300 rounded text-gray-900 bg-white'
              id='category'
              name='category'
              value={formData.category}
              onChange={handleChange}
            >
              <option value=''>カテゴリを選択</option>
              {FOOD_CATEGORIES.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              className='block text-sm font-medium text-gray-700 mb-1'
              htmlFor='storageLocation'
            >
              保存場所
            </label>
            <input
              className='w-full px-3 py-2 border border-gray-300 rounded text-gray-900 bg-white'
              id='storageLocation'
              name='storageLocation'
              placeholder='例: 冷蔵庫、棚、地下室など'
              type='text'
              value={formData.storageLocation || ''}
              onChange={handleChange}
            />
          </div>

          <div>
            <label
              className='block text-sm font-medium text-gray-700 mb-1'
              htmlFor='amount'
            >
              金額（円）
            </label>
            <input
              className='w-full px-3 py-2 border border-gray-300 rounded text-gray-900 bg-white'
              id='amount'
              min='0'
              name='amount'
              type='number'
              value={formData.amount || ''}
              onChange={handleChange}
            />
          </div>

          <div>
            <label
              className='block text-sm font-medium text-gray-700 mb-1'
              htmlFor='purchaseLocation'
            >
              購入場所
            </label>
            <input
              className='w-full px-3 py-2 border border-gray-300 rounded text-gray-900 bg-white'
              id='purchaseLocation'
              name='purchaseLocation'
              type='text'
              value={formData.purchaseLocation || ''}
              onChange={handleChange}
            />
          </div>

          <div>
            <label
              className='block text-sm font-medium text-gray-700 mb-1'
              htmlFor='label'
            >
              ラベル
            </label>
            <input
              className='w-full px-3 py-2 border border-gray-300 rounded text-gray-900 bg-white'
              id='label'
              name='label'
              type='text'
              value={formData.label || ''}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className='flex justify-end space-x-4 mt-6'>
          <Link
            className='px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50'
            href='/event/foods'
          >
            キャンセル
          </Link>
          <button
            className='px-4 py-2 bg-black text-white rounded hover:bg-gray-800'
            type='submit'
          >
            登録
          </button>
        </div>
      </form>
    </div>
  );
}
