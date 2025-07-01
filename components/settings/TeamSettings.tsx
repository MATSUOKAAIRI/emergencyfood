'use client';
import { useState } from 'react';

import { useTeam } from '@/hooks';
import type { AppUser } from '@/types';
import {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  UI_CONSTANTS,
} from '@/utils/constants';

interface TeamSettingsProps {
  user: AppUser;
}

export default function TeamSettings({ user }: TeamSettingsProps) {
  const {
    team,
    teamMembers,
    addAdmin,
    removeAdmin,
    loading,
    error,
    migrateTeamData,
  } = useTeam(user);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [_showDebug, _setShowDebug] = useState(false);
  const [_migrating, setMigrating] = useState(false);

  if (loading) {
    return <div className='text-center py-8'>{ERROR_MESSAGES.LOADING}</div>;
  }

  if (error) {
    return <div className='text-center py-8 text-red-500'>{error}</div>;
  }

  if (!team) {
    return (
      <div className='text-center py-8'>{ERROR_MESSAGES.TEAM_NOT_FOUND}</div>
    );
  }

  const currentUserRole =
    team.ownerId === user.uid
      ? 'owner'
      : team.admins.includes(user.uid)
        ? 'admin'
        : 'member';

  const canManageAdmins =
    currentUserRole === 'owner' || currentUserRole === 'admin';

  const handleAdminToggle = async (memberId: string, isAdmin: boolean) => {
    try {
      if (isAdmin) {
        await removeAdmin(memberId);
        setMessage({ type: 'success', text: SUCCESS_MESSAGES.ADMIN_REMOVED });
      } else {
        await addAdmin(memberId);
        setMessage({ type: 'success', text: SUCCESS_MESSAGES.ADMIN_ADDED });
      }
    } catch (_error) {
      setMessage({ type: 'error', text: ERROR_MESSAGES.ADMIN_UPDATE_FAILED });
    }
  };

  const _handleMigration = async () => {
    setMigrating(true);
    try {
      await migrateTeamData();
      setMessage({
        type: 'success',
        text: 'チームデータを最新の形式に移行しました',
      });
    } catch (_error) {
      setMessage({ type: 'error', text: 'チームデータの移行に失敗しました' });
    } finally {
      setMigrating(false);
    }
  };

  const getRoleLabel = (memberId: string) => {
    if (team.ownerId === memberId) return 'オーナー';
    if (team.admins.includes(memberId)) return '管理者';
    return 'メンバー';
  };

  const getRoleColor = (memberId: string) => {
    if (team.ownerId === memberId) return 'text-black';
    if (team.admins.includes(memberId)) return 'text-black';
    return 'text-black';
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-xl font-semibold text-gray-900'>
          {UI_CONSTANTS.TEAM_SETTINGS}
        </h2>
      </div>

      {message && (
        <div
          className={`p-3 rounded-md ${
            message.type === 'success'
              ? 'bg-green-200 text-black '
              : 'bg-red-200 text-black '
          }`}
        >
          {message.text}
        </div>
      )}

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div className='space-y-2'>
          <label className='block text-sm font-medium text-gray-900'>
            {UI_CONSTANTS.TEAM_NAME}
          </label>
          <div className='p-3 bg-gray-100 rounded-md border border-gray-300'>
            <span className='text-gray-900'>{team.name}</span>
          </div>
        </div>

        <div className='space-y-2'>
          <label className='block text-sm font-medium text-gray-900'>
            {UI_CONSTANTS.TEAM_OWNER}
          </label>
          <div className='p-3 bg-gray-100 rounded-md border border-gray-300'>
            <span className='text-gray-900'>
              {(() => {
                const ownerMember = teamMembers.find(
                  m => m.uid === team.ownerId
                );
                if (ownerMember) {
                  return ownerMember.displayName || ownerMember.email;
                }
                return '不明';
              })()}
            </span>
          </div>
        </div>
      </div>

      <div className='space-y-4'>
        <h3 className='text-lg font-medium text-gray-900'>
          {UI_CONSTANTS.TEAM_MEMBERS}
        </h3>

        <div className='space-y-3'>
          {teamMembers.map(member => (
            <div
              key={member.uid}
              className='flex items-center justify-between p-4 bg-white border border-gray-300 rounded-lg shadow-sm'
            >
              <div className='flex items-center space-x-3'>
                <div className='flex-1'>
                  <div className='font-medium text-gray-900'>
                    {member.displayName || member.email}
                  </div>
                  <div className='text-sm text-gray-600'>{member.email}</div>
                </div>
              </div>

              <div className='flex items-center space-x-3'>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(member.uid)}`}
                >
                  {getRoleLabel(member.uid)}
                </span>

                {canManageAdmins &&
                  member.uid !== team.ownerId &&
                  member.uid !== user.uid && (
                    <button
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                        team.admins.includes(member.uid)
                          ? 'bg-red-100 text-red-800 hover:bg-red-200'
                          : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      }`}
                      onClick={() =>
                        handleAdminToggle(
                          member.uid,
                          team.admins.includes(member.uid)
                        )
                      }
                    >
                      {team.admins.includes(member.uid)
                        ? UI_CONSTANTS.REMOVE_ADMIN
                        : UI_CONSTANTS.ADD_ADMIN}
                    </button>
                  )}

                {canManageAdmins &&
                  member.uid === user.uid &&
                  currentUserRole === 'admin' && (
                    <button
                      className='px-3 py-1 text-xs font-medium rounded-md bg-red-100 text-black hover:bg-red-200 transition-colors'
                      onClick={() => handleAdminToggle(member.uid, true)}
                    >
                      {UI_CONSTANTS.REMOVE_ADMIN}
                    </button>
                  )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className='mt-6 p-4'>
        <h4 className='text-sm font-medium text-gray-900 mb-2 border-b'>
          役職について
        </h4>
        <div className='space-y-1 text-sm text-gray-700'>
          <div className='flex items-center space-x-2'>
            <span className='px-2 py-1 text-xs font-medium text-black'>
              オーナー :
            </span>
            <span>チーム作成者。常に管理者権限を持ちます。</span>
          </div>
          <div className='flex items-center space-x-2'>
            <span className='px-2 py-1 text-xs font-medium text-black'>
              管理者 :
            </span>
            <span>非常食の完全削除と管理者の追加・削除ができます。</span>
          </div>
          <div className='flex items-center space-x-2'>
            <span className='px-2 py-1 text-xs font-medium text-black'>
              メンバー :
            </span>
            <span>通常の非常食管理ができます。</span>
          </div>
        </div>
      </div>
    </div>
  );
}
