'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import SupplyForm from '@/components/supplies/SupplyForm';
import { Button, Card } from '@/components/ui';
import { useAuth, useTeam } from '@/hooks';
import { ERROR_MESSAGES, UI_CONSTANTS } from '@/utils/constants';

export default function SupplyAddForm() {
  const router = useRouter();
  const { user } = useAuth();
  const { currentTeamId, loading: teamLoading } = useTeam(user);

  if (teamLoading) {
    return (
      <Card className='max-w-md mx-auto'>
        <div className='text-center py-8'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4' />
          <p className='text-gray-600'>{ERROR_MESSAGES.LOADING}</p>
        </div>
      </Card>
    );
  }

  if (!currentTeamId) {
    return (
      <Card className='max-w-md mx-auto'>
        <div className='text-center py-8'>
          <h2 className='text-xl font-semibold mb-4 text-gray-900'>
            チームへの参加が必要です
          </h2>
          <p className='mb-6 text-gray-600'>
            {UI_CONSTANTS.FAMILY_GROUP_SELECTION_REQUIRED}
          </p>
          <Button asChild>
            <Link href='/teams/select'>チームを選択または作成する</Link>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <SupplyForm
      teamId={currentTeamId}
      uid={user?.uid || null}
      onCancel={() => router.push('/supplies/list')}
    />
  );
}
