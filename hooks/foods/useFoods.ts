import type { AppUser, Food, UseFoodsReturn } from '@/types';
import { ERROR_MESSAGES, UI_CONSTANTS } from '@/utils/constants';
import { db } from '@/utils/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export const useFoods = (
  user: AppUser | null,
  teamId: string | null,
  isArchived: boolean = false
): UseFoodsReturn => {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFoods = async () => {
      if (!user?.uid || !teamId) {
        setFoods([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const q = query(
          collection(db, 'foods'),
          where('teamId', '==', teamId),
          where('uid', '==', user.uid),
          where('isArchived', '==', isArchived)
        );

        const querySnapshot = await getDocs(q);
        const foodList: Food[] = [];
        querySnapshot.forEach(doc => {
          foodList.push({ id: doc.id, ...doc.data() } as Food);
        });
        setFoods(foodList);
      } catch (e: any) {
        console.error('Error fetching foods: ', e);
        setError(ERROR_MESSAGES.FOOD_FETCH_FAILED);
      } finally {
        setLoading(false);
      }
    };

    fetchFoods();
  }, [user, teamId, isArchived]);

  const archiveFood = async (foodIdToArchive: string) => {
    if (!window.confirm(UI_CONSTANTS.CONFIRM_ARCHIVE)) {
      return;
    }

    if (!user?.uid || !teamId) {
      setError(ERROR_MESSAGES.UNAUTHORIZED);
      return;
    }

    try {
      setFoods(prevFoods =>
        prevFoods.filter(food => food.id !== foodIdToArchive)
      );
      console.log(`Food item ${foodIdToArchive} archived successfully.`);
    } catch (e: any) {
      console.error('Error archiving food: ', e);
      setError(
        `${ERROR_MESSAGES.FOOD_ARCHIVE_FAILED}: ${e.message || ERROR_MESSAGES.UNKNOWN_ERROR}`
      );
    }
  };

  const updateFood = (foodIdToUpdate: string) => {
    console.log(`Update food with ID: ${foodIdToUpdate}`);
  };

  return {
    foods,
    loading,
    error,
    archiveFood,
    updateFood,
  };
};
