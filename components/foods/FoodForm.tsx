// components/foods/FoodForm.tsx
'use client';
import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/utils/firebase';

type FormData = {
  name: string;
  quantity: number;
  expiryDate: string;
  category: string;
  amount?: number;
  purchaseLocation?: string;
  label?: string;
  storageLocation?: string;
};

type FoodFormProps = {
  uid: string | null;
  teamId: string | null;
};

export default function FoodForm({ uid, teamId }: FoodFormProps) {
  const [formData, setFormData] = useState<FormData>({
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!uid) {
      setErrorMessage('ログインしていません。');
      return;
    }
    if (!teamId) {
      setErrorMessage('チームIDが設定されていません。');
      return;
    }

    try {
      const { name, quantity, expiryDate, category, amount, purchaseLocation, label, storageLocation } = formData;
      await addDoc(collection(db, 'foods'), {
        name,
        quantity: Number(quantity),
        expiryDate,
        category,
        amount: amount !== undefined ? Number(amount) : undefined,
        purchaseLocation,
        label,
        storageLocation,
        registeredAt: serverTimestamp(),
        teamId,
        uid,
      });
      setFormData({ name: '', quantity: 1, expiryDate: '', category: '', amount: undefined, purchaseLocation: undefined, label: undefined, storageLocation: undefined });
      setSuccessMessage('非常食を登録しました！');
    } catch (error: any) {
      console.error('Error adding document: ', error);
      setErrorMessage('登録に失敗しました。');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 border rounded mb-4">
      <h2 className="text-xl font-bold mb-4">非常食の登録</h2>
      {errorMessage && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{errorMessage}</div>}
      {successMessage && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">{successMessage}</div>}
      <div className="mb-4">
        <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">品名</label>
        <input
        type="text"
        id="name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        required
      />
      </div>
      <div className="mb-4">
        <label htmlFor="quantity" className="block text-gray-700 text-sm font-bold mb-2">数量</label>
        <input
          type="number"
          id="quantity"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          min="0"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="expiryDate" className="block text-gray-700 text-sm font-bold mb-2">賞味期限 (YYYY-MM-DD)</label>
        <input
          type="date"
          id="expiryDate"
          name="expiryDate"
          value={formData.expiryDate}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="category" className="block text-gray-700 text-sm font-bold mb-2">カテゴリ</label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        >
          <option value="">選択してください</option>
          <option value="水">水</option>
          <option value="食料">食料</option>
          <option value="その他">その他</option>
        </select>
      </div>
      <div className="mb-4">
        <label htmlFor="amount" className="block text-gray-700 text-sm font-bold mb-2">金額 (円)</label>
        <input
          type="number"
          id="amount"
          name="amount"
          value={formData.amount || ''}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          min="0"
          placeholder="任意"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="purchaseLocation" className="block text-gray-700 text-sm font-bold mb-2">買った場所</label>
        <input
          type="text"
          id="purchaseLocation"
          name="purchaseLocation"
          value={formData.purchaseLocation || ''}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="任意"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="label" className="block text-gray-700 text-sm font-bold mb-2">ラベル</label>
        <input
          type="text"
          id="label"
          name="label"
          value={formData.label || ''}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="任意"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="storageLocation" className="block text-gray-700 text-sm font-bold mb-2">保存場所</label>
        <input
          type="text"
          id="storageLocation"
          name="storageLocation"
          value={formData.storageLocation || ''}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="任意"
        />
      </div>
      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        登録
      </button>
    </form>
  );
}