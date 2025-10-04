'use client';

import { Input } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/auth/useAuth';
import { useTeam } from '@/hooks/team/useTeam';
import { useEffect, useState } from 'react';

interface BagInfo {
  bagName: string;
  storageLocation: string;
  notes: string;
}

interface BagInfoSectionProps {
  evacuationLevel: 'primary' | 'secondary';
}

export default function BagInfoSection({
  evacuationLevel,
}: BagInfoSectionProps) {
  const { user } = useAuth();
  const { currentTeamId } = useTeam(user);
  const [bagInfo, setBagInfo] = useState<BagInfo>({
    bagName: '',
    storageLocation: '',
    notes: '',
  });
  const [isEditing, setIsEditing] = useState(false);

  const evacuationLevelMap = {
    primary: '一次避難',
    secondary: '二次避難',
  };

  // ローカルストレージから袋情報を読み込み
  useEffect(() => {
    if (!user || !currentTeamId) return;

    const storageKey = `bagInfo_${currentTeamId}_${evacuationLevel}`;
    const storedBagInfo = localStorage.getItem(storageKey);
    if (storedBagInfo) {
      setBagInfo(JSON.parse(storedBagInfo));
    }
  }, [user, currentTeamId, evacuationLevel]);

  // ローカルストレージに袋情報を保存
  const saveBagInfo = () => {
    if (!currentTeamId) return;

    const storageKey = `bagInfo_${currentTeamId}_${evacuationLevel}`;
    localStorage.setItem(storageKey, JSON.stringify(bagInfo));
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBagInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    // 元の値に戻す
    if (!currentTeamId) return;
    const storageKey = `bagInfo_${currentTeamId}_${evacuationLevel}`;
    const storedBagInfo = localStorage.getItem(storageKey);
    if (storedBagInfo) {
      setBagInfo(JSON.parse(storedBagInfo));
    }
    setIsEditing(false);
  };

  if (!user || !currentTeamId) {
    return null;
  }

  const hasInfo = bagInfo.bagName || bagInfo.storageLocation || bagInfo.notes;

  return (
    <div className='bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6'>
      <h3 className='text-lg font-semibold text-gray-900 mb-4'>
        {evacuationLevelMap[evacuationLevel]}用の袋・保管情報
      </h3>

      {!isEditing ? (
        <div>
          {hasInfo ? (
            <div className='space-y-3'>
              {bagInfo.bagName && (
                <div className=''>
                  <span className='font-medium text-gray-800 mr-2'>
                    袋の名前:
                  </span>
                  <span className='text-gray-700'>{bagInfo.bagName}</span>
                </div>
              )}
              {bagInfo.storageLocation && (
                <div className=''>
                  <span className='font-medium text-gray-800 mr-2'>
                    保管場所:
                  </span>
                  <span className='text-gray-700'>
                    {bagInfo.storageLocation}
                  </span>
                </div>
              )}
              {bagInfo.notes && (
                <div className=''>
                  <span className='font-medium text-gray-800 mr-2'>メモ:</span>
                  <span className='text-gray-700'>{bagInfo.notes}</span>
                </div>
              )}
              <div className='pt-2'>
                <Button
                  variant='secondary'
                  onClick={() => setIsEditing(true)}
                  className='text-gray-700 hover:bg-gray-100'
                >
                  編集
                </Button>
              </div>
            </div>
          ) : (
            <div className='text-center'>
              <p className='text-gray-700 mb-3'>
                {evacuationLevelMap[evacuationLevel]}
                用の袋情報がまだ登録されていません
              </p>
              <Button
                variant='primary'
                onClick={() => setIsEditing(true)}
                className='bg-gray-600 hover:bg-gray-700'
              >
                袋情報を登録する
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Input
              id='bagName'
              label='袋の名前'
              name='bagName'
              placeholder='例: 緊急避難バッグ、防災リュック'
              type='text'
              value={bagInfo.bagName}
              onChange={handleInputChange}
            />
            <Input
              id='storageLocation'
              label='保管場所'
              name='storageLocation'
              placeholder='例: 玄関、クローゼット、車の中'
              type='text'
              value={bagInfo.storageLocation}
              onChange={handleInputChange}
            />
          </div>
          <Input
            id='notes'
            label='メモ・説明'
            name='notes'
            placeholder='例: 家族4人分、重量約5kg、定期点検は毎月第1日曜日'
            type='text'
            value={bagInfo.notes}
            onChange={handleInputChange}
          />
          <div className='flex gap-3 justify-end'>
            <Button variant='secondary' onClick={handleCancel}>
              キャンセル
            </Button>
            <Button
              variant='primary'
              onClick={saveBagInfo}
              className='bg-gray-600 hover:bg-gray-700'
            >
              保存
            </Button>
          </div>
        </div>
      )}

      <div className='mt-4 pt-4 border-t border-gray-200'>
        <p className='text-sm text-gray-700'>
          この情報は避難時にすぐに袋を見つけるために役立ちます
        </p>
      </div>
    </div>
  );
}
