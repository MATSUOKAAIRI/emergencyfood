// components/supplies/MissingCategoriesAlert.tsx
'use client';
import Link from 'next/link';
import { useState } from 'react';

import type { Supply, TeamStockSettings } from '@/types';
import { aggregateStockStatus } from '@/utils/stockCalculator';
import {
  getLevelProgress,
  getMissingCategoriesByPriorityAndLevel,
  getRecommendedItems,
  STOCK_LEVELS,
  type StockLevel,
} from '@/utils/stockRecommendations';

interface MissingCategoriesAlertProps {
  supplies: Supply[];
  teamId: string;
  teamStockSettings?: TeamStockSettings;
}

export function MissingCategoriesAlert({
  supplies,
  teamId,
  teamStockSettings,
}: MissingCategoriesAlertProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);
  const userSupplies = supplies.map(s => ({
    category: s.category,
    quantity: s.quantity,
  }));

  const stockLevel = (teamStockSettings?.stockLevel ||
    'standard') as StockLevel;
  const missing = getMissingCategoriesByPriorityAndLevel(
    userSupplies,
    stockLevel
  );
  const progress = getLevelProgress(userSupplies, stockLevel);
  const aggregate = aggregateStockStatus(supplies, teamStockSettings);
  const totalMissing =
    missing.essential.length +
    missing.important.length +
    missing.recommended.length;

  if (totalMissing === 0) {
    return (
      <div className='mb-6'>
        <div className='p-4 bg-green-50 border border-green-200 rounded-lg'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <div>
                <p className='text-green-800 font-semibold'>
                  {progress.levelConfig.name}を達成しました！
                </p>
                <p className='text-sm text-green-600'>
                  達成率 {aggregate.overallPercentage}%
                  {aggregate.out > 0 && ` • 在庫切れ ${aggregate.out}品目`}
                  {aggregate.critical + aggregate.low > 0 &&
                    ` • 少ない ${aggregate.critical + aggregate.low}品目`}
                </p>
                <p className='text-xs text-green-500'>
                  {progress.progressPercentage}% 完了（
                  {progress.stockedCategories}/{progress.totalCategories}
                  カテゴリ）
                  {progress.nextLevel && (
                    <>
                      {' '}
                      • 次のレベル「{STOCK_LEVELS[progress.nextLevel].name}
                      」に挑戦してみませんか？
                    </>
                  )}
                </p>
              </div>
            </div>
            {teamStockSettings && (
              <span className='text-xs text-gray-600 bg-white px-2 py-1 rounded hidden sm:inline'>
                {teamStockSettings.householdSize}人・
                {teamStockSettings.stockDays}日分目標
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='mb-6'>
      {/* 統合された推奨カテゴリアラート */}
      <div className='p-4 bg-gray-50 border border-gray-300 rounded-lg'>
        <div
          className='flex items-center justify-between cursor-pointer'
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className='flex items-center gap-2'>
            <div>
              <p className='font-semibold text-gray-900'>
                ＊{progress.levelConfig.name}の推奨（{totalMissing}件）
              </p>
              <p className='text-sm text-gray-600'>
                達成率 {aggregate.overallPercentage}%
                {aggregate.out > 0 && ` • 在庫切れ ${aggregate.out}品目`}
                {aggregate.critical + aggregate.low > 0 &&
                  ` • 少ない ${aggregate.critical + aggregate.low}品目`}
              </p>
              <p className='text-xs text-gray-500'>
                {progress.progressPercentage}% 完了（
                {progress.stockedCategories}/{progress.totalCategories}
                カテゴリ） • {progress.levelConfig.description}
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            {teamStockSettings && (
              <span className='text-xs text-gray-600 bg-white px-2 py-1 rounded hidden sm:inline'>
                {teamStockSettings.householdSize}人・
                {teamStockSettings.stockDays}日分目標
              </span>
            )}
            <svg
              className={`w-5 h-5 text-gray-600 transition-transform ${
                isExpanded ? 'transform rotate-180' : ''
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
          </div>
        </div>

        {isExpanded && (
          <div className='mt-4 space-y-4'>
            {missing.essential.length > 0 && (
              <div>
                <h4 className='font-semibold text-red-700 mb-2 flex items-center gap-2'>
                  <span>必須カテゴリ（{missing.essential.length}件）</span>
                </h4>
                <div className='space-y-2'>
                  {missing.essential.map(rec => (
                    <div
                      key={rec.category}
                      className='p-3 bg-white border border-red-200 rounded-md'
                    >
                      <div className='flex items-start justify-between'>
                        <div className='flex-1'>
                          <p className='font-semibold text-gray-900'>
                            {rec.category}
                          </p>
                          <p className='text-sm text-gray-600 mt-1'>
                            {rec.description}
                          </p>
                          <div className='mt-2'>
                            <p className='text-xs text-gray-500 font-semibold mb-1'>
                              推奨商品例:
                            </p>
                            <div className='flex flex-wrap gap-1'>
                              {getRecommendedItems(rec.category).map(item => (
                                <span
                                  key={item}
                                  className='text-xs bg-gray-100 px-2 py-1 rounded'
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <Link
                          href={`/supplies/add?teamId=${teamId}&category=${encodeURIComponent(rec.category)}`}
                          className='ml-3 px-3 py-1 bg-orange-400 text-white text-sm rounded hover:bg-orange-500 whitespace-nowrap'
                        >
                          追加
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {missing.important.length > 0 && (
              <div>
                <h4 className='font-semibold text-yellow-700 mb-2 flex items-center gap-2'>
                  <span>重要カテゴリ（{missing.important.length}件）</span>
                </h4>
                <div className='space-y-2'>
                  {missing.important.map(rec => (
                    <div
                      key={rec.category}
                      className='p-3 bg-white border border-yellow-200 rounded-md'
                    >
                      <div className='flex items-start justify-between'>
                        <div className='flex-1'>
                          <p className='font-semibold text-gray-900'>
                            {rec.category}
                          </p>
                          <p className='text-sm text-gray-600 mt-1'>
                            {rec.description}
                          </p>
                          <div className='mt-2'>
                            <p className='text-xs text-gray-500 font-semibold mb-1'>
                              推奨商品例:
                            </p>
                            <div className='flex flex-wrap gap-1'>
                              {getRecommendedItems(rec.category).map(item => (
                                <span
                                  key={item}
                                  className='text-xs bg-gray-100 px-2 py-1 rounded'
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <Link
                          href={`/supplies/add?teamId=${teamId}&category=${encodeURIComponent(rec.category)}`}
                          className='ml-3 px-3 py-1 bg-orange-400 text-white text-sm rounded hover:bg-orange-500 whitespace-nowrap'
                        >
                          追加
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {missing.recommended.length > 0 && (
              <details>
                <summary className='font-semibold text-gray-700 cursor-pointer flex items-center gap-2 hover:text-gray-900'>
                  <span>推奨カテゴリ（{missing.recommended.length}件）</span>
                </summary>
                <div className='mt-2 space-y-2'>
                  {missing.recommended.map(rec => (
                    <div
                      key={rec.category}
                      className='p-3 bg-white border border-gray-200 rounded-md'
                    >
                      <div className='flex items-start justify-between'>
                        <div className='flex-1'>
                          <p className='font-semibold text-gray-900'>
                            {rec.category}
                          </p>
                          <p className='text-sm text-gray-600 mt-1'>
                            {rec.description}
                          </p>
                          <div className='mt-2'>
                            <p className='text-xs text-gray-500 font-semibold mb-1'>
                              推奨商品例:
                            </p>
                            <div className='flex flex-wrap gap-1'>
                              {getRecommendedItems(rec.category).map(item => (
                                <span
                                  key={item}
                                  className='text-xs bg-gray-100 px-2 py-1 rounded'
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <Link
                          href={`/supplies/add?teamId=${teamId}&category=${encodeURIComponent(rec.category)}`}
                          className='ml-3 px-3 py-1 bg-orange-400 text-white text-sm rounded hover:bg-orange-500 whitespace-nowrap'
                        >
                          追加
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            )}

            {/* レベルアップの提案 */}
            {progress.nextLevel && (
              <div className='mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md'>
                <p className='text-gray-800 font-semibold text-sm'>
                  レベルアップの準備ができています！
                </p>
                <p className='text-gray-600 text-xs mt-1'>
                  次のレベル「{STOCK_LEVELS[progress.nextLevel].name}
                  」に挑戦してみませんか？
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
