'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import SupplyItem from '@/components/supplies/SupplyItem';
import SupplySort, {
  type SortOption,
  type SortOrder,
} from '@/components/supplies/SupplySort';
import { Button, Card } from '@/components/ui';
import { useAuth, useSupplies, useTeam } from '@/hooks';
import type { Supply } from '@/types';
import { sortSupplies } from '@/utils/sortSupplies';

export default function SupplyListView() {
  const router = useRouter();
  const [sortBy, setSortBy] = useState<SortOption>('registeredAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const { user } = useAuth(true);
  const { currentTeamId, team, loading: teamLoading } = useTeam(user);
  const {
    supplies,
    loading: suppliesLoading,
    archiveSupply,
  } = useSupplies(user, currentTeamId, false);

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

      if (response.ok) {
        window.location.reload();
      } else {
        console.error('削除に失敗しました。');
      }
    } catch (error) {
      console.error('Delete error:', error);
      console.error('削除に失敗しました。');
    }
  };

  if (teamLoading || suppliesLoading) {
    return (
      <div className='space-y-4'>
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <div className='animate-pulse'>
              <div className='flex justify-between items-center mb-4'>
                <div className='h-6 bg-gray-200 rounded w-1/4' />
                <div className='h-8 bg-gray-200 rounded w-20' />
              </div>
              <div className='space-y-3'>
                <div className='h-4 bg-gray-200 rounded' />
                <div className='h-4 bg-gray-200 rounded w-3/4' />
                <div className='h-4 bg-gray-200 rounded w-1/2' />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!currentTeamId) {
    return (
      <Card className='text-center py-8'>
        <h2 className='text-xl font-semibold mb-4 text-gray-900'>
          チームへの参加が必要です
        </h2>
        <p className='mb-6 text-gray-600'>
          備蓄品を管理するには、まずチームに参加する必要があります。
        </p>
        <Button asChild>
          <Link href='/teams/select'>チームを選択または作成する</Link>
        </Button>
      </Card>
    );
  }

  if (sortedSupplies.length === 0) {
    return (
      <Card className='text-center py-12'>
        <h2 className='text-xl font-semibold mb-4 text-gray-900'>
          備蓄品が登録されていません
        </h2>
        <p className='mb-6 text-gray-600'>
          最初の備蓄品を登録して、防災準備を始めましょう。
        </p>
        <Button asChild>
          <Link href='/supplies/add'>備蓄品を追加する</Link>
        </Button>
      </Card>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Actions Bar */}
      <div className='flex justify-between items-center'>
        <SupplySort
          currentOrder={sortOrder}
          currentSort={sortBy}
          onSortChange={handleSortChange}
        />
        <Button asChild>
          <Link href='/supplies/add'>備蓄品を追加</Link>
        </Button>
      </div>

      {/* Supply List */}
      <div className='space-y-4'>
        {sortedSupplies.map((supply: Supply) => (
          <SupplyItem
            key={supply.id}
            canDelete={canDelete}
            supply={supply}
            onArchiveSupply={() => archiveSupply(supply.id)}
            onDeleteSupply={() => handleDeleteSupply(supply.id)}
            onUpdateSupply={() => handleUpdateSupply(supply.id)}
          />
        ))}
      </div>

      {/* Archive Link */}
      <div className='text-center pt-6'>
        <Button asChild variant='outline'>
          <Link href='/supplies/archived'>アーカイブされた備蓄品を見る</Link>
        </Button>
      </div>
    </div>
  );
}
