import React, { useEffect, useState } from 'react';

import { Input, Select } from '@/components/ui';
import { useAuth } from '@/hooks/auth/useAuth';
import { useTeam } from '@/hooks/team/useTeam';
import type { SupplyFormData } from '@/types/forms';

interface SupplyOptionalFieldsProps {
  formData: SupplyFormData;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
}

export function SupplyOptionalFields({
  formData,
  onChange,
}: SupplyOptionalFieldsProps) {
  const { user } = useAuth();
  const { currentTeamId } = useTeam(user);
  const [availableBags, setAvailableBags] = useState<
    Array<{ value: string; label: string }>
  >([]);

  // 避難用持ち物ページで登録された袋を取得
  useEffect(() => {
    if (!user || !currentTeamId || !formData.evacuationLevel) return;

    const evacuationLevel =
      formData.evacuationLevel === '一次避難' ? 'primary' : 'secondary';
    const storageKey = `bagInfo_${currentTeamId}_${evacuationLevel}`;
    const storedBagInfo = localStorage.getItem(storageKey);

    const bags = [
      { value: '', label: '袋を選択してください' },
      { value: 'not_assigned', label: '袋に入れない（後で決める）' },
    ];

    if (storedBagInfo) {
      const bagInfo = JSON.parse(storedBagInfo);
      if (bagInfo.bagName) {
        bags.push({ value: bagInfo.bagName, label: bagInfo.bagName });
      }
    }

    setAvailableBags(bags);
  }, [user, currentTeamId, formData.evacuationLevel]);

  return (
    <div className='space-y-4'>
      <h3 className='text-lg font-medium text-gray-900'>追加情報（任意）</h3>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <Input
          id='amount'
          label='金額'
          name='amount'
          placeholder='例: 500'
          type='number'
          value={formData.amount || ''}
          onChange={onChange}
        />

        <Input
          id='purchaseLocation'
          label='購入場所'
          name='purchaseLocation'
          placeholder='例: スーパーマーケット'
          type='text'
          value={formData.purchaseLocation || ''}
          onChange={onChange}
        />
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <Input
          id='label'
          label='ラベル・メモ'
          name='label'
          placeholder='例: 非常用、日常用'
          type='text'
          value={formData.label || ''}
          onChange={onChange}
        />

        <Input
          id='storageLocation'
          label='保管場所'
          name='storageLocation'
          placeholder='例: キッチン、倉庫'
          type='text'
          value={formData.storageLocation || ''}
          onChange={onChange}
        />
      </div>

      {formData.evacuationLevel &&
        ['一次避難', '二次避難'].includes(formData.evacuationLevel) && (
          <div className='bg-gray-50 border border-gray-200 rounded-lg p-4'>
            <h4 className='text-md font-medium text-gray-900 mb-3'>
              袋への割り当て
            </h4>
            <Select
              id='containerType'
              label='どの袋に入れますか？'
              name='containerType'
              options={availableBags}
              placeholder='袋を選択してください'
              value={formData.containerType || ''}
              onChange={onChange}
            />
            {formData.containerType === 'not_assigned' && (
              <p className='text-sm text-gray-600 mt-2'>
                ※ 後から避難用持ち物ページで袋を決めることができます
              </p>
            )}
            {!availableBags.some(
              bag => bag.value && bag.value !== 'not_assigned'
            ) && (
              <p className='text-sm text-gray-600 mt-2'>
                ※
                避難用持ち物ページで袋を登録すると、ここで選択できるようになります
              </p>
            )}
          </div>
        )}
    </div>
  );
}
