'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import FoodItem from '@/components/foods/FoodItem';
import { useAuth, useFoods, useTeam } from '@/hooks';
import type { Food } from '@/types';
import { ERROR_MESSAGES } from '@/utils/constants';

export default function FoodListClient() {
  const router = useRouter();

  const { user } = useAuth(true);
  const { currentTeamId, team, loading: teamLoading } = useTeam(user);
  const {
    foods,
    loading: foodsLoading,
    archiveFood,
  } = useFoods(user, currentTeamId, false);

  const canDelete = team
    ? team.ownerId === user?.uid || team.admins?.includes(user?.uid || '')
    : false;

  const handleUpdateFood = (foodIdToUpdate: string) => {
    router.push(`/foods/edit/${foodIdToUpdate}`);
    console.log(`Navigating to edit page for food ID: ${foodIdToUpdate}`);
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
    } catch (error) {
      console.error('Error deleting food:', error);
      alert('食品の削除に失敗しました');
    }
  };

  if (teamLoading || foodsLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <p className='text-gray-600'>{ERROR_MESSAGES.LOADING}</p>
      </div>
    );
  }

  return (
    <div className='min-h-screen mx-auto px-4 py-6'>
      {currentTeamId ? (
        <>
          <div className='mb-6'>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
              <div>
                <p className='text-gray-600'>
                  {foods.length > 0
                    ? `${foods.length}件の非常食`
                    : '登録された非常食はありません'}
                </p>
              </div>
              <Link
                className='inline-block bg-gray-800 text-white font-semibold py-2 px-4 rounded hover:bg-gray-700'
                href={`/foods/add?teamId=${currentTeamId}`}
              >
                新しい非常食を登録する
              </Link>
            </div>
          </div>

          {foods.length > 0 ? (
            <div className='space-y-4'>
              {foods.map((food: Food) => (
                <FoodItem
                  key={food.id}
                  food={food}
                  onArchiveFood={archiveFood}
                  onUpdateFood={handleUpdateFood}
                  onDeleteFood={handleDeleteFood}
                  canDelete={canDelete}
                />
              ))}
            </div>
          ) : (
            <div className='text-center py-8'>
              <p className='text-gray-600 mb-4'>
                {ERROR_MESSAGES.NO_FOODS_REGISTERED}
              </p>
              <Link
                className='inline-block bg-gray-800 text-white font-semibold py-2 px-4 rounded hover:bg-gray-700'
                href={`/foods/add?teamId=${currentTeamId}`}
              >
                最初の非常食を登録する
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
