'use client';
import { useAuth } from '@/hooks';
import type { AgeGroupChecklist, PetChecklist, Team } from '@/types';
import {
  AGE_GROUP_EMOJIS,
  AGE_GROUP_LABELS,
  PET_TYPE_EMOJIS,
  PET_TYPE_LABELS,
} from '@/types/handbook';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface SuppliesChecklistProps {
  initialTeamData: Team | null;
}

export default function SuppliesChecklist({
  initialTeamData,
}: SuppliesChecklistProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [checklists, setChecklists] = useState<{
    ageGroups: AgeGroupChecklist[];
    pets: PetChecklist[];
  }>({
    ageGroups: [],
    pets: [],
  });

  // 備蓄管理設定
  const [householdSize, setHouseholdSize] = useState(
    initialTeamData?.stockSettings?.householdSize || 1
  );
  const [stockDays, setStockDays] = useState(
    initialTeamData?.stockSettings?.stockDays || 7
  );
  const [hasPets, setHasPets] = useState(
    initialTeamData?.stockSettings?.hasPets || false
  );
  const [dogCount, setDogCount] = useState(
    initialTeamData?.stockSettings?.dogCount ?? 0
  );
  const [catCount, setCatCount] = useState(
    initialTeamData?.stockSettings?.catCount ?? 0
  );
  const [updatingStockSettings, setUpdatingStockSettings] = useState(false);

  // 詳細設定
  const [useDetailedComposition, setUseDetailedComposition] = useState(
    initialTeamData?.stockSettings?.useDetailedComposition || false
  );
  const [adultCount, setAdultCount] = useState(
    initialTeamData?.stockSettings?.composition?.adult || 0
  );
  const [childCount, setChildCount] = useState(
    initialTeamData?.stockSettings?.composition?.child || 0
  );
  const [infantCount, setInfantCount] = useState(
    initialTeamData?.stockSettings?.composition?.infant || 0
  );
  const [elderlyCount, setElderlyCount] = useState(
    initialTeamData?.stockSettings?.composition?.elderly || 0
  );

  // 通知設定
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    initialTeamData?.stockSettings?.notifications?.enabled !== false
  );
  const [notifyCriticalStock, setNotifyCriticalStock] = useState(
    initialTeamData?.stockSettings?.notifications?.criticalStock !== false
  );
  const [notifyLowStock, setNotifyLowStock] = useState(
    initialTeamData?.stockSettings?.notifications?.lowStock !== false
  );
  const [notifyExpiryNear, setNotifyExpiryNear] = useState(
    initialTeamData?.stockSettings?.notifications?.expiryNear !== false
  );
  const [notifyWeeklyReport, setNotifyWeeklyReport] = useState(
    initialTeamData?.stockSettings?.notifications?.weeklyReport || false
  );
  const [stockLevel, setStockLevel] = useState<
    'beginner' | 'standard' | 'advanced'
  >(initialTeamData?.stockSettings?.stockLevel || 'beginner');
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);

  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    if (!initialTeamData?.stockSettings) {
      setChecklists({
        ageGroups: [
          {
            ageGroup: 'adult',
            count: 1,
            items: [
              { id: 'adult-water', name: '水（1人1日3L）', isEssential: true },
              { id: 'adult-food', name: '非常食（3日分）', isEssential: true },
              { id: 'adult-medicine', name: '常備薬', isEssential: true },
              { id: 'adult-clothes', name: '着替え', isEssential: false },
              { id: 'adult-hygiene', name: '衛生用品', isEssential: true },
            ],
            checkedItems: [],
          },
        ],
        pets: [],
      });
      return;
    }

    const {
      householdSize,
      hasPets,
      dogCount,
      catCount,
      useDetailedComposition,
      composition,
    } = initialTeamData.stockSettings;

    const ageGroups: AgeGroupChecklist[] = [];

    if (useDetailedComposition && composition) {
      if (composition.adult > 0) {
        ageGroups.push({
          ageGroup: 'adult',
          count: composition.adult,
          items: [
            { id: 'adult-water', name: '水（1人1日3L）', isEssential: true },
            { id: 'adult-food', name: '非常食（3日分）', isEssential: true },
            { id: 'adult-medicine', name: '常備薬', isEssential: true },
            { id: 'adult-clothes', name: '着替え', isEssential: false },
            { id: 'adult-hygiene', name: '衛生用品', isEssential: true },
          ],
          checkedItems: [],
        });
      }

      if (composition.child > 0) {
        ageGroups.push({
          ageGroup: 'child',
          count: composition.child,
          items: [
            { id: 'child-water', name: '水（1人1日2L）', isEssential: true },
            { id: 'child-food', name: '子供用非常食', isEssential: true },
            { id: 'child-toy', name: 'おもちゃ・絵本', isEssential: false },
            { id: 'child-clothes', name: '着替え', isEssential: true },
            {
              id: 'child-diaper',
              name: 'おむつ（必要に応じて）',
              isEssential: false,
            },
          ],
          checkedItems: [],
        });
      }

      if (composition.infant > 0) {
        ageGroups.push({
          ageGroup: 'infant',
          count: composition.infant,
          items: [
            { id: 'infant-milk', name: '粉ミルク', isEssential: true },
            { id: 'infant-water', name: '水（調乳用）', isEssential: true },
            { id: 'infant-diaper', name: 'おむつ', isEssential: true },
            { id: 'infant-clothes', name: 'ベビー服', isEssential: true },
            { id: 'infant-toy', name: 'ベビー用品', isEssential: false },
          ],
          checkedItems: [],
        });
      }

      if (composition.elderly > 0) {
        ageGroups.push({
          ageGroup: 'elderly',
          count: composition.elderly,
          items: [
            { id: 'elderly-water', name: '水（1人1日3L）', isEssential: true },
            {
              id: 'elderly-food',
              name: '介護食・やわらかい食品',
              isEssential: true,
            },
            { id: 'elderly-medicine', name: '薬・医療用品', isEssential: true },
            { id: 'elderly-glasses', name: '眼鏡・補聴器', isEssential: true },
            { id: 'elderly-clothes', name: '着替え', isEssential: true },
          ],
          checkedItems: [],
        });
      }
    } else {
      const totalPeople = householdSize || 1;
      ageGroups.push({
        ageGroup: 'adult',
        count: totalPeople,
        items: [
          { id: 'adult-water', name: '水（1人1日3L）', isEssential: true },
          { id: 'adult-food', name: '非常食（3日分）', isEssential: true },
          { id: 'adult-medicine', name: '常備薬', isEssential: true },
          { id: 'adult-clothes', name: '着替え', isEssential: false },
          { id: 'adult-hygiene', name: '衛生用品', isEssential: true },
        ],
        checkedItems: [],
      });
    }

    const pets: PetChecklist[] = [];

    if (hasPets) {
      if ((dogCount ?? 0) > 0) {
        pets.push({
          petType: 'dog',
          count: dogCount ?? 0,
          items: [
            {
              id: 'dog-food',
              name: 'ドッグフード（7日分）',
              isEssential: true,
            },
            { id: 'dog-water', name: '水', isEssential: true },
            { id: 'dog-medicine', name: 'ペット用薬', isEssential: true },
            { id: 'dog-leash', name: 'リード・首輪', isEssential: true },
            { id: 'dog-toy', name: 'おもちゃ', isEssential: false },
          ],
          checkedItems: [],
        });
      }

      if ((catCount ?? 0) > 0) {
        pets.push({
          petType: 'cat',
          count: catCount ?? 0,
          items: [
            {
              id: 'cat-food',
              name: 'キャットフード（7日分）',
              isEssential: true,
            },
            { id: 'cat-water', name: '水', isEssential: true },
            { id: 'cat-litter', name: '猫砂', isEssential: true },
            { id: 'cat-carrier', name: 'キャリーケース', isEssential: true },
            { id: 'cat-toy', name: 'おもちゃ', isEssential: false },
          ],
          checkedItems: [],
        });
      }
    }

    setChecklists({ ageGroups, pets });
  }, [initialTeamData]);

  const toggleItem = (type: 'age' | 'pet', groupId: string, itemId: string) => {
    setChecklists(prev => {
      if (type === 'age') {
        return {
          ...prev,
          ageGroups: prev.ageGroups.map(group =>
            group.ageGroup === groupId
              ? {
                  ...group,
                  checkedItems: group.checkedItems.includes(itemId)
                    ? group.checkedItems.filter(id => id !== itemId)
                    : [...group.checkedItems, itemId],
                }
              : group
          ),
        };
      } else {
        return {
          ...prev,
          pets: prev.pets.map(pet =>
            pet.petType === groupId
              ? {
                  ...pet,
                  checkedItems: pet.checkedItems.includes(itemId)
                    ? pet.checkedItems.filter(id => id !== itemId)
                    : [...pet.checkedItems, itemId],
                }
              : pet
          ),
        };
      }
    });
  };

  const getProgress = (checkedItems: string[], totalItems: number) => {
    return Math.round((checkedItems.length / totalItems) * 100);
  };

  const handleUpdateStockSettings = async () => {
    if (!initialTeamData) return;

    setUpdatingStockSettings(true);
    try {
      const idToken = await user?.getIdToken();
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
          teamId: initialTeamData.id,
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
            stockLevel,
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

  const handleGoToSettings = () => {
    router.push('/settings');
  };

  return (
    <div className='space-y-6'>
      <div className='bg-gray-50 p-4 rounded-lg'>
        <h3 className='text-lg font-semibold text-gray-900 mb-2'>
          チェックポイント1: 年齢別備蓄品チェックリスト
        </h3>
        <p className='text-sm text-gray-700'>
          家族構成に応じた備蓄品の準備状況をチェックしましょう
        </p>
      </div>
      {!initialTeamData?.stockSettings ? (
        <div className='bg-gray-50 p-4 text-gray-800 rounded-md'>
          <p className='font-medium'>家族構成の設定がありません。</p>
          <p className='text-sm mt-2'>
            設定ページで家族構成を設定すると、より詳細なチェックリストが表示されます。
          </p>
        </div>
      ) : (
        <div className='bg-gray-300 p-4 text-gray-800 rounded-md'>
          <p className='font-medium'>家族構成が設定されています。</p>
          <p className='text-sm mt-2'>
            家族人数: {initialTeamData.stockSettings.householdSize}人
            {initialTeamData.stockSettings.useDetailedComposition &&
              initialTeamData.stockSettings.composition && (
                <span>
                  {' '}
                  (大人: {initialTeamData.stockSettings.composition.adult}人,
                  子供: {initialTeamData.stockSettings.composition.child}人,
                  乳幼児: {initialTeamData.stockSettings.composition.infant}人,
                  高齢者: {initialTeamData.stockSettings.composition.elderly}人)
                </span>
              )}
            {initialTeamData.stockSettings.hasPets && (
              <span>
                {' '}
                | ペット: 犬{initialTeamData.stockSettings.dogCount}匹, 猫
                {initialTeamData.stockSettings.catCount}匹
              </span>
            )}
          </p>
        </div>
      )}{' '}
      {/* 備蓄管理設定 */}
      <div className='mt-4 sm:mt-6 bg-gray-50 rounded-lg overflow-hidden border border-gray-200'>
        <button
          onClick={() => setIsSettingsExpanded(!isSettingsExpanded)}
          className='w-full p-3 sm:p-4 flex items-center justify-between hover:bg-gray-100 transition-colors'
        >
          <h4 className='text-sm font-medium text-gray-900'>備蓄管理の設定</h4>
          <svg
            className={`w-5 h-5 text-gray-600 transition-transform ${
              isSettingsExpanded ? 'transform rotate-180' : ''
            }`}
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M19 9l-7 7-7-7'
            />
          </svg>
        </button>

        {isSettingsExpanded && (
          <div className='px-3 sm:px-4 pb-3 sm:pb-4 space-y-4'>
            <p className='text-sm text-gray-700'>
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
                  onChange={e =>
                    setHouseholdSize(parseInt(e.target.value) || 1)
                  }
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
                ※ 政府推奨は最低3日分、できれば7日分以上
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
                      犬の匹数
                    </label>
                    <div className='flex items-center gap-2'>
                      <input
                        type='number'
                        min='0'
                        max='10'
                        value={dogCount}
                        onChange={e =>
                          setDogCount(parseInt(e.target.value) || 0)
                        }
                        className='w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500'
                      />
                      <span className='text-gray-600'>匹</span>
                    </div>
                  </div>

                  <div>
                    <label className='block text-sm text-gray-600 mb-1'>
                      猫の匹数
                    </label>
                    <div className='flex items-center gap-2'>
                      <input
                        type='number'
                        min='0'
                        max='10'
                        value={catCount}
                        onChange={e =>
                          setCatCount(parseInt(e.target.value) || 0)
                        }
                        className='w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500'
                      />
                      <span className='text-gray-600'>匹</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

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
                      大人（18-64歳）
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
                      子供（6-17歳）
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
                      乳幼児（0-5歳）
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
                      高齢者（65歳以上）
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

                  <p className='text-xs text-gray-600 mt-2'>
                    合計: {adultCount + childCount + infantCount + elderlyCount}
                    人
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
                  <label className='flex items-center gap-2'>
                    <input
                      type='checkbox'
                      checked={notifyCriticalStock}
                      onChange={e => setNotifyCriticalStock(e.target.checked)}
                      className='rounded'
                    />
                    <span className='text-sm text-gray-600'>
                      在庫切れの通知
                    </span>
                  </label>

                  <label className='flex items-center gap-2'>
                    <input
                      type='checkbox'
                      checked={notifyLowStock}
                      onChange={e => setNotifyLowStock(e.target.checked)}
                      className='rounded'
                    />
                    <span className='text-sm text-gray-600'>
                      在庫不足の通知
                    </span>
                  </label>

                  <label className='flex items-center gap-2'>
                    <input
                      type='checkbox'
                      checked={notifyExpiryNear}
                      onChange={e => setNotifyExpiryNear(e.target.checked)}
                      className='rounded'
                    />
                    <span className='text-sm text-gray-600'>
                      賞味期限が近い通知
                    </span>
                  </label>

                  <label className='flex items-center gap-2'>
                    <input
                      type='checkbox'
                      checked={notifyWeeklyReport}
                      onChange={e => setNotifyWeeklyReport(e.target.checked)}
                      className='rounded'
                    />
                    <span className='text-sm text-gray-600'>
                      週次レポートの通知
                    </span>
                  </label>
                </div>
              )}
            </div>

            {/* レベル設定 */}
            <div className='mb-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                レベル設定
              </h3>
              <div className='space-y-3'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    レベル
                  </label>
                  <div className='space-y-2'>
                    <label className='flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50'>
                      <input
                        type='radio'
                        name='stockLevel'
                        value='beginner'
                        checked={stockLevel === 'beginner'}
                        onChange={e =>
                          setStockLevel(e.target.value as 'beginner')
                        }
                        className='mr-3'
                      />
                      <div>
                        <div className='flex items-center gap-2'>
                          <div className='font-semibold'>最小限（1週間）</div>
                        </div>
                        <p className='text-sm text-gray-600 mt-1'>
                          まずはこれだけ！基本的な3カテゴリ（米・パン、飲料、缶詰）
                        </p>
                      </div>
                    </label>

                    <label className='flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50'>
                      <input
                        type='radio'
                        name='stockLevel'
                        value='standard'
                        checked={stockLevel === 'standard'}
                        onChange={e =>
                          setStockLevel(e.target.value as 'standard')
                        }
                        className='mr-3'
                      />
                      <div>
                        <div className='flex items-center gap-2'>
                          <div className='font-semibold'>標準（2週間）</div>
                        </div>
                        <p className='text-sm text-gray-600 mt-1'>
                          バランス良く備蓄。推奨レベル（5カテゴリ）
                        </p>
                      </div>
                    </label>

                    <label className='flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50'>
                      <input
                        type='radio'
                        name='stockLevel'
                        value='advanced'
                        checked={stockLevel === 'advanced'}
                        onChange={e =>
                          setStockLevel(e.target.value as 'advanced')
                        }
                        className='mr-3'
                      />
                      <div>
                        <div className='flex items-center gap-2'>
                          <div className='font-semibold'>充実（1ヶ月）</div>
                        </div>
                        <p className='text-sm text-gray-600 mt-1'>
                          本格的な備蓄。全カテゴリを推奨（25カテゴリ）
                        </p>
                      </div>
                    </label>
                  </div>
                  <p className='text-xs text-gray-500 mt-2'>
                    ※ レベルに応じて推奨カテゴリが変わります
                  </p>
                </div>
              </div>
            </div>

            {/* メッセージ表示 */}
            {message && (
              <div
                className={`p-3 rounded-md ${
                  message.type === 'success'
                    ? 'bg-green-100 text-green-300'
                    : 'bg-red-100 text-red-300'
                }`}
              >
                {message.text}
              </div>
            )}

            <button
              onClick={handleUpdateStockSettings}
              disabled={updatingStockSettings}
              className='w-full px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm'
            >
              {updatingStockSettings ? '保存中...' : '設定を保存'}
            </button>
          </div>
        )}
      </div>
      {/* 年齢別チェックリスト */}
      {checklists.ageGroups.map(group => (
        <div key={group.ageGroup} className='bg-white border rounded-lg p-4'>
          <div className='flex items-center justify-between mb-3'>
            <h4 className='text-lg font-medium text-gray-900'>
              {AGE_GROUP_EMOJIS[group.ageGroup]}{' '}
              {AGE_GROUP_LABELS[group.ageGroup]}
              <span className='text-sm text-gray-600 ml-2'>
                ({group.count}人)
              </span>
            </h4>
            <div className='text-sm text-gray-600'>
              進捗: {getProgress(group.checkedItems, group.items.length)}%
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
            {group.items.map(item => (
              <label
                key={item.id}
                className='flex items-center space-x-2 p-2 hover:bg-gray-50 rounded'
              >
                <input
                  type='checkbox'
                  checked={group.checkedItems.includes(item.id)}
                  onChange={() => toggleItem('age', group.ageGroup, item.id)}
                  className='rounded'
                />
                <span
                  className={`text-sm ${item.isEssential ? 'font-medium text-gray-900' : 'text-gray-600'}`}
                >
                  {item.name}
                  {item.isEssential && (
                    <span className='text-red-500 ml-1'>*</span>
                  )}
                </span>
              </label>
            ))}
          </div>
        </div>
      ))}
      {/* ペット別チェックリスト */}
      {checklists.pets.map(pet => (
        <div key={pet.petType} className='bg-white border rounded-lg p-4'>
          <div className='flex items-center justify-between mb-3'>
            <h4 className='text-lg font-medium text-gray-900'>
              {PET_TYPE_EMOJIS[pet.petType]} {PET_TYPE_LABELS[pet.petType]}
              <span className='text-sm text-gray-600 ml-2'>
                ({pet.count}匹)
              </span>
            </h4>
            <div className='text-sm text-gray-600'>
              進捗: {getProgress(pet.checkedItems, pet.items.length)}%
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
            {pet.items.map(item => (
              <label
                key={item.id}
                className='flex items-center space-x-2 p-2 hover:bg-gray-50 rounded'
              >
                <input
                  type='checkbox'
                  checked={pet.checkedItems.includes(item.id)}
                  onChange={() => toggleItem('pet', pet.petType, item.id)}
                  className='rounded'
                />
                <span
                  className={`text-sm ${item.isEssential ? 'font-medium text-gray-900' : 'text-gray-600'}`}
                >
                  {item.name}
                  {item.isEssential && (
                    <span className='text-red-500 ml-1'>*</span>
                  )}
                </span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
