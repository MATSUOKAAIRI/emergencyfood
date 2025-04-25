'use client';
import Link from 'next/link';
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale/ja';



type Food = {
  id: string;
  name: string;
  quantity: number;
  expiryDate: string;
  category: string;
  registeredAt: { seconds: number; nanoseconds: number };
  teamId: string;
  uid: string;
  amount?: number; // 金額
  purchaseLocation?: string; // 買った場所
  label?: string; // ラベル
  storageLocation?: string; // 保存場所
};

type FoodItemProps = {
  food: Food;
};

export default function FoodItem({ food }: FoodItemProps) {
  const expiryDate = new Date(food.expiryDate);
  const daysUntilExpiry = formatDistanceToNow(expiryDate, { locale: ja });
  const isNearExpiry = expiryDate < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30日以内
  const registeredDate = new Date(food.registeredAt.seconds * 1000);
  const formattedRegisteredDate = registeredDate.toLocaleString('ja-JP');

  return (
    <li className={`p-4 border-b border-red-300 ${isNearExpiry ? 'bg-red-300' : ''}`}>
      <h3 className="text-lg font-semibold text-[#333]">{food.name}</h3>
      <p className='text-[#333]'>数量: {food.quantity}</p>
      <p className='text-[#333]'>賞味期限: {food.expiryDate} ({daysUntilExpiry})</p>
      <p className='text-[#333]'>カテゴリ: {food.category}</p>
      <p className='text-[#333]'>登録日時: {formattedRegisteredDate}</p>
      {food.amount !== undefined && <p className='text-[#333]'>金額: {food.amount} 円</p>}
      {food.purchaseLocation && <p className='text-[#333]'>買った場所: {food.purchaseLocation}</p>}
      {food.label && <p className='text-[#333]'>ラベル: {food.label}</p>}
      {food.storageLocation && <p className='text-[#333]'>保存場所: {food.storageLocation}</p>}
      {isNearExpiry && <p className="text-red-500">賞味期限が近づいています！</p>}
      <div>
        <Link href={`/foods/${food.id}/reviews`} className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2">
          感想を見る・書く
        </Link>
      </div>
    </li>
  );
}