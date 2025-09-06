'use client';
import { Button, Card, Input } from '@/components/ui';
import type { EmergencyItem } from '@/types/forms';
import { useState } from 'react';

interface EmergencyItemsFormProps {
  items: EmergencyItem[];
  onUpdate: (items: EmergencyItem[]) => void;
}

export function EmergencyItemsForm({
  items,
  onUpdate,
}: EmergencyItemsFormProps) {
  const [newItem, setNewItem] = useState<Omit<EmergencyItem, 'id'>>({
    name: '',
    quantity: 1,
    container: '',
    notes: '',
  });
  const [isAdding, setIsAdding] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const handleAddItem = () => {
    if (!newItem.name.trim()) return;

    const item: EmergencyItem = {
      id: Date.now().toString(),
      ...newItem,
    };

    onUpdate([...items, item]);
    setNewItem({
      name: '',
      quantity: 1,
      container: '',
      notes: '',
    });
    setIsAdding(false);
  };

  const handleRemoveItem = (id: string) => {
    onUpdate(items.filter(item => item.id !== id));
  };

  // アイテムをカテゴリ別にグループ化（シンプル版）
  const groupedItems = items.reduce(
    (acc, item) => {
      const categoryName = item.category || 'その他';

      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(item);
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
          + 追加
        </Button>
      </div>

      <div className='space-y-6'>
        {/* 避難用持ち物からの連携 */}
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
          <h3 className='font-medium text-blue-900 mb-3'>
            💡 避難用持ち物リストを活用しよう
          </h3>
          <div className='text-sm text-blue-800 space-y-2 mb-4'>
            <p>
              <strong>避難用持ち物リスト</strong>
              で既に整理されている内容を参考にできます：
            </p>
            <ul className='list-disc list-inside space-y-1 ml-2'>
              <li>
                <strong>一次避難</strong>: 緊急時に必要な最低限のもの
              </li>
              <li>
                <strong>二次避難</strong>: 避難所での長期生活に必要なもの
              </li>
              <li>
                <strong>袋の割り当て</strong>:
                どの袋に何を入れるかの家族での共有
              </li>
            </ul>
            <p className='mt-2 text-xs'>
              例：「一次避難はリュック、二次避難はキャリーケース」など
            </p>
          </div>
          <div className='flex flex-col sm:flex-row gap-3'>
            <a
              href='/evacuation-items'
              className='inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors'
            >
              📋 避難用持ち物を確認する
            </a>
            <div className='text-xs text-blue-600 flex items-center'>
              💡 避難用持ち物ページに移動して内容を確認できます
            </div>
          </div>
        </div>

        {/* 登録済みアイテム */}
        {Object.keys(groupedItems).length > 0 ? (
          <div className='space-y-4'>
            <h3 className='font-medium text-gray-900'>登録済みアイテム</h3>
            {Object.entries(groupedItems).map(
              ([categoryName, categoryItems]) => {
                return (
                  <div
                    key={categoryName}
                    className='border border-gray-200 rounded-lg p-4'
                  >
                    <h4 className='font-medium text-gray-800 mb-2'>
                      {categoryName}
                    </h4>
                    <div className='space-y-2'>
                      {categoryItems.map(item => (
                        <div
                          key={item.id}
                          className='flex justify-between items-center bg-gray-50 rounded p-2'
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
                                📦 {item.container}
                              </span>
                            )}
                            {item.notes && (
                              <p className='text-sm text-gray-600'>
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
              }
            )}
          </div>
        ) : (
          !isAdding && (
            <div className='text-center py-8 text-gray-500'>
              <p>持参物が登録されていません</p>
              <p className='text-sm'>
                上のクイック追加ボタンまたは「+ 追加」から登録してください
              </p>
            </div>
          )
        )}

        {/* 新規追加フォーム */}
        {isAdding && (
          <div className='border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50'>
            <h3 className='font-medium text-gray-900 mb-4'>
              カスタムアイテムを追加
            </h3>
            <div className='space-y-4'>
              <Input
                label='アイテム名'
                required
                value={newItem.name}
                onChange={e =>
                  setNewItem(prev => ({ ...prev, name: e.target.value }))
                }
                placeholder='例: 特別な薬、ペット用品'
              />

              <Input
                label='数量'
                type='number'
                min={1}
                value={newItem.quantity || 1}
                onChange={e =>
                  setNewItem(prev => ({
                    ...prev,
                    quantity: Number(e.target.value),
                  }))
                }
              />

              <Input
                label='入れる袋・容器'
                value={newItem.container || ''}
                onChange={e =>
                  setNewItem(prev => ({ ...prev, container: e.target.value }))
                }
                placeholder='例: リュック、キャリーケース、エコバッグ'
              />

              <Input
                label='備考・メモ'
                value={newItem.notes || ''}
                onChange={e =>
                  setNewItem(prev => ({ ...prev, notes: e.target.value }))
                }
                placeholder='例: 冷蔵保存が必要、使用期限に注意'
              />

              <div className='flex gap-2'>
                <Button onClick={handleAddItem} disabled={!newItem.name.trim()}>
                  追加
                </Button>
                <Button
                  variant='secondary'
                  onClick={() => {
                    setIsAdding(false);
                    setNewItem({
                      name: '',
                      quantity: 1,
                      notes: '',
                    });
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
