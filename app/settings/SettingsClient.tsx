'use client';
import { useState } from 'react';

import AccountSettings from '@/components/settings/AccountSettings';
import LineAccountLinker from '@/components/settings/LineAccountLinker';
import LogoutSection from '@/components/settings/LogoutSection';
import TeamSettings from '@/components/settings/TeamSettings';
import { useAuth } from '@/hooks';
import { ERROR_MESSAGES, UI_CONSTANTS } from '@/utils/constants';

type SettingsTab = 'line' | 'account' | 'team' | 'logout';

export default function SettingsClient() {
  const { user, loading: authLoading } = useAuth(true);
  const [activeTab, setActiveTab] = useState<SettingsTab>('line');

  if (authLoading) {
    return (
      <div className='text-center mt-10 text-gray-600'>
        {ERROR_MESSAGES.LOADING}
      </div>
    );
  }

  if (!user) {
    return (
      <div className='text-center mt-10 text-gray-600'>
        {ERROR_MESSAGES.UNAUTHORIZED}
      </div>
    );
  }

  const tabs = [
    {
      id: 'line' as SettingsTab,
      label: UI_CONSTANTS.LINE_NOTIFICATION_SETTINGS,
    },
    { id: 'account' as SettingsTab, label: UI_CONSTANTS.ACCOUNT_SETTINGS },
    { id: 'team' as SettingsTab, label: UI_CONSTANTS.TEAM_SETTINGS },
    { id: 'logout' as SettingsTab, label: UI_CONSTANTS.LOGOUT },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'line':
        return <LineAccountLinker currentUser={user} />;
      case 'account':
        return <AccountSettings user={user} />;
      case 'team':
        return <TeamSettings user={user} />;
      case 'logout':
        return <LogoutSection />;
      default:
        return <LineAccountLinker currentUser={user} />;
    }
  };

  return (
    <div className='max-w-4xl mx-auto'>
      <div className='flex flex-wrap gap-2 mb-8'>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-black text-white border-b-2 border-black'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className='bg-white rounded-lg shadow-md border border-gray-300 p-6'>
        {renderTabContent()}
      </div>
    </div>
  );
}
