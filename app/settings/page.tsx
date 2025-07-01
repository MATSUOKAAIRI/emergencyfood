// app/settings/page.tsx
import { ERROR_MESSAGES, UI_CONSTANTS } from '@/utils/constants';
import { Suspense } from 'react';
import SettingsClient from './SettingsClient';

export default function SettingsPage() {
  return (
    <div className='container mx-auto py-8 min-h-screen'>
      <h1 className='text-2xl font-bold mb-6 text-black border-b border-gray-300 pb-4'>
        {UI_CONSTANTS.SETTINGS_TITLE}
      </h1>
      <Suspense fallback={<p>{ERROR_MESSAGES.LOADING}</p>}>
        <SettingsClient />
      </Suspense>
    </div>
  );
}
