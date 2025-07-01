// app/foods/edit/[foodId]/page.tsx
'use client';
import { doc, getDoc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import FoodForm from '@/components/foods/FoodForm';
import { useAuth, useTeam } from '@/hooks';
import type { FoodFormData } from '@/types';
import { ERROR_MESSAGES } from '@/utils/constants';
import { db } from '@/utils/firebase';

type FoodDocumentData = {
  name: string;
  quantity: number;
  expiryDate: string;
  category: string;
  isArchived: boolean;
  registeredAt: { seconds: number; nanoseconds: number };
  teamId: string;
  uid: string;
  amount?: number | null;
  purchaseLocation?: string | null;
  label?: string | null;
  storageLocation?: string | null;
};

type Food = FoodDocumentData & {
  id: string;
};

export default function FoodEditPage() {
  const { foodId } = useParams();
  const { user } = useAuth(true);
  const { currentTeamId, loading: teamLoading } = useTeam(user);
  const [foodData, setFoodData] = useState<Food | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FoodFormData | null>(null);

  useEffect(() => {
    const fetchFood = async () => {
      if (!foodId || typeof foodId !== 'string') {
        setError('無効な食品IDです。');
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, 'foods', foodId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const rawData = docSnap.data();
          const { id, ...dataWithoutId } = rawData;
          const food: Food = {
            id: docSnap.id,
            ...(dataWithoutId as FoodDocumentData),
          };

          setFoodData(food);

          // FoodFormDataの形式に変換
          const formData: FoodFormData = {
            name: food.name,
            quantity: food.quantity,
            expiryDate: food.expiryDate,
            category: food.category,
            amount: food.amount,
            purchaseLocation: food.purchaseLocation,
            label: food.label,
            storageLocation: food.storageLocation,
          };
          setFormData(formData);
        } else {
          setError('指定された食品が見つかりません。');
        }
      } catch (e: any) {
        console.error('Error fetching food for edit:', e);
        setError('食品データの取得に失敗しました。');
      } finally {
        setLoading(false);
      }
    };

    fetchFood();
  }, [foodId]);

  if (teamLoading || loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <p className='text-gray-600'>{ERROR_MESSAGES.LOADING}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='max-w-md mx-auto p-6'>
        <div className='text-center'>
          <h1 className='text-xl font-semibold mb-4 text-gray-900'>エラー</h1>
          <p className='text-red-500 mb-4'>{error}</p>
        </div>
      </div>
    );
  }

  if (!foodData || !formData) {
    return (
      <div className='max-w-md mx-auto p-6'>
        <div className='text-center'>
          <h1 className='text-xl font-semibold mb-4 text-gray-900'>
            データが見つかりません
          </h1>
          <p className='text-gray-600'>
            指定された食品のデータが見つかりませんでした。
          </p>
        </div>
      </div>
    );
  }

  if (!currentTeamId) {
    return (
      <div className='max-w-md mx-auto p-6'>
        <h1 className='text-xl font-semibold mb-4 text-gray-900'>
          チームへの参加が必要です
        </h1>
        <p className='mb-4 text-gray-600'>
          食品を編集するには、いずれかのチームに参加してください。
        </p>
      </div>
    );
  }

  return (
    <div className='max-w-2xl mx-auto p-6'>
      <FoodForm
        mode='edit'
        uid={user?.uid || null}
        teamId={currentTeamId}
        foodId={foodId as string}
        initialData={formData}
      />
    </div>
  );
}
