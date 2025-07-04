'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import FoodItem from '@/components/foods/FoodItem';
import { useEventAuth } from '@/hooks/event/useEventAuth';
import type { Food } from '@/types';

export default function EventFoodsClient() {
  const router = useRouter();
  const { eventUser: _eventUser } = useEventAuth();
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState(0);

  const fetchFoods = useCallback(
    async (forceRefresh = false) => {
      try {
        const now = Date.now();
        const timeSinceLastFetch = now - lastFetch;

        if (!forceRefresh && lastFetch > 0 && timeSinceLastFetch < 5000) {
          return;
        }

        const response = await fetch('/api/event/foods?teamId=giikuHaku-2025');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || '食品データの取得に失敗しました');
        }

        setFoods(data.foods);
        setLastFetch(now);
      } catch (_error: unknown) {
        const errorMessage =
          _error instanceof Error
            ? _error.message
            : '食品データの取得に失敗しました';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [lastFetch]
  );

  useEffect(() => {
    fetchFoods();
  }, [fetchFoods]);

  const handleUpdateFood = (foodId: string) => {
    router.push(`/event/foods/edit/${foodId}`);
  };

  const handleDeleteFood = async (foodId: string) => {
    try {
      const response = await fetch('/api/event/foods/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          foodId,
          teamId: 'giikuHaku-2025',
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || '食品の削除に失敗しました');
      }

      setFoods(prev => prev.filter(food => food.id !== foodId));

      setTimeout(() => fetchFoods(true), 1000);
    } catch (_error: unknown) {
      fetchFoods(true);
    }
  };

  const handleArchiveFood = async (foodId: string) => {
    try {
      const response = await fetch('/api/event/foods/archive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          foodId,
          teamId: 'giikuHaku-2025',
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || '食品のアーカイブに失敗しました');
      }

      setFoods(prev => prev.filter(food => food.id !== foodId));

      setTimeout(() => fetchFoods(true), 1000);
    } catch (_error: unknown) {
      fetchFoods(true);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fetchFoods();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchFoods]);

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='text-center py-8'>
        <p className='text-red-600 mb-4'>{error}</p>
        <button
          className='bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700'
          onClick={() => fetchFoods(true)}
        >
          再読み込み
        </button>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {foods.length > 0 ? (
        foods.map((food: Food) => (
          <FoodItem
            key={food.id}
            canDelete={true}
            food={food}
            onArchiveFood={handleArchiveFood}
            onDeleteFood={handleDeleteFood}
            onUpdateFood={handleUpdateFood}
          />
        ))
      ) : (
        <div className='text-center py-8'>
          <p className='text-gray-600 mb-4'>登録された非常食はありません</p>
          <Link
            className='inline-block bg-gray-800 text-white font-semibold py-2 px-4 rounded hover:bg-gray-700'
            href='/event/foods/add'
          >
            非常食を登録
          </Link>
        </div>
      )}
    </div>
  );
}
