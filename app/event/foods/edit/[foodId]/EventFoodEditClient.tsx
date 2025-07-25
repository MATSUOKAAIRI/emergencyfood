'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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
  notes?: string;
}

interface EventFoodEditClientProps {
  foodId: string;
}

export default function EventFoodEditClient({
  foodId,
}: EventFoodEditClientProps) {
  const router = useRouter();
  const { eventUser } = useEventAuth();
  const [formData, setFormData] = useState<EventFoodFormData>({
    name: '',
    quantity: 1,
    expiryDate: '',
    category: '',
    amount: undefined,
    purchaseLocation: undefined,
    label: undefined,
    storageLocation: undefined,
    notes: undefined,
  });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchFood = async () => {
      try {
        const response = await fetch(
          `/api/event/foods/${foodId}?teamId=giikuHaku-2025`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || '食品データの取得に失敗しました');
        }

        const food = data.food;
        setFormData({
          name: food.name || '',
          quantity: food.quantity || 1,
          expiryDate: food.expiryDate || '',
          category: food.category || '',
          amount: food.amount || undefined,
          purchaseLocation: food.purchaseLocation || undefined,
          label: food.label || undefined,
          storageLocation: food.storageLocation || undefined,
          notes: food.notes || undefined,
        });
      } catch (_error: unknown) {
        const errorMessage =
          _error instanceof Error
            ? _error.message
            : '食品データの取得に失敗しました';
        setErrorMessage(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchFood();
  }, [foodId]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setSubmitting(true);

    if (!eventUser) {
      setErrorMessage(
        'イベントセッションが見つかりません。再度参加してください。'
      );
      setSubmitting(false);
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
      notes,
    } = formData;

    if (!name || !quantity || !expiryDate || !category) {
      setErrorMessage('必須フィールドをすべて入力してください。');
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch(
        `/api/event/foods/update?teamId=giikuHaku-2025`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            foodId,
            name,
            quantity: Number(quantity),
            expiryDate,
            category,
            amount: amount !== undefined ? Number(amount) : null,
            purchaseLocation: purchaseLocation || null,
            label: label || null,
            storageLocation: storageLocation || '未設定',
            notes: notes || null,
            updatedBy: eventUser.name,
          }),
        }
      );

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || '食品の更新に失敗しました');
      }

      setSuccessMessage(SUCCESS_MESSAGES.FOOD_UPDATED);

      setTimeout(() => {
        router.push('/event/foods');
      }, 3000);
    } catch (_error: unknown) {
      const errorMessage =
        _error instanceof Error
          ? _error.message
          : ERROR_MESSAGES.FOOD_UPDATE_FAILED;
      setErrorMessage(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <p className='text-gray-600'>{ERROR_MESSAGES.LOADING}</p>
      </div>
    );
  }

  if (errorMessage && !submitting) {
    return (
      <div className='max-w-2xl mx-auto p-6'>
        <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4'>
          {errorMessage}
        </div>
        <Link
          className='inline-block bg-gray-800 text-white font-semibold py-2 px-4 rounded hover:bg-gray-700'
          href='/event/foods'
        >
          一覧に戻る
        </Link>
      </div>
    );
  }

  return (
    <div className='max-w-2xl mx-auto p-6'>
      <h1 className='text-2xl font-semibold mb-6 text-gray-900'>
        イベント用 非常食を編集
      </h1>

      {eventUser && (
        <div className='mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
          <p className='text-sm text-blue-800'>
            編集者: <span className='font-medium'>イベント参加者</span>
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {errorMessage && (
          <div className='bg-red-200 border text-black px-4 py-3 rounded mb-4'>
            {errorMessage}
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

          <div>
            <label
              className='block text-sm font-medium text-gray-700 mb-1'
              htmlFor='notes'
            >
              メモ
            </label>
            <textarea
              className='w-full px-3 py-2 border border-gray-300 rounded text-gray-900 bg-white'
              id='notes'
              name='notes'
              rows={3}
              value={formData.notes || ''}
              onChange={handleChange}
            />
          </div>

          <div className='flex space-x-4 pt-4'>
            <button
              className='flex-1 bg-gray-800 text-white font-semibold py-2 px-4 rounded hover:bg-gray-700 disabled:opacity-50'
              disabled={submitting}
              type='submit'
            >
              {submitting ? '更新中...' : '更新する'}
            </button>
            <Link
              className='flex-1 text-center bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded hover:bg-gray-300'
              href='/event/foods'
            >
              キャンセル
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
