// app/supplies/archived/page.tsx
'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Suspense, useState } from 'react';

import SupplyItem from '@/components/supplies/SupplyItem';
import SupplySort, {
  type SortOption,
  type SortOrder,
} from '@/components/supplies/SupplySort';
import { useAuth, useSupplies, useTeam } from '@/hooks';
import type { Supply } from '@/types';
import { ERROR_MESSAGES } from '@/utils/constants';
import { sortSupplies } from '@/utils/sortSupplies';

function ArchivedSupplysPageClient() {
  const router = useRouter();
  const [sortBy, setSortBy] = useState<SortOption>('registeredAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const { user } = useAuth(true);
  const { currentTeamId, team, loading: teamLoading } = useTeam(user);
  const {
    supplies,
    loading: suppliesLoading,
    archiveSupply,
  } = useSupplies(user, currentTeamId, true);

  const canDelete = team
    ? team.ownerId === user?.uid || team.admins?.includes(user?.uid || '')
    : false;

  const handleSortChange = (option: SortOption, order: SortOrder) => {
    setSortBy(option);
    setSortOrder(order);
  };

  const sortedSupplies = sortSupplies(supplies, sortBy, sortOrder);

  const handleUpdateSupply = (supplyIdToUpdate: string) => {
    router.push(`/supplies/edit/${supplyIdToUpdate}`);
  };

  const handleDeleteSupply = async (supplyId: string) => {
    if (!user) return;

    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/actions/delete-supply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ supplyId }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || '備蓄品の削除に失敗しました');
      }

      router.refresh();
    } catch (_error) {}
  };

  if (teamLoading || suppliesLoading) {
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
                  {supplies.length > 0
                    ? `${supplies.length}件の過去の備蓄品`
                    : ''}
                </p>
              </div>
              <div className='flex items-center gap-4'>
                {supplies.length > 0 && (
                  <SupplySort
                    currentOrder={sortOrder}
                    currentSort={sortBy}
                    onSortChange={handleSortChange}
                  />
                )}
                <Link
                  className='inline-block bg-gray-800 text-white font-semibold py-2 px-4 rounded hover:bg-gray-700'
                  href={`/supplies/list?teamId=${currentTeamId}`}
                >
                  現在の備蓄品一覧に戻る
                </Link>
              </div>
            </div>
          </div>

          {supplies.length > 0 ? (
            <div className='space-y-4'>
              {sortedSupplies.map((supply: Supply) => (
                <SupplyItem
                  key={supply.id}
                  canDelete={canDelete}
                  supply={supply}
                  onArchiveSupply={archiveSupply}
                  onDeleteSupply={handleDeleteSupply}
                  onUpdateSupply={handleUpdateSupply}
                />
              ))}
            </div>
          ) : (
            <div className='text-center py-8'>
              <p className='text-gray-600 mb-4'>
                アーカイブされた備蓄品はありません
              </p>
              <Link
                className='inline-block bg-gray-800 text-white font-semibold py-2 px-4 rounded hover:bg-gray-700'
                href={`/supplies/list?teamId=${currentTeamId}`}
              >
                現在の備蓄品一覧に戻る
              </Link>
            </div>
          )}
        </>
      ) : (
        <div className='text-center py-8'>
          <p className='text-gray-600'>
            {ERROR_MESSAGES.FAMILY_GROUP_ID_MISSING}
          </p>
        </div>
      )}
    </div>
  );
}

export default function ArchivedSupplysPage() {
  return (
    <Suspense fallback={<p>{ERROR_MESSAGES.LOADING}</p>}>
      <ArchivedSupplysPageClient />
    </Suspense>
  );
}
