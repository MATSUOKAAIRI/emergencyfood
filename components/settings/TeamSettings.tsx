'use client';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import CreateTeamForm from '@/components/teams/CreateTeamForm';
import { useAuth, useTeam } from '@/hooks';
import type { AppUser, Team } from '@/types';
import {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  UI_CONSTANTS,
} from '@/utils/constants';

interface TeamSettingsProps {
  user: AppUser;
  initialTeam?: Team | null;
}

interface TeamInfo {
  id: string;
  name: string;
  isActive: boolean;
}

export default function TeamSettings({ user, initialTeam }: TeamSettingsProps) {
  const router = useRouter();
  const { user: firebaseUser } = useAuth();
  const {
    teamId: _teamId,
    currentTeamId: _currentTeamId,
    team: clientTeam,
    teamMembers,
    addAdmin,
    removeAdmin,
    loading,
    error,
    migrateTeamData,
  } = useTeam(firebaseUser);

  const [team, setTeam] = useState<Team | null>(initialTeam || null);

  useEffect(() => {
    if (clientTeam && !loading) {
      setTeam(clientTeam);
    }
  }, [clientTeam, loading]);

  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [_showDebug, _setShowDebug] = useState(false);
  const [_migrating, setMigrating] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [generatingInvite, setGeneratingInvite] = useState(false);
  const [_userTeams, setUserTeams] = useState<TeamInfo[]>([]);
  const [showGuide, setShowGuide] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isEditingTeamName, setIsEditingTeamName] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [updatingTeamName, setUpdatingTeamName] = useState(false);

  // 備蓄管理設定
  const [householdSize, setHouseholdSize] = useState(
    team?.stockSettings?.householdSize || 1
  );
  const [stockDays, setStockDays] = useState(
    team?.stockSettings?.stockDays || 7
  );
  const [hasPets, setHasPets] = useState(team?.stockSettings?.hasPets || false);
  const [dogCount, setDogCount] = useState(team?.stockSettings?.dogCount || 0);
  const [catCount, setCatCount] = useState(team?.stockSettings?.catCount || 0);
  const [updatingStockSettings, setUpdatingStockSettings] = useState(false);

  // 詳細設定
  const [useDetailedComposition, setUseDetailedComposition] = useState(
    team?.stockSettings?.useDetailedComposition || false
  );
  const [adultCount, setAdultCount] = useState(
    team?.stockSettings?.composition?.adult || 0
  );
  const [childCount, setChildCount] = useState(
    team?.stockSettings?.composition?.child || 0
  );
  const [infantCount, setInfantCount] = useState(
    team?.stockSettings?.composition?.infant || 0
  );
  const [elderlyCount, setElderlyCount] = useState(
    team?.stockSettings?.composition?.elderly || 0
  );

  // 通知設定
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    team?.stockSettings?.notifications?.enabled !== false
  );
  const [notifyCriticalStock, setNotifyCriticalStock] = useState(
    team?.stockSettings?.notifications?.criticalStock !== false
  );
  const [notifyLowStock, setNotifyLowStock] = useState(
    team?.stockSettings?.notifications?.lowStock !== false
  );
  const [notifyExpiryNear, setNotifyExpiryNear] = useState(
    team?.stockSettings?.notifications?.expiryNear !== false
  );
  const [notifyWeeklyReport, setNotifyWeeklyReport] = useState(
    team?.stockSettings?.notifications?.weeklyReport || false
  );

  // チーム設定が更新されたらstateを同期
  useEffect(() => {
    if (team?.stockSettings) {
      setHouseholdSize(team.stockSettings.householdSize || 1);
      setStockDays(team.stockSettings.stockDays || 7);
      setHasPets(team.stockSettings.hasPets || false);
      setDogCount(team.stockSettings.dogCount || 0);
      setCatCount(team.stockSettings.catCount || 0);

      setUseDetailedComposition(
        team.stockSettings.useDetailedComposition || false
      );
      setAdultCount(team.stockSettings.composition?.adult || 0);
      setChildCount(team.stockSettings.composition?.child || 0);
      setInfantCount(team.stockSettings.composition?.infant || 0);
      setElderlyCount(team.stockSettings.composition?.elderly || 0);

      setNotificationsEnabled(
        team.stockSettings.notifications?.enabled !== false
      );
      setNotifyCriticalStock(
        team.stockSettings.notifications?.criticalStock !== false
      );
      setNotifyLowStock(team.stockSettings.notifications?.lowStock !== false);
      setNotifyExpiryNear(
        team.stockSettings.notifications?.expiryNear !== false
      );
      setNotifyWeeklyReport(
        team.stockSettings.notifications?.weeklyReport || false
      );
    }
  }, [team]);

  // 所属チーム一覧を取得
  const fetchUserTeams = useCallback(async () => {
    if (!firebaseUser) return;

    try {
      const idToken = await firebaseUser.getIdToken();
      const response = await fetch('/api/team/my-teams', {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserTeams(data.teams || []);

        // デフォルトチーム名の場合はガイド表示
        if (
          data.teams?.length === 1 &&
          (data.teams[0].name.includes('の備蓄品') ||
            data.teams[0].name.includes('の家族'))
        ) {
          setShowGuide(true);
        }
      }
    } catch (error) {
      console.error('チーム一覧取得エラー:', error);
    }
  }, [firebaseUser]);

  useEffect(() => {
    fetchUserTeams();
  }, [firebaseUser, fetchUserTeams]);

  if (loading) {
    return <div className='text-center py-8'>{ERROR_MESSAGES.LOADING}</div>;
  }

  if (error) {
    return <div className='text-center py-8 text-red-500'>{error}</div>;
  }

  if (!team) {
    return (
      <div className='text-center py-8'>
        <div className='mb-4'>データを取得できませんでした</div>
        <div className='text-sm text-gray-600' />
      </div>
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

  // チーム名更新
  const handleUpdateTeamName = async () => {
    if (!newTeamName.trim()) {
      setMessage({ type: 'error', text: 'グループ名を入力してください' });
      return;
    }

    if (newTeamName.trim().length > 25) {
      setMessage({
        type: 'error',
        text: 'グループ名は25文字以内にしてください',
      });
      return;
    }

    setUpdatingTeamName(true);
    setMessage(null);

    try {
      const idToken = await firebaseUser?.getIdToken();
      if (!idToken) {
        throw new Error('認証トークンを取得できませんでした');
      }

      const response = await fetch('/api/actions/update-team-name', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          teamId: team.id,
          newTeamName: newTeamName.trim(),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'グループ名を変更しました' });
        setIsEditingTeamName(false);
        // ページをリフレッシュして新しいチーム名を反映
        router.refresh();
      } else {
        throw new Error(result.error || 'グループ名の変更に失敗しました');
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'グループ名の変更に失敗しました',
      });
    } finally {
      setUpdatingTeamName(false);
    }
  };

  // 備蓄管理設定を更新
  const handleUpdateStockSettings = async () => {
    if (!team) return;

    setUpdatingStockSettings(true);
    try {
      const idToken = await firebaseUser?.getIdToken();
      if (!idToken) {
        throw new Error('認証トークンを取得できませんでした');
      }

      const response = await fetch('/api/team/update-stock-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          teamId: team.id,
          stockSettings: {
            householdSize,
            stockDays,
            hasPets,
            dogCount,
            catCount,
            useDetailedComposition,
            composition: useDetailedComposition
              ? {
                  adult: adultCount,
                  child: childCount,
                  infant: infantCount,
                  elderly: elderlyCount,
                }
              : undefined,
            notifications: {
              enabled: notificationsEnabled,
              criticalStock: notifyCriticalStock,
              lowStock: notifyLowStock,
              expiryNear: notifyExpiryNear,
              weeklyReport: notifyWeeklyReport,
            },
          },
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: '備蓄管理設定を保存しました' });
        router.refresh();
      } else {
        throw new Error(result.error || '設定の保存に失敗しました');
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text:
          error instanceof Error ? error.message : '設定の保存に失敗しました',
      });
    } finally {
      setUpdatingStockSettings(false);
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

  const generateInviteLink = async () => {
    if (!team) return;

    setGeneratingInvite(true);
    try {
      const idToken = await firebaseUser?.getIdToken();
      if (!idToken) {
        throw new Error('認証トークンを取得できませんでした');
      }

      const response = await fetch('/api/team/generate-invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          teamId: team.id,
          teamName: team.name,
        }),
      });

      if (!response.ok) {
        throw new Error('招待リンクの生成に失敗しました');
      }

      const result = await response.json();
      const link = `${window.location.origin}/teams/invite?code=${result.inviteCode}`;
      setInviteLink(link);
      setShowInviteDialog(true);
      setMessage({ type: 'success', text: '招待リンクを生成しました' });
    } catch (_error) {
      setMessage({ type: 'error', text: '招待リンクの生成に失敗しました' });
    } finally {
      setGeneratingInvite(false);
    }
  };

  const copyToClipboard = async () => {
    if (!inviteLink) return;

    try {
      await navigator.clipboard.writeText(inviteLink);
      setMessage({ type: 'success', text: 'リンクをコピーしました' });
    } catch (_error) {
      setMessage({ type: 'error', text: 'コピーに失敗しました' });
    }
  };

  return (
    <div className='space-y-4 sm:space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-lg sm:text-xl font-semibold text-gray-900'>
          {UI_CONSTANTS.FAMILY_GROUP_SETTINGS}
        </h2>
      </div>

      {message && (
        <div
          className={`p-3 rounded-md text-sm ${
            message.type === 'success'
              ? 'bg-green-200 text-black '
              : 'bg-red-200 text-black '
          }`}
        >
          {message.text}
        </div>
      )}

      <div className='grid grid-cols-1 gap-4 sm:gap-6'>
        <div className='space-y-2'>
          <label className='block text-sm font-medium text-gray-900'>
            {UI_CONSTANTS.FAMILY_GROUP_NAME}
          </label>
          {isEditingTeamName ? (
            <div className='flex flex-col sm:flex-row gap-2'>
              <input
                className='flex-1 px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-gray-900'
                maxLength={50}
                placeholder='新しいグループ名を入力'
                type='text'
                value={newTeamName}
                onChange={e => setNewTeamName(e.target.value)}
              />
              <div className='flex gap-2'>
                <button
                  className='px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 transition-colors text-sm sm:text-base'
                  disabled={updatingTeamName}
                  onClick={handleUpdateTeamName}
                >
                  {updatingTeamName ? '保存中...' : '保存'}
                </button>
                <button
                  className='px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors text-sm sm:text-base'
                  onClick={() => {
                    setIsEditingTeamName(false);
                    setNewTeamName(team.name);
                  }}
                >
                  キャンセル
                </button>
              </div>
            </div>
          ) : (
            <div className='flex items-center gap-2'>
              <div className='flex-1 p-3 bg-gray-100 rounded-md border border-gray-300'>
                <span className='text-gray-900 text-sm sm:text-base'>
                  {team.name}
                </span>
              </div>
              {canManageAdmins && (
                <button
                  className='px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors text-sm sm:text-base whitespace-nowrap'
                  onClick={() => {
                    setNewTeamName(team.name);
                    setIsEditingTeamName(true);
                  }}
                >
                  編集
                </button>
              )}
            </div>
          )}
        </div>

        <div className='space-y-2'>
          <label className='block text-sm font-medium text-gray-900'>
            {UI_CONSTANTS.FAMILY_GROUP_OWNER}
          </label>
          <div className='p-3 bg-gray-100 rounded-md border border-gray-300'>
            <span className='text-gray-900 text-sm sm:text-base'>
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

      {/*デフォルトチーム名の場合のガイド */}
      {showGuide && (
        <div className='bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6 space-y-4'>
          <div className='flex items-start space-x-3'>
            <div>
              <h3 className='font-bold text-lg text-gray-900 mb-2'>
                グループ名をカスタマイズしましょう
              </h3>
              <p className='text-sm text-gray-700 mb-4'>
                現在のグループ名は自動生成されたものです。好きな名前に変更したり、家族を招待したりできます。
              </p>
            </div>
          </div>

          <div className='space-y-3'>
            <button
              onClick={() => {
                setShowGuide(false);
                // そのまま招待リンク生成
                generateInviteLink();
              }}
              className='w-full bg-orange-400 text-white font-semibold py-3 px-6 rounded-md hover:bg-orange-700 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2'
            >
              このチームで家族を招待する
            </button>

            <button
              onClick={() => {
                setShowGuide(false);
                setShowCreateModal(true);
              }}
              className='w-full bg-white border-2 border-orange-400 text-orange-400 font-semibold py-3 px-6 rounded-md hover:bg-orange-50 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2'
            >
              新しい家族グループを作成する
            </button>

            <button
              onClick={() => setShowGuide(false)}
              className='w-full text-gray-600 text-sm hover:text-gray-900 transition-colors'
            >
              後で設定する
            </button>
          </div>
        </div>
      )}

      {/* 招待ボタン（ガイドを閉じた後、または複数チームの場合に表示） */}
      {!showGuide && (
        <div className='space-y-3'>
          <button
            onClick={generateInviteLink}
            disabled={generatingInvite}
            className='w-full bg-orange-400 text-white font-semibold py-3 px-6 rounded-md hover:bg-orange-700 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {generatingInvite ? '生成中...' : '家族を招待する'}
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className='w-full bg-white border-2 border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-md hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2'
          >
            新しいグループを作成
          </button>
        </div>
      )}

      {/* 招待リンクダイアログ */}
      {showInviteDialog && inviteLink && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-lg p-6 max-w-md w-full space-y-4'>
            <div className='flex items-center justify-between'>
              <h3 className='text-xl font-bold text-gray-900'>招待リンク</h3>
              <button
                onClick={() => setShowInviteDialog(false)}
                className='text-gray-500 hover:text-gray-700'
              >
                ✕
              </button>
            </div>

            <p className='text-sm text-gray-600'>
              このリンクを家族に共有してチームに招待しましょう
            </p>

            <div className='bg-gray-100 p-3 rounded-md border border-gray-300 break-all text-sm'>
              {inviteLink}
            </div>

            <button
              onClick={copyToClipboard}
              className='w-full bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors'
            >
              リンクをコピー
            </button>

            <div className='text-center text-xs text-gray-500'>
              LINEやメールでこのリンクを送信できます
            </div>
          </div>
        </div>
      )}

      <div className='space-y-3 sm:space-y-4'>
        <h3 className='text-base sm:text-lg font-medium text-gray-900'>
          {UI_CONSTANTS.FAMILY_GROUP_MEMBERS}
        </h3>

        <div className='space-y-3'>
          {teamMembers.map(member => (
            <div
              key={member.uid}
              className='flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-white border border-gray-300 rounded-lg shadow-sm space-y-2 sm:space-y-0'
            >
              <div className='flex items-center space-x-3'>
                <div className='flex-1 min-w-0'>
                  <div className='font-medium text-gray-900 text-sm sm:text-base truncate'>
                    {member.displayName || member.email}
                  </div>
                  <div className='text-xs sm:text-sm text-gray-600 truncate'>
                    {member.email}
                  </div>
                </div>
              </div>

              <div className='flex items-center space-x-2 sm:space-x-3 flex-wrap'>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(member.uid)}`}
                >
                  {getRoleLabel(member.uid)}
                </span>

                {canManageAdmins &&
                  member.uid !== team.ownerId &&
                  member.uid !== user.uid && (
                    <button
                      className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-md transition-colors ${
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
                      className='px-2 sm:px-3 py-1 text-xs font-medium rounded-md bg-red-100 text-black hover:bg-red-200 transition-colors'
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

      {/* 備蓄管理設定 */}
      <div className='mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg'>
        <h4 className='text-sm font-medium text-gray-900 mb-3 border-b pb-2'>
          備蓄管理の設定
        </h4>
        <div className='space-y-4'>
          <p className='text-sm text-orange-800'>
            家族構成に応じて、各備蓄品の推奨在庫量を自動計算します
          </p>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              家族の人数 <span className='text-red-500'>*</span>
            </label>
            <div className='flex items-center gap-2'>
              <input
                type='number'
                min='1'
                max='50'
                value={householdSize}
                onChange={e => setHouseholdSize(parseInt(e.target.value) || 1)}
                className='w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
              <span className='text-gray-600'>人</span>
            </div>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              目標備蓄日数 <span className='text-red-500'>*</span>
            </label>
            <select
              value={stockDays}
              onChange={e => setStockDays(parseInt(e.target.value))}
              className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value='3'>3日分</option>
              <option value='7'>7日分（推奨）</option>
              <option value='14'>14日分</option>
              <option value='30'>30日分</option>
            </select>
            <p className='text-xs text-gray-500 mt-1'>
              ※ 政府推奨：最低3日分（1週間分以上が望ましい。広域災害に備えて）
            </p>
          </div>

          <div className='border-t pt-4'>
            <label className='flex items-center gap-2 mb-3'>
              <input
                type='checkbox'
                checked={hasPets}
                onChange={e => setHasPets(e.target.checked)}
                className='rounded'
              />
              <span className='text-sm font-medium text-gray-700'>
                ペットがいる
              </span>
            </label>

            {hasPets && (
              <div className='ml-6 space-y-3'>
                <div>
                  <label className='block text-sm text-gray-600 mb-1'>
                    🐕 犬の数
                  </label>
                  <div className='flex items-center gap-2'>
                    <input
                      type='number'
                      min='0'
                      max='10'
                      value={dogCount}
                      onChange={e => setDogCount(parseInt(e.target.value) || 0)}
                      className='w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                    <span className='text-gray-600'>匹</span>
                  </div>
                </div>

                <div>
                  <label className='block text-sm text-gray-600 mb-1'>
                    🐈 猫の数
                  </label>
                  <div className='flex items-center gap-2'>
                    <input
                      type='number'
                      min='0'
                      max='10'
                      value={catCount}
                      onChange={e => setCatCount(parseInt(e.target.value) || 0)}
                      className='w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                    <span className='text-gray-600'>匹</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 詳細な家族構成設定 */}
          <div className='border-t pt-4'>
            <label className='flex items-center gap-2 mb-3'>
              <input
                type='checkbox'
                checked={useDetailedComposition}
                onChange={e => setUseDetailedComposition(e.target.checked)}
                className='rounded'
              />
              <span className='text-sm font-medium text-gray-700'>
                詳細な家族構成を設定（より正確な計算）
              </span>
            </label>

            {useDetailedComposition && (
              <div className='ml-6 space-y-3 bg-white p-3 rounded border border-gray-200'>
                <p className='text-xs text-gray-600 mb-2'>
                  年齢層ごとに必要な備蓄量が異なります
                </p>

                <div>
                  <label className='block text-sm text-gray-600 mb-1'>
                    👨 大人（18-64歳）
                  </label>
                  <div className='flex items-center gap-2'>
                    <input
                      type='number'
                      min='0'
                      max='20'
                      value={adultCount}
                      onChange={e =>
                        setAdultCount(parseInt(e.target.value) || 0)
                      }
                      className='w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                    <span className='text-gray-600'>人</span>
                  </div>
                </div>

                <div>
                  <label className='block text-sm text-gray-600 mb-1'>
                    👦 子供（6-17歳）
                  </label>
                  <div className='flex items-center gap-2'>
                    <input
                      type='number'
                      min='0'
                      max='10'
                      value={childCount}
                      onChange={e =>
                        setChildCount(parseInt(e.target.value) || 0)
                      }
                      className='w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                    <span className='text-gray-600'>人</span>
                  </div>
                </div>

                <div>
                  <label className='block text-sm text-gray-600 mb-1'>
                    👶 乳幼児（0-5歳）
                  </label>
                  <div className='flex items-center gap-2'>
                    <input
                      type='number'
                      min='0'
                      max='5'
                      value={infantCount}
                      onChange={e =>
                        setInfantCount(parseInt(e.target.value) || 0)
                      }
                      className='w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                    <span className='text-gray-600'>人</span>
                  </div>
                </div>

                <div>
                  <label className='block text-sm text-gray-600 mb-1'>
                    👴 高齢者（65歳以上）
                  </label>
                  <div className='flex items-center gap-2'>
                    <input
                      type='number'
                      min='0'
                      max='10'
                      value={elderlyCount}
                      onChange={e =>
                        setElderlyCount(parseInt(e.target.value) || 0)
                      }
                      className='w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                    <span className='text-gray-600'>人</span>
                  </div>
                </div>

                <p className='text-xs text-blue-600 mt-2'>
                  合計: {adultCount + childCount + infantCount + elderlyCount}人
                </p>
              </div>
            )}
          </div>

          {/* 通知設定 */}
          <div className='border-t pt-4'>
            <label className='flex items-center gap-2 mb-3'>
              <input
                type='checkbox'
                checked={notificationsEnabled}
                onChange={e => setNotificationsEnabled(e.target.checked)}
                className='rounded'
              />
              <span className='text-sm font-medium text-gray-700'>
                通知機能を有効にする
              </span>
            </label>

            {notificationsEnabled && (
              <div className='ml-6 space-y-2'>
                <label className='flex items-center gap-2 text-sm'>
                  <input
                    type='checkbox'
                    checked={notifyCriticalStock}
                    onChange={e => setNotifyCriticalStock(e.target.checked)}
                    className='rounded'
                  />
                  <span className='text-gray-700'>在庫切れ・緊急警告</span>
                </label>

                <label className='flex items-center gap-2 text-sm'>
                  <input
                    type='checkbox'
                    checked={notifyLowStock}
                    onChange={e => setNotifyLowStock(e.target.checked)}
                    className='rounded'
                  />
                  <span className='text-gray-700'>在庫が少ない時の警告</span>
                </label>

                <label className='flex items-center gap-2 text-sm'>
                  <input
                    type='checkbox'
                    checked={notifyExpiryNear}
                    onChange={e => setNotifyExpiryNear(e.target.checked)}
                    className='rounded'
                  />
                  <span className='text-gray-700'>賞味期限接近の通知</span>
                </label>

                <label className='flex items-center gap-2 text-sm'>
                  <input
                    type='checkbox'
                    checked={notifyWeeklyReport}
                    onChange={e => setNotifyWeeklyReport(e.target.checked)}
                    className='rounded'
                  />
                  <span className='text-gray-700'>
                    週次レポート（毎週日曜日）
                  </span>
                </label>

                <p className='text-xs text-gray-500 mt-2'>
                  ※ 通知はブラウザの通知機能を使用します
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleUpdateStockSettings}
            disabled={updatingStockSettings || !canManageAdmins}
            className='w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm'
          >
            {updatingStockSettings ? '保存中...' : '💾 設定を保存'}
          </button>

          {!canManageAdmins && (
            <p className='text-xs text-gray-500'>
              ※ オーナーまたは管理者のみ変更できます
            </p>
          )}
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
            <span>備蓄品の完全削除と管理者の追加・削除ができます。</span>
          </div>
          <div className='flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-1 sm:space-y-0'>
            <span className='px-2 py-1 text-xs font-medium text-black w-fit'>
              メンバー :
            </span>
            <span>通常の備蓄品管理ができます。</span>
          </div>
        </div>
      </div>

      {/* チーム作成モーダル */}
      {showCreateModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-lg p-6 max-w-md w-full relative'>
            <button
              onClick={() => setShowCreateModal(false)}
              className='absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl'
            >
              ✕
            </button>
            <CreateTeamForm
              onClose={async () => {
                setShowCreateModal(false);
                // チーム一覧を再取得
                await fetchUserTeams();
                // ページをリフレッシュ
                router.refresh();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
