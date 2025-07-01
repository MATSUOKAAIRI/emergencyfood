// components/foods/FoodForm.tsx
'use client';
import type { FoodFormData } from '@/types';
import {
  ERROR_MESSAGES,
  FOOD_CATEGORIES,
  SUCCESS_MESSAGES,
} from '@/utils/constants';
import { db } from '@/utils/firebase';
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

type FoodFormProps = {
  uid: string | null;
  teamId: string | null;
  mode?: 'add' | 'edit';
  foodId?: string;
  initialData?: FoodFormData;
};

export default function FoodForm({
  uid,
  teamId,
  mode = 'add',
  foodId,
  initialData,
}: FoodFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<FoodFormData>({
    name: '',
    quantity: 1,
    expiryDate: '',
    category: '',
    amount: undefined,
    purchaseLocation: undefined,
    label: undefined,
    storageLocation: undefined,
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 編集モードの場合、初期データを設定
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setFormData(initialData);
    }
  }, [mode, initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setSubmitting(true);

    if (!uid) {
      setErrorMessage(ERROR_MESSAGES.UNAUTHORIZED);
      setSubmitting(false);
      return;
    }
    if (!teamId) {
      setErrorMessage(ERROR_MESSAGES.TEAM_ID_MISSING);
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
    } = formData;

    if (!name || !quantity || !expiryDate || !category) {
      setErrorMessage('必須フィールドをすべて入力してください。');
      setSubmitting(false);
      return;
    }

    try {
      if (mode === 'add') {
        // 新規追加
        const data = {
          name,
          quantity: Number(quantity),
          expiryDate,
          isArchived: false,
          category,
          amount: amount !== undefined ? Number(amount) : null,
          purchaseLocation: purchaseLocation || null,
          label: label || null,
          storageLocation: storageLocation || '未設定',
          registeredAt: serverTimestamp(),
          teamId,
          uid,
        };
        await addDoc(collection(db, 'foods'), data);
        setFormData({
          name: '',
          quantity: 1,
          expiryDate: '',
          category: '',
          amount: undefined,
          purchaseLocation: undefined,
          label: undefined,
          storageLocation: undefined,
        });
        setSuccessMessage(SUCCESS_MESSAGES.FOOD_CREATED);
      } else {
        // 編集更新
        if (!foodId) {
          setErrorMessage('食品IDが見つかりません。');
          setSubmitting(false);
          return;
        }

        const updates = {
          name,
          quantity: Number(quantity),
          expiryDate,
          category,
          amount: amount !== undefined ? Number(amount) : null,
          purchaseLocation: purchaseLocation || null,
          label: label || null,
          storageLocation: storageLocation || '未設定',
        };

        const foodRef = doc(db, 'foods', foodId);
        await updateDoc(foodRef, updates);
        setSuccessMessage('食品情報が正常に更新されました！');

        // 少し待ってからリダイレクト
        setTimeout(() => {
          router.push('/foods/list');
        }, 1500);
      }
    } catch (error: any) {
      console.error('Error saving document: ', error);
      setErrorMessage(
        mode === 'add'
          ? ERROR_MESSAGES.FOOD_CREATE_FAILED
          : '食品情報の更新に失敗しました。'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
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
            className='w-full px-3 py-2 border border-gray-300 rounded'
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
            className='w-full px-3 py-2 border border-gray-300 rounded'
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
            className='w-full px-3 py-2 border border-gray-300 rounded'
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
            className='w-full px-3 py-2 border border-gray-300 rounded'
            id='category'
            name='category'
            value={formData.category}
            onChange={handleChange}
          >
            <option value=''>選択してください</option>
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
            htmlFor='amount'
          >
            金額 (円)
          </label>
          <input
            className='w-full px-3 py-2 border border-gray-300 rounded'
            id='amount'
            min='0'
            name='amount'
            placeholder='任意'
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
            className='w-full px-3 py-2 border border-gray-300 rounded'
            id='purchaseLocation'
            name='purchaseLocation'
            placeholder='任意'
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
            className='w-full px-3 py-2 border border-gray-300 rounded'
            id='label'
            name='label'
            placeholder='任意'
            type='text'
            value={formData.label || ''}
            onChange={handleChange}
          />
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
            type='text'
            value={formData.storageLocation || ''}
            onChange={handleChange}
            placeholder='例: 冷蔵庫、棚、地下室など'
          />
        </div>
      </div>

      <button
        disabled={submitting}
        className='w-full bg-gray-800 text-white font-semibold py-3 px-4 rounded mt-6 disabled:opacity-50 disabled:cursor-not-allowed'
        type='submit'
      >
        {submitting
          ? mode === 'add'
            ? '登録中...'
            : '更新中...'
          : mode === 'add'
            ? '登録'
            : '更新'}
      </button>
    </form>
  );
}
