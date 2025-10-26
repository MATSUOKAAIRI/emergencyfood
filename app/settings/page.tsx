import { getServerUser } from '@/utils/auth/server';
import { redirect } from 'next/navigation';
import SettingsClient from './SettingsClient';

export default async function SettingsPage() {
  const user = await getServerUser();

  if (!user) {
    redirect('/auth/login');
  }

  return (
    <div className='container mx-auto py-8 min-h-screen'>
      <h1 className='text-3xl font-bold mb-6 text-black border-b border-gray-300 pb-4'>
        設定
      </h1>
      <SettingsClient user={user} />
    </div>
  );
}
