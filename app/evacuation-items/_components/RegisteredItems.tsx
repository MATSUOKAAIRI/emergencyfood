'use client';

import { useAuth } from '@/hooks/auth/useAuth';
import { useTeam } from '@/hooks/team/useTeam';
import { useEffect, useState } from 'react';

interface RegisteredSupply {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  evacuationLevel: string;
  storageLocation?: string;
  containerType?: string;
  expiryDate: string;
  label?: string;
}

interface RegisteredItemsProps {
  evacuationLevel: 'primary' | 'secondary';
}

export default function RegisteredItems({
  evacuationLevel,
}: RegisteredItemsProps) {
  const { user } = useAuth();
  const { currentTeamId, team } = useTeam(user);
  const [supplies, setSupplies] = useState<RegisteredSupply[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const evacuationLevelMap = {
    primary: '一次避難',
    secondary: '二次避難',
  };

  useEffect(() => {
    const fetchSupplies = async () => {
      if (!user || !currentTeamId) {
        setLoading(false);
        return;
      }

      try {
        const token = await user.getIdToken();
        const response = await fetch(
          `/api/supplies/list?teamId=${currentTeamId}&isArchived=false`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('備蓄品の取得に失敗しました');
        }

        const data = await response.json();

        // 指定された避難レベルでフィルタリング
        const filteredSupplies = data.supplies.filter(
          (supply: RegisteredSupply) =>
            supply.evacuationLevel === evacuationLevelMap[evacuationLevel]
        );

        setSupplies(filteredSupplies);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : '不明なエラーが発生しました'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSupplies();
  }, [user, currentTeamId, evacuationLevel]);

  if (loading) {
    return (
      <div className='text-center py-8'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
        <p className='mt-2 text-gray-600'>登録済みアイテムを読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
        <p className='text-red-800'>エラー: {error}</p>
      </div>
    );
  }

  if (!user || !currentTeamId) {
    return (
      <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
        <p className='text-yellow-800'>
          登録済みアイテムを表示するには、ログインしてチームを選択してください。
        </p>
      </div>
    );
  }

  if (supplies.length === 0) {
    return (
      <div className='bg-gray-50 border border-gray-200 rounded-lg p-6 text-center'>
        <p className='text-gray-600 mb-2'>
          {evacuationLevelMap[evacuationLevel]}
          用のアイテムは登録されていません。
        </p>
        <p className='text-sm text-gray-500'>
          備蓄品登録ページから避難用のアイテムを登録してみてください。
        </p>
      </div>
    );
  }

  // 袋・容器別にグループ化し、保管場所も集約
  const groupedByContainer = supplies.reduce(
    (acc, supply) => {
      // 袋が指定されていない場合は「入っていない」カテゴリに分類
      let container: string;
      if (!supply.containerType || supply.containerType === 'not_assigned') {
        container = '入っていない';
      } else {
        container = supply.containerType;
      }

      if (!acc[container]) {
        acc[container] = {
          supplies: [],
          storageLocations: new Set<string>(),
        };
      }
      acc[container].supplies.push(supply);
      if (supply.storageLocation) {
        acc[container].storageLocations.add(supply.storageLocation);
      }
      return acc;
    },
    {} as Record<
      string,
      { supplies: RegisteredSupply[]; storageLocations: Set<string> }
    >
  );

  // 「入っていない」アイテムと袋に入っているアイテムを分離
  const unassignedItems = groupedByContainer['入っていない'];
  const assignedContainers = Object.fromEntries(
    Object.entries(groupedByContainer).filter(([key]) => key !== '入っていない')
  );

  return (
    <div className='space-y-6'>
      <div className='text-center mb-6'>
        <h3 className='text-xl font-semibold text-gray-800 mb-2'>
          登録済みの{evacuationLevelMap[evacuationLevel]}用アイテム
        </h3>
        <p className='text-gray-600'>
          あなたが備蓄品として登録した{evacuationLevelMap[evacuationLevel]}
          用のアイテムです
        </p>
      </div>

      {/* 入っていないアイテム */}
      {unassignedItems && unassignedItems.supplies.length > 0 && (
        <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6'>
          <h4 className='text-lg font-semibold text-yellow-900 mb-3 flex items-center'>
            <span className='mr-2'>📦</span>
            袋に入っていないアイテム
          </h4>
          <p className='text-sm text-yellow-800 mb-4'>
            これらのアイテムはまだ袋に割り当てられていません。備品編集から袋を指定できます。
          </p>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            {unassignedItems.supplies.map(supply => (
              <div
                key={supply.id}
                className='bg-white border border-yellow-300 rounded-md p-3'
              >
                <div className='flex items-start justify-between mb-2'>
                  <h5 className='font-medium text-gray-900'>{supply.name}</h5>
                  <span className='text-sm text-gray-600 font-medium'>
                    {supply.quantity} {supply.unit}
                  </span>
                </div>
                <div className='space-y-1 text-sm text-gray-600'>
                  <p>カテゴリ: {supply.category}</p>
                  {supply.storageLocation && (
                    <p>保管場所: {supply.storageLocation}</p>
                  )}
                  {supply.label && <p>メモ: {supply.label}</p>}
                  <p className='text-xs text-gray-500'>
                    賞味期限:{' '}
                    {new Date(supply.expiryDate).toLocaleDateString('ja-JP')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 避難時チェックリスト */}
      {Object.keys(assignedContainers).length > 0 && (
        <div className='bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6'>
          <h4 className='text-lg font-semibold text-gray-900 mb-3'>
            避難時の持ち出しチェックリスト
          </h4>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            {Object.entries(assignedContainers).map(
              ([containerType, containerData]) => {
                const storageLocationsList = Array.from(
                  containerData.storageLocations
                );
                return (
                  <div
                    key={containerType}
                    className='bg-white border border-gray-300 rounded-md p-3'
                  >
                    <div className=' mb-2'>
                      <input
                        type='checkbox'
                        id={`check-${containerType}`}
                        className='mr-2 h-4 w-4 text-gray-600 rounded'
                      />
                      <label
                        htmlFor={`check-${containerType}`}
                        className='font-medium text-gray-900'
                      >
                        {containerType}
                      </label>
                    </div>
                    {storageLocationsList.length > 0 && (
                      <p className='text-sm text-gray-600 ml-6'>
                        保管場所: {storageLocationsList.join(', ')}
                      </p>
                    )}
                    <p className='text-xs text-gray-500 ml-6'>
                      {containerData.supplies.length}アイテム入り
                    </p>
                  </div>
                );
              }
            )}
          </div>
          <p className='text-sm text-gray-700 mt-3 text-center'>
            避難時にはこのチェックリストを使って、必要な袋を忘れずに持ち出しましょう
          </p>
        </div>
      )}

      {Object.entries(assignedContainers).map(
        ([containerType, containerData]) => {
          const storageLocationsList = Array.from(
            containerData.storageLocations
          );
          return (
            <div
              key={containerType}
              className='border border-gray-200 rounded-lg p-4 bg-gray-50'
            >
              <div className='mb-4'>
                <h4 className='text-lg font-semibold text-gray-900 mb-2'>
                  {containerType}
                  <span className='ml-2 text-sm font-normal text-gray-700'>
                    ({containerData.supplies.length}アイテム)
                  </span>
                </h4>

                {storageLocationsList.length > 0 && (
                  <div className='bg-gray-100 rounded-md p-3 mb-3'>
                    <h5 className='text-sm font-semibold text-gray-800 mb-1'>
                      この袋の保管場所
                    </h5>
                    <div className='flex flex-wrap gap-2'>
                      {storageLocationsList.map((location, index) => (
                        <span
                          key={index}
                          className='inline-block bg-gray-200 text-gray-800 text-xs font-medium px-2 py-1 rounded-full'
                        >
                          {location}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                {containerData.supplies.map(supply => (
                  <div
                    key={supply.id}
                    className='bg-white border border-gray-300 rounded-md p-3'
                  >
                    <div className=' justify-between mb-2'>
                      <h5 className='font-medium text-gray-900'>
                        {supply.name}
                      </h5>
                      <span className='text-sm text-gray-600 font-medium'>
                        {supply.quantity} {supply.unit}
                      </span>
                    </div>

                    <div className='space-y-1 text-sm text-gray-600'>
                      <p>カテゴリ: {supply.category}</p>
                      {supply.storageLocation && (
                        <p>保管場所: {supply.storageLocation}</p>
                      )}
                      {supply.label && <p>メモ: {supply.label}</p>}
                      <p className='text-xs text-gray-500'>
                        賞味期限:{' '}
                        {new Date(supply.expiryDate).toLocaleDateString(
                          'ja-JP'
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        }
      )}
    </div>
  );
}
