'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import SupplyItem from '@/components/supplies/SupplyItem';
import SupplySort, {
  type SortOption,
  type SortOrder,
} from '@/components/supplies/SupplySort';
import { useEventAuth } from '@/hooks/event/useEventAuth';
import type { Supply } from '@/types';
import { sortSupplies } from '@/utils/sortSupplies';

export default function EventSuppliesClient() {
  const router = useRouter();
  const { eventUser: _eventUser } = useEventAuth();
  const [supplies, setSuppliess] = useState<Supply[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState(0);
  const [sortBy, setSortBy] = useState<SortOption>('registeredAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const fetchSupplies = useCallback(
    async (forceRefresh = false) => {
      try {
        const now = Date.now();
        const timeSinceLastFetch = now - lastFetch;

        if (!forceRefresh && lastFetch > 0 && timeSinceLastFetch < 5000) {
          return;
        }

        const response = await fetch(
          '/api/event/supplies?teamId=giikuHaku-2025'
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || '備蓄品データの取得に失敗しました');
        }

        setSuppliess(data.supplies);
        setLastFetch(now);
      } catch (_error: unknown) {
        const errorMessage =
          _error instanceof Error
            ? _error.message
            : '備蓄品データの取得に失敗しました';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [lastFetch]
  );

  useEffect(() => {
    fetchSupplies();
  }, [fetchSupplies]);

  const handleSortChange = (option: SortOption, order: SortOrder) => {
    setSortBy(option);
    setSortOrder(order);
  };

  const sortedSupplys = sortSupplies(supplies, sortBy, sortOrder);

  const handleUpdateSupply = (supplyId: string) => {
    router.push(`/event/supplies/edit/${supplyId}`);
  };

  const handleDeleteSupply = async (supplyId: string) => {
    try {
      const response = await fetch('/api/event/supplies/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          supplyId,
          teamId: 'giikuHaku-2025',
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || '備蓄品の削除に失敗しました');
      }

      setSuppliess(prev => prev.filter(supply => supply.id !== supplyId));

      setTimeout(() => fetchSupplies(true), 1000);
    } catch (_error: unknown) {
      fetchSupplies(true);
    }
  };

  const handleArchiveSupply = async (supplyId: string) => {
    try {
      const response = await fetch('/api/event/supplies/archive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          supplyId,
          teamId: 'giikuHaku-2025',
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || '備蓄品のアーカイブに失敗しました');
      }

      setSuppliess(prev => prev.filter(supply => supply.id !== supplyId));

      setTimeout(() => fetchSupplies(true), 1000);
    } catch (_error: unknown) {
      fetchSupplies(true);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fetchSupplies();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchSupplies]);

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
          onClick={() => fetchSupplies(true)}
        >
          再読み込み
        </button>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {supplies.length > 0 ? (
        <>
          <div className='flex justify-end mb-4'>
            <SupplySort
              currentOrder={sortOrder}
              currentSort={sortBy}
              onSortChange={handleSortChange}
            />
          </div>
          {sortedSupplys.map((supply: Supply) => (
            <SupplyItem
              key={supply.id}
              canDelete={true}
              supply={supply}
              onArchiveSupply={handleArchiveSupply}
              onDeleteSupply={handleDeleteSupply}
              onUpdateSupply={handleUpdateSupply}
            />
          ))}
        </>
      ) : (
        <div className='text-center py-8'>
          <p className='text-gray-600 mb-4'>登録された備蓄品はありません</p>
          <Link
            className='inline-block bg-gray-800 text-white font-semibold py-2 px-4 rounded hover:bg-gray-700'
            href='/event/supplies/add'
          >
            備蓄品を登録
          </Link>
        </div>
      )}
    </div>
  );
}
