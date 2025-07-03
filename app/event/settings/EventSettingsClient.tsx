'use client';
import { useState } from 'react';

import { UI_CONSTANTS } from '@/utils/constants';

type SettingsTab = 'line' | 'account' | 'team' | 'logout';

export default function EventSettingsClient() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('line');

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
        return <EventLineAccountLinker />;
      case 'account':
        return <EventAccountSettings />;
      case 'team':
        return <EventTeamSettings />;
      case 'logout':
        return <EventLogoutSection />;
      default:
        return <EventLineAccountLinker />;
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

function EventLineAccountLinker() {
  return (
    <div className='space-y-6'>
      <h2 className='text-xl font-semibold text-gray-900 mb-4'>LINE通知設定</h2>

      <div className='p-6 bg-gray-100 border border-gray-300 rounded-lg'>
        <div className='flex items-start space-x-3'>
          <div className='flex-shrink-0'>
            <svg
              className='h-6 w-6 text-gray-600'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
              />
            </svg>
          </div>
          <div className='flex-1'>
            <h3 className='text-sm font-medium text-gray-900'>
              LINEアカウントの連携
            </h3>
            <div className='mt-2 text-sm text-gray-700'>
              <p>
                LINEアカウントを連携すると、SonaBaseからの通知をLINEで受け取ることができます。
              </p>
              <p className='mt-1'>
                連携するには、LINEアプリでSonaBaseの公式アカウントを友達追加し、認証コードを取得してください。
              </p>
            </div>
          </div>
        </div>
      </div>

      <form className='space-y-4'>
        <div>
          <label
            className='block text-sm font-medium text-gray-900 mb-2'
            htmlFor='lineAuthCode'
          >
            LINE認証コード
          </label>
          <input
            disabled
            className='w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black'
            id='lineAuthCode'
            placeholder='認証コードを入力してください'
            type='text'
          />
        </div>

        <button
          disabled
          className='px-4 py-2 bg-gray-400 text-white rounded-md cursor-not-allowed'
          type='button'
        >
          連携する（イベントモードでは無効）
        </button>
      </form>
    </div>
  );
}

function EventAccountSettings() {
  return (
    <div className='space-y-6'>
      <h2 className='text-xl font-semibold text-gray-900 mb-4'>
        {UI_CONSTANTS.ACCOUNT_SETTINGS}
      </h2>

      <div className='space-y-2'>
        <label className='block text-sm font-medium text-gray-900'>
          {UI_CONSTANTS.ACCOUNT_NAME}
        </label>
        <div className='flex items-center justify-between p-3 bg-gray-100 rounded-md border border-gray-300'>
          <span className='text-gray-900'>イベント参加者</span>
          <button
            disabled
            className='text-gray-400 cursor-not-allowed text-sm font-medium'
          >
            {UI_CONSTANTS.EDIT}
          </button>
        </div>
      </div>

      <div className='space-y-2'>
        <label className='block text-sm font-medium text-gray-900'>
          {UI_CONSTANTS.EMAIL_ADDRESS}
        </label>
        <div className='p-3 bg-gray-100 rounded-md border border-gray-300'>
          <span className='text-gray-900'>event@example.com</span>
        </div>
      </div>

      <div className='space-y-2'>
        <label className='block text-sm font-medium text-gray-900'>
          {UI_CONSTANTS.CHANGE_PASSWORD}
        </label>
        <button
          disabled
          className='px-4 py-2 bg-gray-400 text-white rounded-md cursor-not-allowed'
        >
          {UI_CONSTANTS.CHANGE_PASSWORD}（イベントモードでは無効）
        </button>
      </div>
    </div>
  );
}

function EventTeamSettings() {
  return (
    <div className='space-y-4 sm:space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-lg sm:text-xl font-semibold text-gray-900'>
          {UI_CONSTANTS.TEAM_SETTINGS}
        </h2>
      </div>

      <div className='grid grid-cols-1 gap-4 sm:gap-6'>
        <div className='space-y-2'>
          <label className='block text-sm font-medium text-gray-900'>
            {UI_CONSTANTS.TEAM_NAME}
          </label>
          <div className='p-3 bg-gray-100 rounded-md border border-gray-300'>
            <span className='text-gray-900 text-sm sm:text-base'>
              ぎいくはく2025
            </span>
          </div>
        </div>

        <div className='space-y-2'>
          <label className='block text-sm font-medium text-gray-900'>
            {UI_CONSTANTS.TEAM_OWNER}
          </label>
          <div className='p-3 bg-gray-100 rounded-md border border-gray-300'>
            <span className='text-gray-900 text-sm sm:text-base'>
              イベント管理者
            </span>
          </div>
        </div>
      </div>

      <div className='space-y-3 sm:space-y-4'>
        <h3 className='text-base sm:text-lg font-medium text-gray-900'>
          {UI_CONSTANTS.TEAM_MEMBERS}
        </h3>

        <div className='space-y-3'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-white border border-gray-300 rounded-lg shadow-sm space-y-2 sm:space-y-0'>
            <div className='flex items-center space-x-3'>
              <div className='flex-1 min-w-0'>
                <div className='font-medium text-gray-900 text-sm sm:text-base truncate'>
                  イベント参加者
                </div>
                <div className='text-xs sm:text-sm text-gray-600 truncate'>
                  event@example.com
                </div>
              </div>
            </div>

            <div className='flex items-center space-x-2 sm:space-x-3 flex-wrap'>
              <span className='px-2 py-1 text-xs font-medium rounded-full text-black'>
                メンバー
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className='mt-4 sm:mt-6 p-3 sm:p-4'>
        <h4 className='text-sm font-medium text-gray-900 mb-2 border-b'>
          役職について
        </h4>
        <div className='space-y-1 text-xs sm:text-sm text-gray-700'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-1 sm:space-y-0'>
            <span className='px-2 py-1 text-xs font-medium text-black w-fit'>
              オーナー :
            </span>
            <span>チーム作成者。常に管理者権限を持ちます。</span>
          </div>
          <div className='flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-1 sm:space-y-0'>
            <span className='px-2 py-1 text-xs font-medium text-black w-fit'>
              管理者 :
            </span>
            <span>管理者の追加・削除ができます。</span>
          </div>
          <div className='flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-1 sm:space-y-0'>
            <span className='px-2 py-1 text-xs font-medium text-black w-fit'>
              メンバー :
            </span>
            <span>
              非常食の管理（登録・編集・削除・アーカイブ）ができます。
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function EventLogoutSection() {
  return (
    <div className='space-y-6'>
      <h2 className='text-xl font-semibold text-gray-900 mb-4'>
        {UI_CONSTANTS.LOGOUT}
      </h2>
      <div className='flex items-start space-x-3'>
        <div className='flex-1'>
          <div className='mt-2 text-sm text-gray-700'>
            <p>
              ログアウトすると、現在のセッションが終了し、ログイン画面に戻ります。
            </p>
            <p className='mt-1'>
              再度ログインする際は、メールアドレスとパスワードが必要です。
            </p>
          </div>
        </div>
      </div>

      <button
        disabled
        className='px-6 py-3 bg-gray-400 text-white rounded-md cursor-not-allowed font-medium'
      >
        {UI_CONSTANTS.LOGOUT}（イベントモードでは無効）
      </button>
    </div>
  );
}
