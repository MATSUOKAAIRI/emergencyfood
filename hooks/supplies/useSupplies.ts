import type { AppUser, Supply } from '@/types';
import { ERROR_MESSAGES, UI_CONSTANTS } from '@/utils/constants';
import { db } from '@/utils/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface UseSuppliesReturn {
  supplies: Supply[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  archiveSupply: (supplyId: string) => Promise<void>;
  updateSupply: (supplyId: string) => void;
}

export const useSupplies = (
  user: AppUser | null,
  teamId: string | null,
  isArchived: boolean = false
): UseSuppliesReturn => {
  const router = useRouter();
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSupplies = async () => {
    if (!user?.uid || !teamId) {
      setSupplies([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const q = query(
        collection(db, 'supplies'),
        where('teamId', '==', teamId),
        where('isArchived', '==', isArchived)
      );

      const querySnapshot = await getDocs(q);
      const supplyList: Supply[] = [];
      querySnapshot.forEach(doc => {
        supplyList.push({ id: doc.id, ...doc.data() } as Supply);
      });
      setSupplies(supplyList);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(ERROR_MESSAGES.FOOD_FETCH_FAILED);
      } else {
        setError(ERROR_MESSAGES.UNKNOWN_ERROR);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupplies();
  }, [user, teamId, isArchived]);

  const archiveSupply = async (supplyIdToArchive: string) => {
    if (!window.confirm(UI_CONSTANTS.CONFIRM_ARCHIVE)) {
      return;
    }

    if (!user?.uid || !teamId) {
      setError(ERROR_MESSAGES.UNAUTHORIZED);
      return;
    }

    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/actions/archive-supply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ supplyId: supplyIdToArchive }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || '備蓄品のアーカイブに失敗しました');
      }

      setSupplies(prevSupplies =>
        prevSupplies.filter(supply => supply.id !== supplyIdToArchive)
      );

      router.push('/supplies/archived');
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(
          `${ERROR_MESSAGES.FOOD_ARCHIVE_FAILED}: ${e.message || ERROR_MESSAGES.UNKNOWN_ERROR}`
        );
      } else {
        setError(ERROR_MESSAGES.UNKNOWN_ERROR);
      }
    }
  };

  const updateSupply = (supplyIdToUpdate: string) => {};

  return {
    supplies,
    loading,
    error,
    refetch: fetchSupplies,
    archiveSupply,
    updateSupply,
  };
};
