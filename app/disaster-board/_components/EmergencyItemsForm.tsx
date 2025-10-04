'use client';
import { Button, Card, Input, Select } from '@/components/ui';
import { useAuth } from '@/hooks/auth/useAuth';
import { useTeam } from '@/hooks/team/useTeam';
import type { EmergencyItem } from '@/types/forms';
import { getAllBagNames } from '@/utils/helpers';
import { useEffect, useState } from 'react';

interface EmergencyItemsFormProps {
  items: EmergencyItem[];
  onUpdate: (items: EmergencyItem[]) => void;
}

interface BagMemo {
  bagName: string;
  memo: string;
}

const INITIAL_ITEM: Omit<EmergencyItem, 'id'> = {
  name: '',
  quantity: 1,
  container: '',
  category: '',
  notes: '',
};

export function EmergencyItemsForm({
  items,
  onUpdate,
}: EmergencyItemsFormProps) {
  const { user } = useAuth();
  const { currentTeamId } = useTeam(user);
  const [newItem, setNewItem] =
    useState<Omit<EmergencyItem, 'id'>>(INITIAL_ITEM);
  const [isAdding, setIsAdding] = useState(false);
  const [bagOptions, setBagOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [bagMemos, setBagMemos] = useState<BagMemo[]>([]);
  const [editingMemo, setEditingMemo] = useState<string | null>(null);

  useEffect(() => {
    if (currentTeamId) {
      const bags = getAllBagNames(currentTeamId);
      setBagOptions(bags);

      const initialMemos = bags.map(bag => ({
        bagName: bag.value,
        memo: '',
      }));
      setBagMemos(initialMemos);
    }
  }, [currentTeamId]);

  const resetForm = () => {
    setNewItem(INITIAL_ITEM);
  };

  const handleAddItem = () => {
    if (!newItem.name.trim()) return;

    const item: EmergencyItem = {
      id: Date.now().toString(),
      ...newItem,
    };

    onUpdate([...items, item]);
    resetForm();
    setIsAdding(false);
  };

  const handleRemoveItem = (id: string) => {
    onUpdate(items.filter(item => item.id !== id));
  };

  const updateBagMemo = (bagName: string, memo: string) => {
    setBagMemos(prev =>
      prev.map(bagMemo =>
        bagMemo.bagName === bagName ? { ...bagMemo, memo } : bagMemo
      )
    );
  };

  const getBagMemo = (bagName: string): string => {
    return bagMemos.find(memo => memo.bagName === bagName)?.memo || '';
  };

  const groupedItems = items.reduce(
    (acc, item) => {
      const bagName = item.category || 'その他';

      if (!acc[bagName]) {
        acc[bagName] = [];
      }
      acc[bagName].push(item);
      return acc;
    },
    {} as Record<string, EmergencyItem[]>
  );

  return (
    <Card>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-xl font-semibold text-gray-900'>避難時の持参物</h2>
        <Button
          variant='outline'
          size='sm'
          onClick={() => setIsAdding(true)}
          disabled={isAdding}
        >
          追加
        </Button>
      </div>

      <div className='space-y-6'>
        <div className='bg-gray-50 border border-gray-200 rounded-lg p-4'>
          <h3 className='font-medium text-gray-900 mb-3'>
            避難用持ち物リストを活用しよう
          </h3>
          <div className='text-sm text-gray-800 space-y-2 mb-4'>
            <ul className='list-disc list-inside space-y-1 ml-2'>
              <li>
                <strong>一次避難</strong>: 緊急時に必要な最低限のもの
              </li>
              <li>
                <strong>二次避難</strong>: 避難所での長期生活に必要なもの
              </li>
              <li>
                <strong>袋の割り当て</strong>:
                どれが誰用でどこにおいてあるのかを共有
              </li>
            </ul>
            <p className='mt-2 text-xs'>
              例：「一次避難はリュック、二次避難はキャリーケース」など
            </p>
          </div>
          <div className='flex flex-col sm:flex-row gap-3'>
            <a
              href='/evacuation-items'
              className='inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors'
            >
              避難用持ち物を確認する
            </a>
            <div className='text-xs text-gray-600 flex items-center'>
              避難用持ち物ページに移動して内容を確認できます
            </div>
          </div>
        </div>

        {Object.keys(groupedItems).length > 0 ? (
          <div className='space-y-4'>
            <h3 className='font-medium text-gray-900'>袋別の持参物</h3>
            {Object.entries(groupedItems).map(([bagName, bagItems]) => {
              const currentMemo = getBagMemo(bagName);
              const isEditingThisMemo = editingMemo === bagName;

              return (
                <div
                  key={bagName}
                  className='border border-gray-200 rounded-lg p-4'
                >
                  <div className='flex justify-between items-start mb-3'>
                    <h4 className='font-medium text-gray-800 text-lg'>
                      {bagName}
                    </h4>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() =>
                        setEditingMemo(isEditingThisMemo ? null : bagName)
                      }
                    >
                      {isEditingThisMemo ? 'キャンセル' : 'メモ編集'}
                    </Button>
                  </div>

                  {isEditingThisMemo ? (
                    <div className='mb-4 p-3 bg-gray-50 border border-gray-200 rounded'>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        この袋についてのメモ
                      </label>
                      <textarea
                        value={currentMemo}
                        onChange={e => updateBagMemo(bagName, e.target.value)}
                        placeholder='例: 玄関に置いてある、重量約3kg、家族4人分'
                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        rows={3}
                      />
                      <div className='flex gap-2 mt-2'>
                        <Button size='sm' onClick={() => setEditingMemo(null)}>
                          保存
                        </Button>
                      </div>
                    </div>
                  ) : currentMemo ? (
                    <div className='mb-4 p-3 bg-gray-50 border border-gray-200 rounded'>
                      <p className='text-sm text-gray-700'>
                        <strong>メモ:</strong> {currentMemo}
                      </p>
                    </div>
                  ) : (
                    <div className='mb-4 p-3 bg-gray-50 border border-gray-200 rounded'>
                      <p className='text-sm text-gray-500'>
                        この袋についてのメモはまだありません
                      </p>
                    </div>
                  )}

                  <div className='space-y-2'>
                    <h5 className='text-sm font-medium text-gray-700'>
                      アイテム ({bagItems.length}個)
                    </h5>
                    {bagItems.map(item => (
                      <div
                        key={item.id}
                        className='flex justify-between items-center bg-white border border-gray-200 rounded p-3'
                      >
                        <div>
                          <span className='font-medium'>{item.name}</span>
                          {item.quantity && item.quantity > 1 && (
                            <span className='text-sm text-gray-600 ml-2'>
                              × {item.quantity}
                            </span>
                          )}
                          {item.container && (
                            <span className='text-sm text-blue-600 ml-2 bg-blue-50 px-2 py-0.5 rounded'>
                              {item.container}
                            </span>
                          )}
                          {item.notes && (
                            <p className='text-sm text-gray-600 mt-1'>
                              {item.notes}
                            </p>
                          )}
                        </div>
                        <Button
                          variant='danger'
                          size='sm'
                          onClick={() => handleRemoveItem(item.id!)}
                        >
                          削除
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          !isAdding && (
            <div className='text-center py-8 text-gray-500'>
              <p>持参物が登録されていません</p>
              <p className='text-sm'>「追加」から登録してください</p>
            </div>
          )
        )}

        {isAdding && (
          <div className='border-2 border-solid border-gray-300 rounded-lg p-4 bg-gray-50'>
            <h3 className='font-bold text-gray-900 mb-4'>持参物を追加</h3>
            <div className='space-y-4'>
              <Select
                label='袋・容器'
                required
                value={newItem.category || ''}
                onChange={e =>
                  setNewItem(prev => ({ ...prev, category: e.target.value }))
                }
                options={bagOptions}
                placeholder='袋を選択してください'
              />

              <Input
                label='備考・メモ'
                value={newItem.notes || ''}
                onChange={e =>
                  setNewItem(prev => ({ ...prev, notes: e.target.value }))
                }
                placeholder='例:家族４人用、玄関においてある'
              />

              <div className='flex gap-2'>
                <Button
                  onClick={handleAddItem}
                  disabled={!newItem.name.trim() || !newItem.category}
                >
                  追加
                </Button>
                <Button
                  variant='secondary'
                  onClick={() => {
                    setIsAdding(false);
                    resetForm();
                  }}
                >
                  キャンセル
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
