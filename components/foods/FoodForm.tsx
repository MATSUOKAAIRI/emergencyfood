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
    const { name, quantity, expiryDate, category, amount, purchaseLocation, label, storageLocation } = formData;

    if (!name || !quantity || !expiryDate || !category) {
      setErrorMessage('必須フィールドをすべて入力してください。');
      return;
    }
    try {
     const data ={
        name,
        quantity: Number(quantity),
        expiryDate,
        category,
        amount: amount !== undefined ? Number(amount) : null, // undefined なら null
        purchaseLocation: purchaseLocation || null, // undefined または空文字列なら null
        label: label || null, // undefined または空文字列なら null
        storageLocation: storageLocation || '未設定',
        registeredAt: serverTimestamp(),
        teamId,
        uid,
      };
      await addDoc(collection(db, 'foods'), data);
      setFormData({ name: '', quantity: 1, expiryDate: '', category: '', amount: undefined, purchaseLocation: undefined, label: undefined, storageLocation: undefined });
      setSuccessMessage('非常食を登録しました！');
    } catch (error: any) {
      console.error('Error adding document: ', error);
      setErrorMessage('登録に失敗しました。');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 border rounded mb-4 border-[#333] w-3/4 bottom-0">
      <h2 className="text-xl font-bold mb-4 text-[#333]">非常食の登録</h2>
      {errorMessage && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 ">{errorMessage}</div>}
      {successMessage && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">{successMessage}</div>}
      <div className="mb-4">
        <label htmlFor="name" className="block text-[#333] text-sm font-bold mb-2">品名</label>
        <input
        type="text"
        id="name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline text-[#333]"
        required
      />
      </div>
      <div className="mb-4">
        <label htmlFor="quantity" className="block text-[#333] text-sm font-bold mb-2">数量</label>
        <input
          type="number"
          id="quantity"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-[#333] leading-tight focus:outline-none focus:shadow-outline"
          min="0"
          required
        />
      </div>
      <div className="mb-4">
  <label htmlFor="expiryDate" className="block text-[#333] text-sm font-bold mb-2">賞味期限 (YYYY-MM-DD)</label>
  <input
    type="date"
    id="expiryDate"
    name="expiryDate"
    value={formData.expiryDate}
    onChange={handleChange}
    className="shadow appearance-none border rounded w-full py-2 px-3 text-[#333] leading-tight focus:outline-none focus:shadow-outline"
    required
    min={new Date().toISOString().split('T')[0]}
  />
      </div>
      <div className="mb-4">
        <label htmlFor="category" className="block text-[#333] text-sm font-bold mb-2">カテゴリ</label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-[#333] leading-tight focus:outline-none focus:shadow-outline"
          required
        >
          <option value="">選択してください</option>
          <option value="水">水</option>
          <option value="食料">食料</option>
          <option value="その他">その他</option>
        </select>
      </div>
      <div className="mb-4">
        <label htmlFor="amount" className="block text-[#333] text-sm font-bold mb-2">金額 (円)</label>
        <input
          type="number"
          id="amount"
          name="amount"
          value={formData.amount || ''}
          onChange={handleChange}
          placeholder="任意"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-[#333] leading-tight focus:outline-none focus:shadow-outline"
          min="0"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="purchaseLocation" className="block text-[#333] text-sm font-bold mb-2">買った場所</label>
        <input
          type="text"
          id="purchaseLocation"
          name="purchaseLocation"
          value={formData.purchaseLocation || ''}
          onChange={handleChange}
          placeholder="任意"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-[#333] leading-tight focus:outline-none focus:shadow-outline"
          
        />
      </div>
      <div className="mb-4">
        <label htmlFor="label" className="block text-[#333] text-sm font-bold mb-2">ラベル</label>
        <input
          type="text"
          id="label"
          name="label"
          value={formData.label || ''}
          onChange={handleChange}
          placeholder="任意"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-[#333] leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="storageLocation" className="block text-[#333] text-sm font-bold mb-2">保存場所</label>
        <input
          type="text"
          id="storageLocation"
          name="storageLocation"
          value={formData.storageLocation || ''}
          onChange={handleChange}
          placeholder="任意"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-[#333] leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <button
        type="submit"
        className="bg-[#333333] text-white hover:bg-[#332b1e] font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        登録
      </button>
    </form>
  );
}