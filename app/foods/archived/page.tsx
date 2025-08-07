// app/foods/archived/page.tsx
'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Suspense, useState } from 'react';

import FoodItem from '@/components/foods/FoodItem';
import FoodSort, {
  type SortOption,
  type SortOrder,
} from '@/components/foods/FoodSort';
import { useAuth, useFoods, useTeam } from '@/hooks';
import type { Food } from '@/types';
import { ERROR_MESSAGES } from '@/utils/constants';
import { sortFoods } from '@/utils/sortFoods';

function ArchivedFoodsPageClient() {
  const router = useRouter();
  const [sortBy, setSortBy] = useState<SortOption>('registeredAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const { user } = useAuth(true);
  const { currentTeamId, team, loading: teamLoading } = useTeam(user);
  const {
    foods,
    loading: foodsLoading,
    archiveFood,
  } = useFoods(user, currentTeamId, true);

  const canDelete = team
    ? team.ownerId === user?.uid || team.admins?.includes(user?.uid || '')
    : false;

  const handleSortChange = (option: SortOption, order: SortOrder) => {
    setSortBy(option);
    setSortOrder(order);
  };

  const sortedFoods = sortFoods(foods, sortBy, sortOrder);

  const handleUpdateFood = (foodIdToUpdate: string) => {
    router.push(`/foods/edit/${foodIdToUpdate}`);
  };

  const handleDeleteFood = async (foodId: string) => {
    if (!user) return;

    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/actions/delete-food', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ foodId }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || '食品の削除に失敗しました');
      }

      router.refresh();
    } catch (_error) {}
  };

  if (teamLoading || foodsLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <p className='text-gray-600'>{ERROR_MESSAGES.LOADING}</p>
      </div>
    );
  }

  return (
    <div className='min-h-screen mx-auto px-4 py-6 container'>
      <h1 className='text-3xl font-bold text-[#333] border-b border-gray-300 pb-4 mb-6'>
        過去の保存食リスト
      </h1>
      {currentTeamId ? (
        <>
          <div className='mb-6'>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
              <div>
                <p className='text-gray-600'>
                  {foods.length > 0 ? `${foods.length}件の過去の非常食` : ''}
                </p>
              </div>
              <div className='flex items-center gap-4'>
                {foods.length > 0 && (
                  <FoodSort
                    currentOrder={sortOrder}
                    currentSort={sortBy}
                    onSortChange={handleSortChange}
                  />
                )}
                <Link
                  className='inline-block bg-gray-800 text-white font-semibold py-2 px-4 rounded hover:bg-gray-700'
                  href={`/foods/list?teamId=${currentTeamId}`}
                >
                  現在の非常食一覧に戻る
                </Link>
              </div>
            </div>
          </div>

          {foods.length > 0 ? (
            <div className='space-y-4'>
              {sortedFoods.map((food: Food) => (
                <FoodItem
                  key={food.id}
                  canDelete={canDelete}
                  food={food}
                  onArchiveFood={archiveFood}
                  onDeleteFood={handleDeleteFood}
                  onUpdateFood={handleUpdateFood}
                />
              ))}
            </div>
          ) : (
            <div className='text-center py-8'>
              <p className='text-gray-600 mb-4'>
                アーカイブされた非常食はありません
              </p>
              <Link
                className='inline-block bg-gray-800 text-white font-semibold py-2 px-4 rounded hover:bg-gray-700'
                href={`/foods/list?teamId=${currentTeamId}`}
              >
                現在の非常食一覧に戻る
              </Link>
            </div>
          )}
        </>
      ) : (
        <div className='text-center py-8'>
          <p className='text-gray-600'>{ERROR_MESSAGES.TEAM_ID_MISSING}</p>
        </div>
      )}
    </div>
  );
}

export default function ArchivedFoodsPage() {
  return (
    <Suspense fallback={<p>{ERROR_MESSAGES.LOADING}</p>}>
      <ArchivedFoodsPageClient />
    </Suspense>
  );
}
