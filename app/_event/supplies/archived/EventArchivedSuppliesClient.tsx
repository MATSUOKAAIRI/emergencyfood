'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import SupplyItem from '@/components/supplies/SupplyItem';
import SupplySort, {
  type SortOption,
  type SortOrder,
} from '@/components/supplies/SupplySort';
import { useEventAuth } from '@/hooks/event/useEventAuth';
import type { Supply } from '@/types';
import { sortSupplies } from '@/utils/sortSupplies';

export default function EventArchivedSuppliesClient() {
  const _router = useRouter();
  const { eventUser: _eventUser } = useEventAuth();
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('registeredAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  useEffect(() => {
    const fetchArchivedSupplys = async () => {
      try {
        const response = await fetch(
          '/api/event/supplies/archived?teamId=giikuHaku-2025'
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || 'アーカイブ備蓄品データの取得に失敗しました'
          );
        }

        setSupplies(data.supplies);
      } catch (_error: unknown) {
        const errorMessage =
          _error instanceof Error
            ? _error.message
            : 'アーカイブ備蓄品データの取得に失敗しました';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchArchivedSupplys();
  }, []);

  const handleSortChange = (option: SortOption, order: SortOrder) => {
    setSortBy(option);
    setSortOrder(order);
  };

  const sortedSupplies = sortSupplies(supplies, sortBy, sortOrder);

  const handleRestoreSupply = async (supplyId: string) => {
    try {
      const response = await fetch('/api/event/supplies/restore', {
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
        throw new Error(result.error || '備蓄品の復元に失敗しました');
      }

      setSupplies(prev => prev.filter(supply => supply.id !== supplyId));
    } catch (_error: unknown) {}
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

      setSupplies(prev => prev.filter(supply => supply.id !== supplyId));
    } catch (_error: unknown) {}
  };

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
          onClick={() => window.location.reload()}
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
          {sortedSupplies.map((supply: Supply) => (
            <SupplyItem
              key={supply.id}
              canDelete={true}
              supply={supply}
              onArchiveSupply={() => {}}
              onDeleteSupply={handleDeleteSupply}
              onRestoreSupply={handleRestoreSupply}
              onUpdateSupply={() => {}}
            />
          ))}
        </>
      ) : (
        <div className='text-center py-8'>
          <p className='text-gray-600 mb-4'>
            アーカイブされた備蓄品はありません
          </p>
          <Link
            className='inline-block bg-gray-800 text-white font-semibold py-2 px-4 rounded hover:bg-gray-700'
            href='/event/supplies'
          >
            備蓄品一覧に戻る
          </Link>
        </div>
      )}
    </div>
  );
}
