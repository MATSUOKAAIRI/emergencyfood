'use client';
import {
  Button,
  Card,
  ErrorMessage,
  SuccessMessage,
  TabItem,
  Tabs,
} from '@/components/ui';
import { useAuth, useTeam } from '@/hooks';
import type { DisasterBoardData } from '@/types/forms';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { BasicInfoTab } from './_components/BasicInfoTab';
import { CommunicationTab } from './_components/CommunicationTab';
import { EvacuationTab } from './_components/EvacuationTab';

const initialData: DisasterBoardData = {
  evacuationSites: [],
  evacuationRoutes: [],
  safetyMethods: [],
  emergencyItems: [],
  familyAgreements: [],
  useDisasterDial: true,
};

export default function DisasterBoardClient() {
  const { user } = useAuth();
  const { currentTeamId, loading: teamLoading } = useTeam(user);
  const [data, setData] = useState<DisasterBoardData>(initialData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // データの読み込み
  useEffect(() => {
    if (!user || !currentTeamId) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/disaster-board?teamId=${currentTeamId}`,
          {
            headers: {
              Authorization: `Bearer ${await user.getIdToken()}`,
            },
          }
        );

        if (response.ok) {
          const result = await response.json();
          if (result.data) {
            setData(result.data);
          }
        }
      } catch (err) {
        console.error('Failed to load disaster board data:', err);
        setError('データの読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, currentTeamId]);

  // データの保存
  const handleSave = async () => {
    if (!user || !currentTeamId) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await fetch('/api/disaster-board', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await user.getIdToken()}`,
        },
        body: JSON.stringify({
          ...data,
          teamId: currentTeamId,
          lastUpdated: new Date(),
        }),
      });

      if (!response.ok) {
        throw new Error('保存に失敗しました');
      }

      setSuccess('災害用伝言板の情報を保存しました');

      // 成功メッセージを3秒後に消す
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  if (teamLoading || loading) {
    return (
      <Card className='max-w-md mx-auto'>
        <div className='text-center py-8'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4' />
          <p className='text-gray-600'>読み込み中...</p>
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
            災害用伝言板を使用するにはチームに参加する必要があります。
          </p>
          <Button asChild>
            <Link href='/teams/select'>チームを選択または作成する</Link>
          </Button>
        </div>
      </Card>
    );
  }

  // タブの登録件数を計算
  const evacuationCount =
    data.evacuationSites.length +
    data.evacuationRoutes.length +
    data.emergencyItems.length;
  const communicationCount =
    data.safetyMethods.length + data.familyAgreements.length;
  const basicInfoCount = data.useDisasterDial ? 1 : 0;

  // タブアイテムの定義
  const tabItems: TabItem[] = [
    {
      id: 'evacuation',
      label: '避難関連',
      badge: evacuationCount > 0 ? evacuationCount : undefined,
      content: (
        <EvacuationTab
          sites={data.evacuationSites}
          routes={data.evacuationRoutes}
          items={data.emergencyItems}
          onSitesUpdate={sites =>
            setData(prev => ({ ...prev, evacuationSites: sites }))
          }
          onRoutesUpdate={routes =>
            setData(prev => ({ ...prev, evacuationRoutes: routes }))
          }
          onItemsUpdate={items =>
            setData(prev => ({ ...prev, emergencyItems: items }))
          }
        />
      ),
    },
    {
      id: 'communication',
      label: '連絡・約束',
      badge: communicationCount > 0 ? communicationCount : undefined,
      content: (
        <CommunicationTab
          methods={data.safetyMethods}
          agreements={data.familyAgreements}
          onMethodsUpdate={methods =>
            setData(prev => ({ ...prev, safetyMethods: methods }))
          }
          onAgreementsUpdate={agreements =>
            setData(prev => ({ ...prev, familyAgreements: agreements }))
          }
        />
      ),
    },
    {
      id: 'basic-info',
      label: '基本情報',
      badge: basicInfoCount > 0 ? '設定済み' : '未設定',
      content: (
        <BasicInfoTab
          useDisasterDial={data.useDisasterDial}
          onToggleUse={use =>
            setData(prev => ({ ...prev, useDisasterDial: use }))
          }
        />
      ),
    },
  ];

  return (
    <div className='max-w-4xl mx-auto space-y-6'>
      {/* エラー・成功メッセージ */}
      {error && <ErrorMessage message={error} />}
      {success && <SuccessMessage message={success} />}

      {/* 保存ボタン */}
      <div className='flex justify-end'>
        <Button onClick={handleSave} loading={saving} disabled={saving}>
          {saving ? '保存中...' : '変更を保存'}
        </Button>
      </div>

      {/* タブコンテンツ */}
      <Tabs items={tabItems} defaultTab='evacuation' />

      {/* 最終更新日時 */}
      {data.lastUpdated && (
        <Card>
          <div className='text-center text-sm text-gray-500'>
            最終更新:{' '}
            {(() => {
              try {
                const date =
                  typeof data.lastUpdated === 'string'
                    ? new Date(data.lastUpdated)
                    : data.lastUpdated;
                return date instanceof Date && !isNaN(date.getTime())
                  ? date.toLocaleString('ja-JP')
                  : '不明';
              } catch {
                return '不明';
              }
            })()}
            {data.lastUpdatedBy && (
              <span className='ml-2'>| 更新者: {data.lastUpdatedBy}</span>
            )}
          </div>
        </Card>
      )}

      {/* 下部の保存ボタン */}
      <div className='flex justify-center pb-8'>
        <Button
          onClick={handleSave}
          loading={saving}
          disabled={saving}
          size='lg'
        >
          {saving ? '保存中...' : '変更を保存'}
        </Button>
      </div>
    </div>
  );
}
