// app/supplies/edit/[supplyId]/page.tsx
'use client';
import { doc, getDoc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import SupplyFormComponent from '@/components/supplies/SupplyForm';
import { useAuth, useTeam } from '@/hooks';
import type { Supply, SupplyFormData } from '@/types';
import { ERROR_MESSAGES } from '@/utils/constants';
import { db } from '@/utils/firebase';

export default function SupplyEditPage() {
  const { supplyId } = useParams();
  const { user } = useAuth(true);
  const { currentTeamId, loading: teamLoading } = useTeam(user);
  const [suppliesData, setSuppliesData] = useState<Supply | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<SupplyFormData | null>(null);

  useEffect(() => {
    const fetchSupplies = async () => {
      if (!supplyId || typeof supplyId !== 'string') {
        setError('無効なIDです。');
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, 'supplies', supplyId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const rawData = docSnap.data();
          const { id: _id, ...dataWithoutId } = rawData;
          const supply: Supply = {
            id: docSnap.id,
            ...(dataWithoutId as Omit<Supply, 'id'>),
          };

          setSuppliesData(supply);

          const formData: SupplyFormData = {
            name: supply.name,
            quantity: supply.quantity,
            expiryDate: supply.expiryDate,
            category: supply.category,
            unit: supply.unit,
            evacuationLevel: supply.evacuationLevel,
            amount: supply.amount,
            purchaseLocation: supply.purchaseLocation,
            label: supply.label,
            storageLocation: supply.storageLocation,
          };
          setFormData(formData);
        } else {
          setError('指定された備蓄品が見つかりません。');
        }
      } catch (_e: unknown) {
        setError('備蓄品データの取得に失敗しました。');
      } finally {
        setLoading(false);
      }
    };

    fetchSupplies();
  }, [supplyId]);

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

  if (!suppliesData || !formData) {
    return (
      <div className='max-w-md mx-auto p-6'>
        <div className='text-center'>
          <h1 className='text-xl font-semibold mb-4 text-gray-900'>
            データが見つかりません
          </h1>
          <p className='text-gray-600'>
            指定された備蓄品のデータが見つかりませんでした。
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
          備蓄品を編集するには、いずれかのチームに参加してください。
        </p>
      </div>
    );
  }

  return (
    <div className='max-w-2xl mx-auto p-6'>
      <SupplyFormComponent
        initialData={formData}
        mode='edit'
        supplyId={supplyId as string}
        teamId={currentTeamId}
        uid={user?.uid || null}
      />
    </div>
  );
}
